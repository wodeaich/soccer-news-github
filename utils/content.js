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

/** 外部队徽 URL → 本地 SVG 徽章路径（api-sports.io 403，改用本地生成的 SVG） */
function localTeamLogo(teamId) {
  return teamId ? `/team-logos/${teamId}.svg` : "";
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
    home_flag: localTeamLogo(f.home && f.home.id),
    away_flag: localTeamLogo(f.away && f.away.id),
    home_score: f.score ? f.score.home : null,
    away_score: f.score ? f.score.away : null,
    kickoff: f.timestamp,
    venue: f.venue || "",
    status: statusOf(f.status),
  };
}

function mapStandingGroup(g) {
  return {
    name: g.name,
    table: (g.table || []).map((t) => ({
      team: t.team
        ? { name: t.team.name, logo: localTeamLogo(t.team.id) }
        : null,
      played: t.played,
      won: t.won,
      drawn: t.drawn,
      lost: t.lost,
      goals_for: t.goals_for,
      goals_against: t.goals_against,
      goal_diff: t.goal_diff,
      points: t.points,
      rank: t.rank,
    })),
  };
}

/** ISO 时间 → 秒级时间戳（NewsCard 组件以 ts*1000 渲染日期） */
function toEpochSec(iso) {
  const ms = new Date(iso || 0).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

// 文章为「独立语言」扁平格式（与后台一致）：
// { id, slug, language, title, summary, content, cover, keywords, article_type, published_at }
function mapArticleMenuItem(a) {
  return {
    name: a.title || "",
    cover: a.cover || "",
    path: a.slug,
    published_at: toEpochSec(a.published_at),
    first_paragraph: a.summary || "",
    article_type: a.article_type || "news",
  };
}

function mapArticleDetail(a) {
  return {
    name: a.title || "",
    cover: a.cover || "",
    first_paragraph: a.summary || "",
    content: a.content || "",
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

/** 单场比赛详情。回顾文章作为独立新闻存在，不再内嵌到比赛页。 */
function getMatch(slug) {
  const all = [
    ...readJSON(path.join(MATCHES_DIR, "results.json"), { results: [] }).results || [],
    ...readJSON(path.join(MATCHES_DIR, "schedule.json"), { fixtures: [] }).fixtures || [],
  ];
  const raw = all.find((f) => f.slug === slug);
  if (!raw) return null;
  const match = mapMatch(raw);
  match.review = "";
  match.review_summary = "";
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

/** 某语言的文章列表（独立语言模式：只取该语言自己的文章） */
function listArticlesByLang(lang) {
  return listArticles().filter((a) => (a.language || "en") === lang);
}

/** 文章列表（首页/news 列表用）modId: rec | trending | all */
function getMenu(lang, modId = "all", size = 10) {
  const all = listArticlesByLang(lang);
  let slice;
  if (modId === "rec") slice = all.slice(0, size);
  else if (modId === "trending") slice = all.slice(size, size * 2).length ? all.slice(0, size) : all.slice(0, size);
  else slice = all.slice(0, size);
  return slice.map(mapArticleMenuItem);
}

/** 文章详情（按 id 读取；文章自带 language） */
function getArticle(id) {
  const a = readJSON(path.join(ARTICLES_DIR, `${String(id)}.json`), null);
  return a ? mapArticleDetail(a) : null;
}

// ─── 路由枚举（generate.routes / sitemap 用）─────────────────────────────────
/** 全部文章的 {lang, slug, id, published_at}（每篇只属于自己的语言区） */
function listArticleRoutes() {
  return listArticles()
    .filter((a) => a.slug)
    .map((a) => ({
      lang: a.language || "en",
      slug: a.slug,
      id: a.id,
      published_at: a.published_at,
    }));
}

function listArticleSlugs() {
  return listArticles().map((a) => a.slug).filter(Boolean);
}

function listMatchSlugs() {
  const results = readJSON(path.join(MATCHES_DIR, "results.json"), { results: [] }).results || [];
  return results.map((r) => r.slug).filter(Boolean);
}

/** 内容真实更新时间，供 sitemap lastmod / GEO 使用 */
function contentMeta() {
  const articles = listArticles();
  const latestArticleAt =
    articles.length && articles[0].published_at ? articles[0].published_at : null;
  const sched = readJSON(path.join(MATCHES_DIR, "schedule.json"), {});
  const res = readJSON(path.join(MATCHES_DIR, "results.json"), {});
  const standings = readJSON(path.join(MATCHES_DIR, "standings.json"), {});
  const newest = (...ds) =>
    ds.filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0] || null;
  return {
    latestArticleAt,
    scheduleAt: sched.updated_at || null,
    resultsAt: res.updated_at || null,
    standingsAt: standings.updated_at || null,
    matchesAt: newest(sched.updated_at, res.updated_at, standings.updated_at),
  };
}

/** slug → 文章发布时间，供 sitemap lastmod */
function articleLastmods() {
  const map = {};
  for (const a of listArticles()) if (a.slug) map[a.slug] = a.published_at;
  return map;
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
  listArticleRoutes,
  listArticlesByLang,
  listMatchSlugs,
  contentMeta,
  articleLastmods,
};
