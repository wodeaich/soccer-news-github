/**
 * AI新闻生成脚本 - 三步流程：
 *   Step 1: 从 API-Football 拉今日/近期世界杯赛事
 *   Step 2: 以赛事数据为上下文，调 MiniMax 生成赛前预测或赛后综述文章
 *   Step 3: 写入 content/articles/<id>.json（纯静态，无后台）
 *
 * 用法:
 *   node scripts/generate_news.js            # 自动处理今日赛事
 *   node scripts/generate_news.js --days 3   # 拉未来3天 + 过去3天赛事
 *
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { publishArticle: biPublish } = require("./lib/publish");

const SITE_ID = process.env.RELEASE_SITE_ID || "composoccer";
const DRY_RUN = process.argv.includes("--dry-run");

// ─── 配置 ────────────────────────────────────────────────────────────────────
const FOOTBALL_KEY  = process.env.API_FOOTBALL_KEY;
const FOOTBALL_BASE = process.env.API_FOOTBALL_BASE || "https://v3.football.api-sports.io";
const LEAGUE_ID     = process.env.WORLD_CUP_LEAGUE_ID || 1;
const SEASON        = process.env.WORLD_CUP_SEASON || 2026;

const MINIMAX_KEY   = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE  = process.env.MINIMAX_BASE || "https://api.minimax.io";
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "MiniMax-M2.7";

// 已生成文章的缓存（避免同一场比赛重复生成）
const CACHE_FILE = path.join(__dirname, ".news_cache.json");

// ─── HTTP 客户端 ──────────────────────────────────────────────────────────────
const apif = axios.create({
  baseURL: FOOTBALL_BASE,
  headers: { "x-apisports-key": FOOTBALL_KEY },
  timeout: 15000,
});

const minimaxClient = axios.create({
  baseURL: MINIMAX_BASE,
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${MINIMAX_KEY}` },
  timeout: 90000,
});

// ─── 缓存工具 ─────────────────────────────────────────────────────────────────
function loadCache() {
  try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); }
  catch { return { generated: [] }; }
}
function saveCache(c) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2));
}

// ─── Step 1: 拉赛事数据 ───────────────────────────────────────────────────────
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
      console.log(`[Step1] ${date}: ${data.response.length} 场`);
    }
  }
  return fixtures;
}

// ─── Step 2: MiniMax 生成文章 ─────────────────────────────────────────────────
function buildPrompt(fixture) {
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const date = fixture.fixture.date.slice(0, 10);
  const venue = fixture.fixture.venue?.name || "TBD";
  const round = fixture.league.round || "World Cup 2026";
  const status = fixture.fixture.status?.short;
  const isFinished = ["FT", "AET", "PEN"].includes(status);

  if (isFinished) {
    const scoreH = fixture.goals.home ?? 0;
    const scoreA = fixture.goals.away ?? 0;
    const winner = scoreH > scoreA ? home : scoreH < scoreA ? away : null;
    return {
      type: "review",
      title: `Match Review: ${home} ${scoreH}-${scoreA} ${away} | World Cup 2026`,
      prompt: `Write a professional 350-word match review for compsoccer.com about this World Cup 2026 match:
- ${home} vs ${away}, played on ${date} at ${venue} (${round})
- Final score: ${home} ${scoreH} - ${scoreA} ${away}
${winner ? `- Winner: ${winner}` : "- Result: Draw"}

Cover: key moments, standout players, tactical analysis, what this result means for group standings.
Format: engaging match review in clear English paragraphs. No markdown headers. No bullet points.`,
    };
  } else {
    return {
      type: "preview",
      title: `Match Preview: ${home} vs ${away} | World Cup 2026`,
      prompt: `Write a professional 350-word match preview for compsoccer.com about this upcoming World Cup 2026 match:
- ${home} vs ${away}
- Date: ${date}, Venue: ${venue} (${round})

Cover: team form, key players to watch, tactical matchup, prediction and expected outcome.
Format: engaging preview in clear English paragraphs. No markdown headers. No bullet points.`,
    };
  }
}

async function generateArticle(fixture) {
  const { type, title, prompt } = buildPrompt(fixture);
  const home = fixture.teams.home.name;
  const away = fixture.teams.away.name;
  const fixtureId = fixture.fixture.id;

  console.log(`[Step2] 生成 ${type}: ${home} vs ${away} (ID:${fixtureId})`);

  const res = await minimaxClient.post(
    `/v1/chat/completions`,
    {
      model: MINIMAX_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a professional football journalist for compsoccer.com. Write factual, engaging World Cup 2026 articles in fluent English.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 700,
      temperature: 0.7,
    }
  );

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

// ─── Step 3: 录入后台并绑定渠道上架 ──────────────────────────────────────────
async function publishArticle(article) {
  const articleId = await biPublish(
    {
      slug: article.slug,
      language: article.lang || "en",
      title: article.title,
      summary: article.summary,
      content: article.content,
      cover: article.cover_image || "",
      keywords: (article.tags || []).join(","),
      article_type: article.article_type,
    },
    { siteId: SITE_ID, dryRun: DRY_RUN }
  );
  console.log(`[Step3] ✅ 已录入后台并上架，article_id=${articleId}`);
  return articleId;
}

// ─── 主流程 ───────────────────────────────────────────────────────────────────
async function run() {
  const args = process.argv.slice(2);
  const daysIdx = args.indexOf("--days");
  const days = daysIdx !== -1 ? parseInt(args[daysIdx + 1]) || 1 : 1;

  console.log("=".repeat(50));
  console.log(`[generate_news] 开始，覆盖今日前后 ${days} 天的赛事`);
  console.log("=".repeat(50));

  const cache = loadCache();

  // Step 1
  console.log("\n【Step 1】拉取赛事数据...");
  const fixtures = await fetchFixtures(days);
  console.log(`共 ${fixtures.length} 场赛事`);

  if (fixtures.length === 0) {
    console.log("暂无赛事，退出");
    return;
  }

  // 过滤已生成
  const pending = fixtures.filter(
    (f) => !cache.generated.includes(f.fixture.id)
  );
  console.log(`其中 ${pending.length} 场尚未生成文章`);

  let success = 0;
  for (const fixture of pending) {
    try {
      // Step 2
      const article = await generateArticle(fixture);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3
      await publishArticle(article);

      cache.generated.push(fixture.fixture.id);
      saveCache(cache);
      success++;
    } catch (err) {
      const home = fixture.teams.home.name;
      const away = fixture.teams.away.name;
      console.error(`❌ ${home} vs ${away} 失败:`, err.message);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`[generate_news] 完成！成功 ${success}/${pending.length} 篇`);
  console.log("=".repeat(50));
}

run().catch((err) => {
  console.error("[generate_news] 致命错误:", err.message);
  process.exit(1);
});
