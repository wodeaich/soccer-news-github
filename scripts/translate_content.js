/**
 * 6语言翻译脚本 - 将英语新闻翻译为其余5种语言并写入后端
 * 用法: node scripts/translate_content.js [article_id]
 *   不传 article_id 则翻译所有未翻译文章
 *
 */

require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE = process.env.MINIMAX_BASE || "https://api.minimaxi.chat";
const BACKEND_URL = process.env.PROD_API_URL || "https://api.tapmygame.com";
const SITE_ID = process.env.SITE_ID || "soccerins";

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

async function getUntranslatedArticles(articleId) {
  const url = articleId
    ? `${BACKEND_URL}/api/article/detail?site_id=${SITE_ID}&id=${articleId}`
    : `${BACKEND_URL}/api/article/untranslated?site_id=${SITE_ID}&lang=en&limit=10`;

  const { data } = await axios.get(url);
  if (articleId) {
    return data.data ? [data.data] : [];
  }
  return data.list || [];
}

async function translateArticle(article) {
  console.log(`\n[translate] 翻译文章: "${article.title}" (ID: ${article.id})`);
  const translations = [];

  for (const lang of LANGUAGES) {
    try {
      console.log(`  → ${lang.name}...`);
      const [title, content, summary] = await Promise.all([
        translateText(article.title, lang),
        translateText(article.content, lang),
        translateText(article.summary || article.content.slice(0, 150), lang),
      ]);

      translations.push({
        article_id: article.id,
        lang: lang.code,
        title,
        content,
        summary,
        translated_at: new Date().toISOString(),
      });

      console.log(`  ✅ ${lang.name} 完成`);
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error(`  ❌ ${lang.name} 失败:`, err.message);
    }
  }

  // 批量上传翻译
  if (translations.length > 0) {
    await axios.post(`${BACKEND_URL}/api/article/translations/sync`, {
      site_id: SITE_ID,
      translations,
    });
    console.log(`  📤 已上传 ${translations.length} 个语言版本`);
  }

  return translations;
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
    const results = await translateArticle(article);
    total += results.length;
  }

  console.log(`\n[translate] ✅ 完成！共生成 ${total} 个翻译版本`);
}

run().catch((err) => {
  console.error("[translate] 致命错误:", err.message);
  process.exit(1);
});
