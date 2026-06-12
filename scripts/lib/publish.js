/**
 * 文章自动录入 + 上架（替代人工后台操作）
 *
 * 单篇流程（与既有 Python 上架脚本一致）：
 *   1. slug 查重 —— 站点列表里同 slug 的旧文章先删除
 *   2. 取分类 category_id（老业务字段，随机一个即可）
 *   3. createArticle 录入（status=2 已发布；只创建，绝不更新）
 *   4. 取空闲渠道；无空闲渠道 → 抛错（文章已创建，记入 cache 防重复创建）
 *   5. seoArticleUpSite 绑定渠道（真正上架）
 *   6. getArticleUpSiteInfo 验证（非阻断）
 *
 * 断点续跑：scripts/.publish_cache.json 记录 slug → article_id 与状态，
 *           已上架(slug 状态 published)的直接跳过；创建成功但未绑渠道的
 *           (publish_no_channel) 下次只补绑定，不重复创建。
 */

const fs = require("fs");
const path = require("path");
const bi = require("./bi-client");

const CACHE_FILE = path.join(__dirname, "..", ".publish_cache.json");

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return { items: {} }; // slug → { article_id, status }
  }
}
function saveCache(c) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 2));
}

const REGION_BY_LANG = { en: "US", es: "MX", pt: "BR", ar: "SA", ja: "JP", ko: "KR" };

/**
 * 把管线文章对象转成 createArticle 请求体（camelCase，对齐后台字段）。
 * article: { slug, language, title, summary, content, cover, keywords, article_type }
 */
function toCreatePayload(article, categoryId) {
  return {
    name: article.title,
    content: article.content,
    cover: article.cover || "",
    coverSeoAlt: article.title,
    categoryId,
    authorId: article.author_id || 0,
    seoTitle: article.title,
    seoDesc: article.summary || "",
    seoUrlSlug: article.slug,
    firstParagraph: article.summary || "",
    keywords: article.keywords || "",
    language: article.language,
    region: REGION_BY_LANG[article.language] || "US",
    summaryPoints: [],
    relatedArticles: [],
    noEntry: 0,
    status: 2, // 已发布
    isSeo: 1,
  };
}

let _catCache = null;

/**
 * 录入并上架一篇文章。成功返回 article_id。
 * options: { siteId, dryRun }
 */
async function publishArticle(article, { siteId, dryRun = false } = {}) {
  bi.assertConfigured();
  if (!siteId) throw new Error("缺少 siteId");
  if (!article.slug || !article.language || !article.title) {
    throw new Error(`文章字段不完整：${JSON.stringify({ slug: article.slug, language: article.language })}`);
  }

  const cache = loadCache();
  const cached = cache.items[article.slug];
  if (cached && cached.status === "published") {
    console.log(`  [publish] 跳过（已上架）：${article.slug}`);
    return cached.article_id;
  }

  if (dryRun) {
    console.log(`  [publish][dry-run] 将录入并上架：[${article.language}] ${article.title} (${article.slug})`);
    return null;
  }

  // ── 1. slug 查重（站点列表内）────────────────────────────────────────────
  const siteArticles = await bi.getAllSiteArticles(siteId);
  const dupes = siteArticles.filter((a) => a.seoUrlSlug === article.slug);
  for (const d of dupes) {
    console.log(`  [publish] 重复 slug，删除旧文章 id=${d.id}`);
    await bi.deleteArticle(d.id);
  }

  let articleId = cached && cached.article_id;

  if (!articleId) {
    // ── 2. 分类 ─────────────────────────────────────────────────────────────
    if (!_catCache) _catCache = await bi.getCategoryList(siteId);
    const categoryId = _catCache.length
      ? _catCache[Math.floor(Math.random() * _catCache.length)].id
      : 0;

    // ── 3. createArticle ────────────────────────────────────────────────────
    articleId = await bi.createArticle(toCreatePayload(article, categoryId));
    console.log(`  [publish] createArticle 成功 article_id=${articleId} [${article.language}] ${article.slug}`);
    cache.items[article.slug] = { article_id: articleId, status: "created" };
    saveCache(cache);
  } else {
    console.log(`  [publish] 复用已创建文章 article_id=${articleId}（补绑渠道）`);
  }

  // ── 4. 空闲渠道 ───────────────────────────────────────────────────────────
  const channels = await bi.getAvailableChannels(siteId);
  if (!channels.length) {
    cache.items[article.slug] = { article_id: articleId, status: "publish_no_channel" };
    saveCache(cache);
    throw new Error(`站点 ${siteId} 无空闲渠道（文章已创建 id=${articleId}，待渠道释放后重跑补绑）`);
  }
  const channel = channels[0];

  // ── 5. 绑定渠道（上架）──────────────────────────────────────────────────
  await bi.bindToSite(articleId, siteId, channel);
  console.log(`  [publish] 绑定渠道成功 channel=${channel.channel}`);

  // ── 6. 验证（非阻断）────────────────────────────────────────────────────
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const info = await bi.getUpSiteInfo(articleId);
    if (info && info.data) console.log(`  [publish] 绑定验证通过`);
    else console.warn(`  [publish] 绑定验证无数据（可能尚未生效）`);
  } catch (e) {
    console.warn(`  [publish] 绑定验证请求失败（非阻断）：${e.message}`);
  }

  cache.items[article.slug] = { article_id: articleId, status: "published" };
  saveCache(cache);
  return articleId;
}

module.exports = { publishArticle, toCreatePayload };
