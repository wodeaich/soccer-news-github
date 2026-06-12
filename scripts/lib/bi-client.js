/**
 * BI 管理后台客户端（gin-vue-admin）
 *
 * 移植自既有 Python 上架脚本(3_article_publish.py)的红线规则：
 *   ★ 只调 createArticle，绝对禁止 updateArticle（全量覆盖接口）
 *   ★ 请求头必须小写 x-token
 *   ★ 创建后用「前后列表对比」双重确认新文章 ID
 *   ★ 同 slug 查重，重复的先删旧再建新
 *   ★ 文章创建成功 ≠ 上架；必须绑定站点渠道(seoArticleUpSite)才算上架
 *
 * 站点类型差异：composoccer 配置为「种草站」，接口前缀默认 /api/recArticle；
 * AFS 文章站为 /api/article。可用环境变量 BI_API_PREFIX 覆盖。
 *
 * 环境变量：
 *   ADMIN_BACKEND_URL  后台地址，如 http://52.76.173.58:6688
 *   ADMIN_JWT_TOKEN    登录 JWT（x-token）
 *   BI_API_PREFIX      接口前缀（默认 /api/recArticle）
 */

const axios = require("axios");

const BASE = (process.env.ADMIN_BACKEND_URL || "").replace(/\/$/, "");
const TOKEN = process.env.ADMIN_JWT_TOKEN || "";
const PREFIX = process.env.BI_API_PREFIX || "/api/recArticle";

const http = axios.create({
  baseURL: BASE,
  headers: { "x-token": TOKEN, "Content-Type": "application/json" }, // 必须小写 x-token
  timeout: 30000,
});

function assertConfigured() {
  if (!BASE) throw new Error("缺少 ADMIN_BACKEND_URL");
  if (!TOKEN) throw new Error("缺少 ADMIN_JWT_TOKEN");
}

async function get(path, params) {
  const { data } = await http.get(`${PREFIX}${path}`, { params });
  return data;
}

async function post(path, payload) {
  const { data } = await http.post(`${PREFIX}${path}`, payload);
  return data;
}

function okOrThrow(res, what) {
  if (!res || res.code !== 0) {
    throw new Error(`${what} 失败：${(res && res.msg) || JSON.stringify(res)}`);
  }
  return res;
}

// ─── 读取 ────────────────────────────────────────────────────────────────────

/** 站点文章列表（已上架到该站的文章）。返回 {list, total}。 */
async function getSiteArticleList(siteId, { page = 1, pageSize = 100, language = "" } = {}) {
  const res = await get("/site/getSiteArticleList", {
    siteId, page, pageSize, language,
    articleId: "", categoryId: "", articleType: "",
  });
  const d = res.data || {};
  return { list: d.list || [], total: d.total || 0 };
}

/** 取全量站点文章（自动翻页）。 */
async function getAllSiteArticles(siteId, language = "") {
  const pageSize = 100;
  let page = 1;
  const all = [];
  for (;;) {
    const { list, total } = await getSiteArticleList(siteId, { page, pageSize, language });
    all.push(...list);
    if (all.length >= total || list.length === 0) break;
    page += 1;
  }
  return all;
}

/** 文章分类列表 */
async function getCategoryList(siteId) {
  try {
    const res = await get("/getArticleCategoryList", { siteId });
    let result = res.data || [];
    if (!Array.isArray(result)) result = result.list || [];
    return result.filter((c) => c && typeof c === "object");
  } catch {
    return [];
  }
}

/** 空闲渠道列表（articleId 为 null 的渠道） */
async function getAvailableChannels(siteId) {
  const res = await get("/site/getSiteAvailableChannel", { siteId });
  const channels = res.data || [];
  return channels.filter((c) => c.articleId === null || c.articleId === undefined);
}

/** 后台全部文章列表（创建前后对比用，不限站点） */
async function getArticleList(page = 1, pageSize = 50) {
  const res = await get("/getArticleList", { page, pageSize });
  return ((res.data || {}).list || []);
}

/** 上架绑定状态 */
function getUpSiteInfo(articleId) {
  return get("/site/getArticleUpSiteInfo", { id: articleId });
}

// ─── 写入（仅 create / delete / 绑定；无 update）───────────────────────────

/** 删除文章（清理重复 slug 的旧记录） */
async function deleteArticle(articleId) {
  okOrThrow(await post("/deleteArticle", { id: articleId }), "deleteArticle");
}

/**
 * ★ 唯一允许的文章写入接口。创建文章并返回新文章 ID。
 * 用「创建前后列表对比」双重确认 ID（与 Python 脚本一致）。
 */
async function createArticle(articleData) {
  const before = await getArticleList(1, 50);
  const idsBefore = new Set(before.map((a) => a.id));

  okOrThrow(await post("/createArticle", articleData), "createArticle");

  await new Promise((resolve) => setTimeout(resolve, 1000));
  const after = await getArticleList(1, 50);
  const newIds = after.map((a) => a.id).filter((id) => !idsBefore.has(id));
  if (newIds.length) return Math.max(...newIds);
  const pending = after.find((a) => a.status === 0);
  if (pending) return pending.id;
  throw new Error("createArticle 成功但无法确认新文章 ID");
}

/** 绑定文章到站点渠道（真正的“上架”动作） */
async function bindToSite(articleId, siteId, channel) {
  okOrThrow(
    await post("/site/seoArticleUpSite", {
      articleId,
      siteId,
      channelId: channel.id,
      channel: channel.channel,
    }),
    "seoArticleUpSite"
  );
}

module.exports = {
  assertConfigured,
  getSiteArticleList,
  getAllSiteArticles,
  getCategoryList,
  getAvailableChannels,
  getArticleList,
  getUpSiteInfo,
  deleteArticle,
  createArticle,
  bindToSite,
  PREFIX,
  BASE,
};
