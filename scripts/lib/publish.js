/**
 * 文章自动录入 + 上架（替代人工后台操作）
 *
 * 单篇流程（沿用既有 Python 上架脚本的红线，本站无渠道机制）：
 *   1. slug 查重 —— 站点列表里同 slug 的旧文章先删除
 *   2. 取分类 category_id（老业务字段，随机一个即可）
 *   3. createArticle 录入（status=2 已发布；只创建，绝不更新）
 *   4. articleUpSite 上架（articleId + siteId）
 *   5. 验证（非阻断）：查站点列表确认在站
 *
 * 断点续跑：scripts/.publish_cache.json 记录 slug → article_id 与状态，
 *           已上架的直接跳过；创建成功但未上架的下次只补上架，不重复创建。
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

  // ── 1. 查重（站点列表内，按标题；后台无 slug）────────────────────────────
  const siteArticles = await bi.getAllSiteArticles(siteId);
  const dupes = siteArticles.filter((s) => (s.article && s.article.name) === article.title);
  for (const d of dupes) {
    const delId = d.articleId || (d.article && d.article.id);
    if (!delId) continue;
    console.log(`  [publish] 同标题旧文章，尝试删除 articleId=${delId}`);
    try {
      await bi.deleteArticle(delId);
      console.log(`  [publish] 删除成功 articleId=${delId}`);
    } catch (e) {
      // 删除失败不阻断流程（404 = 后台接口路径不同或已删除）
      console.warn(`  [publish] 删除旧文章失败（${e.message}），忽略并继续录入`);
    }
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
    console.log(`  [publish] 复用已创建文章 article_id=${articleId}（补上架）`);
  }

  // ── 4. 上架到站点（本站无渠道机制：articleId + siteId 即可）──────────────
  await bi.bindToSite(articleId, siteId);
  console.log(`  [publish] 上架成功（articleId=${articleId} → ${siteId}）`);

  // ── 5. 验证（非阻断）：查站点列表里是否出现该文章 ───────────────────────
  await new Promise((resolve) => setTimeout(resolve, 1500));
  try {
    const onSite = await bi.getAllSiteArticles(siteId);
    const hit = onSite.some((s) => s.articleId === articleId || (s.article && s.article.id === articleId));
    console.log(hit ? `  [publish] 上架验证通过（已在站点列表）` : `  [publish] 上架验证：暂未在列表（可能稍后生效）`);
  } catch (e) {
    console.warn(`  [publish] 上架验证请求失败（非阻断）：${e.message}`);
  }

  cache.items[article.slug] = { article_id: articleId, status: "published" };
  saveCache(cache);
  return articleId;
}

module.exports = { publishArticle, toCreatePayload };
