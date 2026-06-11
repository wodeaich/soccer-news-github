/**
 * 内容读取层（纯静态方案 · 构建期）
 *
 * 把 content/ 里脚本写入的「原始结构」映射成「页面期望的扁平结构」，
 * 取代原先对 GO 后台 /api/* 的请求。在 Node 端运行：
 *   - nuxt.config.js 的 generate.routes() / sitemap
 *   - 页面 asyncData（generate 阶段，经 generate payload 注入，详见阶段3）
 *   - 自检脚本
 *
 * 所有读取容错：文件缺失返回空，保证无数据时也不崩。
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const MATCHES_DIR = path.join(CONTENT_DIR, "matches");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");

const LOCALES = ["en", "es", "pt", "ar", "ja", "ko"];

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// ─── 映射工具 ─────────────────────────────────────────────────────────────────
/** 清理阶段名： "Group Stage - 1" → "Group Stage"；"Round of 16" 原样 */
function cleanStage(stage) {
  if (!stage) return "";
  return String(stage).replace(/\s*-\s*\d+$/, "").trim();
}

function statusOf(s) {
  return /FT|AET|PEN/.test(s || "") ? "finished" : "scheduled";
}

/** 原始 fixture → 页面比赛结构 */
function mapMatch(f) {
  if (!f) return null;
  return {
    id: f.id,
    slug: f.slug,
    stage: cleanStage(f.stage),
    home_team: f.home && f.home.name,
    away_team: f.away && f.away.name,
    home_flag: f.home && f.home.logo,
    away_flag: f.away && f.away.logo,
    home_score: f.score ? f.score.home : null,
    away_score: f.score ? f.score.away : null,
    kickoff: f.timestamp, // API-Football timestamp 已是秒级
    venue: f.venue || "",
    status: statusOf(f.status),
  };
}

function mapStandingGroup(g) {
  return {
    name: g.name,
    table: (g.table || []).map((t) => ({
      team: t.team && t.team.name,
      flag: t.team && t.team.logo,
      played: t.played,
      won: t.won,
      drawn: t.drawn,
      lost: t.lost,
      goals_for: t.goals_for,
      goals_against: t.goals_against,
      goal_diff: t.goal_diff,
      points: t.points,
    })),
  };
}

/** 取文章某语言内容，缺失回退英文 */
function i18nOf(article, lang) {
  const t = (article.i18n && (article.i18n[lang] || article.i18n.en)) || {};
  return t;
}

/** ISO 时间 → 秒级时间戳（NewsCard 组件以 ts*1000 渲染日期） */
function toEpochSec(iso) {
  const ms = new Date(iso || 0).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

function mapArticleMenuItem(a, lang) {
  const t = i18nOf(a, lang);
  return {
    name: t.title || "",
    cover: a.cover || "",
    path: a.slug,
    published_at: toEpochSec(a.published_at),
    first_paragraph: t.summary || "",
  };
}

function mapArticleDetail(a, lang) {
  const t = i18nOf(a, lang);
  return {
    name: t.title || "",
    cover: a.cover || "",
    first_paragraph: t.summary || "",
    content: t.content || "",
    path: a.slug,
    published_at: a.published_at,
    created_at: a.published_at,
  };
}

// ─── 比赛 ────────────────────────────────────────────────────────────────────
function getSchedule() {
  const data = readJSON(path.join(MATCHES_DIR, "schedule.json"), { fixtures: [] });
  return (data.fixtures || []).map(mapMatch).sort((a, b) => (a.kickoff || 0) - (b.kickoff || 0));
}

function getResults() {
  const data = readJSON(path.join(MATCHES_DIR, "results.json"), { results: [] });
  return (data.results || []).map(mapMatch).sort((a, b) => (b.kickoff || 0) - (a.kickoff || 0));
}

function getStandings() {
  const data = readJSON(path.join(MATCHES_DIR, "standings.json"), { groups: [] });
  return (data.groups || []).map(mapStandingGroup);
}

function getToday() {
  const todayStr = new Date().toISOString().slice(0, 10);
  return getSchedule().filter((m) => {
    if (!m.kickoff) return false;
    return new Date(m.kickoff * 1000).toISOString().slice(0, 10) === todayStr;
  });
}

/** 单场比赛详情（含赛后回顾，若存在对应文章） */
function getMatch(slug, lang = "en") {
  const all = [
    ...readJSON(path.join(MATCHES_DIR, "results.json"), { results: [] }).results || [],
    ...readJSON(path.join(MATCHES_DIR, "schedule.json"), { fixtures: [] }).fixtures || [],
  ];
  const raw = all.find((f) => f.slug === slug);
  if (!raw) return null;
  const match = mapMatch(raw);
  const id = String(slug).split("-").pop();
  const art = readJSON(path.join(ARTICLES_DIR, `${id}.json`), null);
  if (art) {
    const t = i18nOf(art, lang);
    match.review = t.content || "";
    match.review_summary = t.summary || "";
  }
  match.stats = match.stats || {}; // API-Football 统计数据后续可补
  return match;
}

function getChannels() {
  return readJSON(path.join(MATCHES_DIR, "..", "live", "channels.json"), { list: [] }).list || [];
}

// ─── 文章 ────────────────────────────────────────────────────────────────────
function listArticles() {
  try {
    return fs
      .readdirSync(ARTICLES_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => readJSON(path.join(ARTICLES_DIR, f), null))
      .filter(Boolean)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  } catch {
    return [];
  }
}

/** 文章列表（首页/news 列表用）modId: rec | trending | all */
function getMenu(lang, modId = "all", size = 10) {
  const all = listArticles();
  let slice;
  if (modId === "rec") slice = all.slice(0, size);
  else if (modId === "trending") slice = all.slice(size, size * 2).length ? all.slice(0, size) : all.slice(0, size);
  else slice = all.slice(0, size);
  return slice.map((a) => mapArticleMenuItem(a, lang));
}

/** 文章详情 */
function getArticle(lang, id) {
  const a = readJSON(path.join(ARTICLES_DIR, `${String(id)}.json`), null);
  return a ? mapArticleDetail(a, lang) : null;
}

// ─── 路由枚举（generate.routes / sitemap 用）─────────────────────────────────
function listArticleSlugs() {
  return listArticles().map((a) => a.slug).filter(Boolean);
}

function listMatchSlugs() {
  const results = readJSON(path.join(MATCHES_DIR, "results.json"), { results: [] }).results || [];
  return results.map((r) => r.slug).filter(Boolean);
}

module.exports = {
  LOCALES,
  getSchedule,
  getResults,
  getStandings,
  getToday,
  getMatch,
  getChannels,
  getMenu,
  getArticle,
  listArticles,
  listArticleSlugs,
  listMatchSlugs,
};
