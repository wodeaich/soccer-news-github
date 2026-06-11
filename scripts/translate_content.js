/**
 * 6语言翻译脚本 - 将英语新闻翻译为其余5种语言并写入后端
 * 用法: node scripts/translate_content.js [article_id]
 *   不传 article_id 则翻译所有未翻译文章
 *
 */

require("dotenv").config();
const axios = require("axios");
const store = require("./lib/store");

const API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE = process.env.MINIMAX_BASE || "https://api.minimaxi.chat";

const LANGUAGES = [
  { code: "es", name: "Spanish", note: "Latin American Spanish" },
  { code: "pt", name: "Portuguese", note: "Brazilian Portuguese" },
  { code: "ar", name: "Arabic", note: "Modern Standard Arabic" },
  { code: "ja", name: "Japanese", note: "natural Japanese" },
  { code: "ko", name: "Korean", note: "natural Korean" },
];

const minimax = axios.create({
  baseURL: MINIMAX_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
  timeout: 60000,
});

async function translateText(text, targetLang) {
  const response = await minimax.post(`/v1/text/chatcompletion_v2`, {
    model: "MiniMax-Text-01",
    messages: [
      {
        role: "system",
        content: `You are a professional football content translator. Translate the given English football article into ${targetLang.name} (${targetLang.note}).
Rules:
- Keep proper nouns (player names, team names, venues) in their commonly used ${targetLang.name} form
- Maintain the same paragraph structure
- Ensure the translation reads naturally and engagingly
- Only output the translated text, no explanations`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    max_tokens: 800,
    temperature: 0.3,
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("MiniMax 返回空内容");
  return content.trim();
}

function getUntranslatedArticles(articleId) {
  if (articleId) {
    const a = store.readArticle(articleId);
    return a ? [a] : [];
  }
  return store.listArticlesMissingLang(LANGUAGES.map((l) => l.code)).slice(0, 10);
}

async function translateArticle(article) {
  const en = (article.i18n && article.i18n.en) || {};
  console.log(`\n[translate] 翻译文章: "${en.title}" (ID: ${article.id})`);
  let done = 0;

  for (const lang of LANGUAGES) {
    // 已有该语言译文则跳过
    if (article.i18n && article.i18n[lang.code]) continue;
    try {
      console.log(`  → ${lang.name}...`);
      const [title, content, summary] = await Promise.all([
        translateText(en.title, lang),
        translateText(en.content, lang),
        translateText(en.summary || (en.content || "").slice(0, 150), lang),
      ]);

      store.addTranslation(article.id, lang.code, { title, summary, content });
      done++;
      console.log(`  ✅ ${lang.name} 完成`);
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error(`  ❌ ${lang.name} 失败:`, err.message);
    }
  }

  console.log(`  📦 已写入 ${done} 个语言版本到 content/articles/${article.id}.json`);
  return done;
}

async function run() {
  const articleId = process.argv[2] || null;
  const articles = await getUntranslatedArticles(articleId);

  if (articles.length === 0) {
    console.log("[translate] 没有需要翻译的文章");
    return;
  }

  console.log(`[translate] 开始翻译 ${articles.length} 篇文章，每篇 5 种语言`);
  let total = 0;

  for (const article of articles) {
    total += await translateArticle(article);
  }

  console.log(`\n[translate] ✅ 完成！共生成 ${total} 个翻译版本`);
}

run().catch((err) => {
  console.error("[translate] 致命错误:", err.message);
  process.exit(1);
});
