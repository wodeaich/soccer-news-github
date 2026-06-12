/**
 * 发版前同步：后台「站点文章列表」→ content/articles/
 *
 * 后台是文章唯一数据源（自动录入+上架后的结果，也包含人工在后台的增删改）。
 * 本脚本只读，把已上架文章落盘为独立语言格式：
 *   content/articles/<article_id>.json
 *   { id, slug, language, title, summary, content, cover, keywords,
 *     article_type, published_at }
 *
 * 同步是「全量镜像」：后台删了的文章，这里也会删除对应 JSON（保持一致）。
 *
 * 用法：node scripts/sync_articles.js [--site_id composoccer] [--dry-run]
 * 环境：ADMIN_BACKEND_URL / ADMIN_JWT_TOKEN / RELEASE_SITE_ID（site_id 缺省值）
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bi = require("./lib/bi-client");

const ARTICLES_DIR = path.join(__dirname, "..", "content", "articles");

/** 后台字段名存在差异的防御性取值 */
function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return "";
}

function toISO(v) {
  if (!v) return new Date().toISOString();
  if (typeof v === "number") return new Date(v * (v < 1e12 ? 1000 : 1)).toISOString();
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

function mapArticle(raw) {
  return {
    id: raw.id,
    slug: pick(raw, "seoUrlSlug", "slug", "webSlug"),
    language: pick(raw, "language", "lang") || "en",
    title: pick(raw, "name", "title", "seoTitle"),
    summary: pick(raw, "firstParagraph", "summary", "seoDesc"),
    content: pick(raw, "content"),
    cover: pick(raw, "cover"),
    keywords: pick(raw, "keywords"),
    article_type: pick(raw, "articleType", "article_type") || "news",
    published_at: toISO(pick(raw, "publishedAt", "publishTime", "CreatedAt", "createdAt", "updatedAt")),
  };
}

async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const sidIdx = args.indexOf("--site_id");
  const siteId = sidIdx !== -1 ? args[sidIdx + 1] : (process.env.RELEASE_SITE_ID || "");
  if (!siteId) throw new Error("缺少站点 ID：--site_id 或 RELEASE_SITE_ID");
  bi.assertConfigured();

  console.log(`[sync] 拉取站点文章列表 siteId=${siteId} (${bi.BASE}${bi.PREFIX})`);
  const rawList = await bi.getAllSiteArticles(siteId);
  console.log(`[sync] 后台返回 ${rawList.length} 篇已上架文章`);

  const mapped = [];
  for (const raw of rawList) {
    const a = mapArticle(raw);
    if (!a.slug) {
      console.warn(`[sync] ⚠️ 跳过：文章 id=${raw.id} 无 slug`);
      continue;
    }
    if (!a.content) {
      console.warn(`[sync] ⚠️ 文章 id=${a.id} (${a.slug}) 列表中无正文 content——`
        + "若后台列表不返回正文，需提供详情接口，详见 docs/backend-published-list-api.md");
    }
    mapped.push(a);
  }

  if (dryRun) {
    for (const a of mapped) console.log(`  [dry-run] ${a.id} [${a.language}] ${a.slug} content:${a.content ? a.content.length + "字符" : "无"}`);
    console.log(`[sync][dry-run] 共 ${mapped.length} 篇，未写盘`);
    return;
  }

  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  // 全量镜像：先清理不在后台列表里的旧文件
  const keep = new Set(mapped.map((a) => `${a.id}.json`));
  for (const f of fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json"))) {
    if (!keep.has(f)) {
      fs.unlinkSync(path.join(ARTICLES_DIR, f));
      console.log(`[sync] 删除已下架文章文件：${f}`);
    }
  }
  for (const a of mapped) {
    fs.writeFileSync(path.join(ARTICLES_DIR, `${a.id}.json`), JSON.stringify(a, null, 2));
  }
  console.log(`[sync] ✅ 已写入 ${mapped.length} 篇到 content/articles/`);
}

run().catch((err) => {
  console.error("[sync] 失败:", err.message);
  process.exit(1);
});
