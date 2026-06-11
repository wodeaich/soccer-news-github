/**
 * 内容存储层（纯静态方案）
 *
 * 采集 / 生成脚本统一通过本模块把数据写入仓库的 content/ 目录，
 * 取代原先「POST 到 GO 后台」的做法。构建时由 utils/content.js 读取。
 *
 * 目录约定：
 *   content/matches/schedule.json   { fixtures:[], by_date:{}, updated_at }   ← 整体覆盖
 *   content/matches/results.json    { results:[], updated_at }                ← 按 id 累积合并
 *   content/matches/standings.json  { groups:[], updated_at }                 ← 整体覆盖
 *   content/articles/<id>.json      { id, slug, ..., i18n:{ en:{...}, es:{...} } } ← 逐篇累积
 *
 * 文章 id = slug 末段数字（与页面 news/_slug.vue 的解析方式一致）。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTENT_DIR = path.join(ROOT, "content");
const MATCHES_DIR = path.join(CONTENT_DIR, "matches");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");

function ensureDirs() {
  fs.mkdirSync(MATCHES_DIR, { recursive: true });
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  ensureDirs();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/** slug 末段即 id（如 brazil-vs-france-200123 → 200123） */
function idFromSlug(slug) {
  return String(slug || "").split("-").pop();
}

// ─── 赛程 ────────────────────────────────────────────────────────────────────
function writeSchedule(fixtures, byDate) {
  const file = path.join(MATCHES_DIR, "schedule.json");
  writeJSON(file, {
    fixtures: fixtures || [],
    by_date: byDate || {},
    updated_at: new Date().toISOString(),
  });
  return fixtures.length;
}

// ─── 赛果（按 id 累积合并，新结果覆盖旧的）────────────────────────────────────
function mergeResults(newResults) {
  const file = path.join(MATCHES_DIR, "results.json");
  const prev = readJSON(file, { results: [] });
  const byId = new Map((prev.results || []).map((r) => [r.id, r]));
  for (const r of newResults) byId.set(r.id, r);
  const merged = [...byId.values()].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  writeJSON(file, { results: merged, updated_at: new Date().toISOString() });
  return merged.length;
}

// ─── 积分榜 ──────────────────────────────────────────────────────────────────
function writeStandings(groups) {
  const file = path.join(MATCHES_DIR, "standings.json");
  writeJSON(file, { groups: groups || [], updated_at: new Date().toISOString() });
  return (groups || []).length;
}

// ─── 文章主记录（英文）─────────────────────────────────────────────────────────
/**
 * article: { fixture_id, article_type, title, content, summary, slug, cover_image, tags }
 * 写入/更新 content/articles/<id>.json 的 i18n.en
 */
function upsertArticleEn(article) {
  const id = article.fixture_id != null ? String(article.fixture_id) : idFromSlug(article.slug);
  const file = path.join(ARTICLES_DIR, `${id}.json`);
  const prev = readJSON(file, null) || {
    id,
    slug: article.slug,
    fixture_id: article.fixture_id ?? null,
    article_type: article.article_type || "news",
    cover: article.cover_image || "",
    keywords: (article.tags || []).join(","),
    published_at: new Date().toISOString(),
    i18n: {},
  };
  prev.slug = article.slug;
  prev.cover = article.cover_image || prev.cover || "";
  prev.article_type = article.article_type || prev.article_type;
  prev.keywords = (article.tags || []).join(",") || prev.keywords;
  prev.i18n = prev.i18n || {};
  prev.i18n.en = {
    title: article.title,
    summary: article.summary,
    content: article.content,
  };
  writeJSON(file, prev);
  return id;
}

/** 给已存在文章追加某语言译文 */
function addTranslation(id, langCode, { title, summary, content }) {
  const file = path.join(ARTICLES_DIR, `${String(id)}.json`);
  const art = readJSON(file, null);
  if (!art) throw new Error(`文章 ${id} 不存在，无法写入 ${langCode} 译文`);
  art.i18n = art.i18n || {};
  art.i18n[langCode] = { title, summary, content };
  writeJSON(file, art);
  return id;
}

/** 列出所有文章主记录 */
function listArticles() {
  ensureDirs();
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJSON(path.join(ARTICLES_DIR, f), null))
    .filter(Boolean);
}

/** 读取单篇文章主记录 */
function readArticle(id) {
  return readJSON(path.join(ARTICLES_DIR, `${String(id)}.json`), null);
}

/** 列出缺某语言译文的文章（用于 translate 脚本） */
function listArticlesMissingLang(langCodes) {
  return listArticles().filter((a) => {
    const have = Object.keys(a.i18n || {});
    return langCodes.some((c) => !have.includes(c));
  });
}

module.exports = {
  CONTENT_DIR,
  writeSchedule,
  mergeResults,
  writeStandings,
  upsertArticleEn,
  addTranslation,
  listArticles,
  readArticle,
  listArticlesMissingLang,
  idFromSlug,
};
