/**
 * CompSoccer 文章生成全流程管道
 *
 * 三种模式：
 *   --auto              自动处理今日（及前后1天）赛事，跳过已生成
 *   --fixture <id>      指定单场赛事 fixture_id
 *   --manual            手动指定文章内容（配合 --title --content --type）
 *
 * 所有模式完成英文文章后立即翻译为5种语言并上架。
 *
 * 用法示例：
 *   node scripts/pipeline.js --auto
 *   node scripts/pipeline.js --fixture 1234567
 *   node scripts/pipeline.js --manual --title "World Cup 2026 Preview" --content "..." --type preview
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const store = require("./lib/store");

// ─── 配置 ────────────────────────────────────────────────────────────────────
const FOOTBALL_KEY  = process.env.API_FOOTBALL_KEY;
const FOOTBALL_BASE = process.env.API_FOOTBALL_BASE || "https://v3.football.api-sports.io";
const LEAGUE_ID     = process.env.WORLD_CUP_LEAGUE_ID || 1;
const SEASON        = process.env.WORLD_CUP_SEASON || 2026;

const MINIMAX_KEY   = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE  = process.env.MINIMAX_BASE || "https://api.minimaxi.chat";

const CACHE_FILE    = path.join(__dirname, ".news_cache.json");

const TARGET_LANGS = [
  { code: "es", name: "Spanish",    note: "Latin American Spanish" },
  { code: "pt", name: "Portuguese", note: "Brazilian Portuguese" },
  { code: "ar", name: "Arabic",     note: "Modern Standard Arabic" },
  { code: "ja", name: "Japanese",   note: "natural Japanese" },
  { code: "ko", name: "Korean",     note: "natural Korean" },
];

// ─── HTTP 客户端 ──────────────────────────────────────────────────────────────
const apif = axios.create({
  baseURL: FOOTBALL_BASE,
  headers: { "x-apisports-key": FOOTBALL_KEY },
  timeout: 15000,
});

const minimax = axios.create({
  baseURL: MINIMAX_BASE,
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${MINIMAX_KEY}` },
  timeout: 90000,
});

// ─── 缓存 ─────────────────────────────────────────────────────────────────────
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); }
  catch { return { generated: [] }; }
}
function saveCache(c) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2));
}

// ─── Step 1: 拉赛事（auto 模式）──────────────────────────────────────────────
async function fetchFixtures(days = 1) {
  const dates = [];
  for (let i = -days; i <= days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  const fixtures = [];
  for (const date of dates) {
    const { data } = await apif.get("/fixtures", {
      params: { league: LEAGUE_ID, season: SEASON, date },
    });
    if (data.response?.length) {
      fixtures.push(...data.response);
      console.log(`  [API-Football] ${date}: ${data.response.length} 场`);
    }
  }
  return fixtures;
}

async function fetchFixtureById(fixtureId) {
  const { data } = await apif.get("/fixtures", { params: { id: fixtureId } });
  if (!data.response?.length) throw new Error(`Fixture ${fixtureId} 未找到`);
  return data.response[0];
}

// ─── Step 2: AI 生成英文文章 ──────────────────────────────────────────────────
function buildPrompt(fixture) {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const date = fixture.fixture.date.slice(0, 10);
  const venue = fixture.fixture.venue?.name || "TBD";
  const round = fixture.league.round || "World Cup 2026";
  const status = fixture.fixture.status?.short;
  const isFinished = ["FT", "AET", "PEN"].includes(status);

  if (isFinished) {
    const sH = fixture.goals.home ?? 0;
    const sA = fixture.goals.away ?? 0;
    const winner = sH > sA ? home : sH < sA ? away : null;
    return {
      type: "review",
      title: `Match Review: ${home} ${sH}-${sA} ${away} | World Cup 2026`,
      prompt: `Write a professional 350-word match review for compsoccer.com about this World Cup 2026 match:
- ${home} vs ${away}, played on ${date} at ${venue} (${round})
- Final score: ${home} ${sH} - ${sA} ${away}
${winner ? `- Winner: ${winner}` : "- Result: Draw"}

Cover: key moments, standout players, tactical analysis, group stage implications.
Format: engaging paragraphs in clear English. No markdown headers. No bullet points.`,
    };
  }
  return {
    type: "preview",
    title: `Match Preview: ${home} vs ${away} | World Cup 2026`,
    prompt: `Write a professional 350-word match preview for compsoccer.com about this upcoming World Cup 2026 match:
- ${home} vs ${away}, Date: ${date}, Venue: ${venue} (${round})

Cover: team form, key players to watch, tactical matchup, prediction.
Format: engaging paragraphs in clear English. No markdown headers. No bullet points.`,
  };
}

async function generateFromFixture(fixture) {
  const { type, title, prompt } = buildPrompt(fixture);
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const fixtureId = fixture.fixture.id;

  console.log(`  [MiniMax] 生成 ${type}: ${home} vs ${away} (ID:${fixtureId})`);

  const res = await minimax.post("/v1/text/chatcompletion_v2", {
    model: "MiniMax-Text-01",
    messages: [
      {
        role: "system",
        content: "You are a professional football journalist for compsoccer.com. Write factual, engaging World Cup 2026 articles in fluent English.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 700,
    temperature: 0.7,
  });

  const content = res.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("MiniMax 返回空内容");

  const summary = content.split(/[.。]/)[0].trim() + ".";
  const slug = `${home.toLowerCase().replace(/\s+/g, "-")}-vs-${away.toLowerCase().replace(/\s+/g, "-")}-${fixtureId}`;

  return {
    fixture_id: fixtureId,
    article_type: type,
    title,
    content,
    summary,
    slug,
    cover_image: fixture.teams.home.logo || "",
    tags: ["world-cup-2026", home.toLowerCase(), away.toLowerCase()],
    lang: "en",
  };
}

function generateFromManual(args) {
  const titleIdx = args.indexOf("--title");
  const contentIdx = args.indexOf("--content");
  const typeIdx = args.indexOf("--type");

  if (titleIdx === -1 || contentIdx === -1) {
    throw new Error("--manual 模式需要 --title 和 --content 参数");
  }

  const title = args[titleIdx + 1];
  const content = args[contentIdx + 1];
  const type = typeIdx !== -1 ? args[typeIdx + 1] : "news";

  const summary = content.split(/[.。]/)[0].trim() + ".";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    + "-" + Date.now();

  return {
    fixture_id: null,
    article_type: type,
    title,
    content,
    summary,
    slug,
    cover_image: "",
    tags: ["world-cup-2026"],
    lang: "en",
  };
}

// ─── Step 3: 写入英文文章 ─────────────────────────────────────────────────────
function publishArticle(article) {
  const articleId = store.upsertArticleEn(article);
  console.log(`  [Content] ✅ 英文文章已写入 content/articles/${articleId}.json`);
  return articleId;
}

// ─── Step 4: 翻译并上架多语言 ────────────────────────────────────────────────
async function translateText(text, lang) {
  const response = await minimax.post("/v1/text/chatcompletion_v2", {
    model: "MiniMax-Text-01",
    messages: [
      {
        role: "system",
        content: `You are a professional football content translator. Translate the given English football article into ${lang.name} (${lang.note}).
Rules:
- Keep proper nouns (player names, team names, venues) in their commonly used ${lang.name} form
- Maintain paragraph structure
- Only output the translated text, no explanations`,
      },
      { role: "user", content: text },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });
  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${lang.name} 翻译失败：MiniMax 返回空内容`);
  return content.trim();
}

async function translateAndPublish(article, articleId) {
  console.log(`\n  [Translate] 开始翻译 5 种语言...`);
  const translations = [];

  for (const lang of TARGET_LANGS) {
    try {
      console.log(`    → ${lang.name}...`);
      const [title, content, summary] = await Promise.all([
        translateText(article.title, lang),
        translateText(article.content, lang),
        translateText(article.summary, lang),
      ]);

      store.addTranslation(articleId, lang.code, { title, summary, content });
      translations.push(lang.code);
      console.log(`    ✅ ${lang.name} 完成`);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error(`    ❌ ${lang.name} 失败: ${err.message}`);
    }
  }

  if (translations.length > 0) {
    console.log(`  [Content] 📦 已写入 ${translations.length} 个语言版本到 content/articles/${articleId}.json`);
  }

  return translations.length;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────
async function run() {
  const args = process.argv.slice(2);

  const mode = args.includes("--auto") ? "auto"
    : args.includes("--fixture") ? "fixture"
    : args.includes("--manual") ? "manual"
    : "auto";

  console.log("=".repeat(60));
  console.log(`[pipeline] 模式: ${mode}`);
  console.log("=".repeat(60));

  const cache = loadCache();
  const articles = [];

  if (mode === "auto") {
    console.log("\n【Step 1】拉取赛事...");
    const fixtures = await fetchFixtures(1);
    console.log(`共 ${fixtures.length} 场，过滤已生成...`);
    const pending = fixtures.filter((f) => !cache.generated.includes(f.fixture.id));
    console.log(`待处理: ${pending.length} 场`);

    for (const fixture of pending) {
      try {
        const article = await generateFromFixture(fixture);
        articles.push({ article, fixtureId: fixture.fixture.id });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`  ❌ 生成失败: ${err.message}`);
      }
    }

  } else if (mode === "fixture") {
    const fixtureIdx = args.indexOf("--fixture");
    const fixtureId = parseInt(args[fixtureIdx + 1]);
    if (!fixtureId) throw new Error("--fixture 需要指定 fixture_id");

    console.log(`\n【Step 1】拉取赛事 ID: ${fixtureId}`);
    const fixture = await fetchFixtureById(fixtureId);
    const article = await generateFromFixture(fixture);
    articles.push({ article, fixtureId });

  } else if (mode === "manual") {
    console.log("\n【Step 1】手动文章模式");
    const article = await generateFromManual(args);
    articles.push({ article, fixtureId: null });
  }

  if (articles.length === 0) {
    console.log("\n没有需要处理的文章，退出。");
    return;
  }

  let successCount = 0;
  let translationCount = 0;

  for (const { article, fixtureId } of articles) {
    try {
      console.log(`\n▶ 处理: "${article.title}"`);

      console.log("\n【Step 2】上架英文文章...");
      const articleId = await publishArticle(article);

      console.log("\n【Step 3】翻译并上架多语言...");
      const langs = await translateAndPublish(article, articleId);
      translationCount += langs;

      if (fixtureId) {
        cache.generated.push(fixtureId);
        saveCache(cache);
      }
      successCount++;
    } catch (err) {
      console.error(`\n❌ 处理失败: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`[pipeline] 完成！`);
  console.log(`  文章: ${successCount}/${articles.length} 篇成功`);
  console.log(`  翻译: ${translationCount} 个语言版本`);
  console.log("=".repeat(60));
}

run().catch((err) => {
  console.error("[pipeline] 致命错误:", err.message);
  process.exit(1);
});
