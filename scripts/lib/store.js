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

// ─── 文章（独立语言扁平格式；线上由 sync_articles.js 从后台镜像写入）─────────
/** 写入一篇独立语言文章：{ id, slug, language, title, summary, content, ... } */
function writeArticleFlat(article) {
  const id = String(article.id);
  writeJSON(path.join(ARTICLES_DIR, `${id}.json`), article);
  return id;
}

/** 列出所有文章 */
function listArticles() {
  ensureDirs();
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJSON(path.join(ARTICLES_DIR, f), null))
    .filter(Boolean);
}

module.exports = {
  CONTENT_DIR,
  writeSchedule,
  mergeResults,
  writeStandings,
  writeArticleFlat,
  listArticles,
  idFromSlug,
};
