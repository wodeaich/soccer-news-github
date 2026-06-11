# 管理后台评估报告

> 评估日期：2026-05-14
> 依据文档：`项目情况归档整理-管理后台.pdf` + `HIMOBI管理后台/` 文档包

---

## 一、管理后台概况

| 项目 | 内容 |
|------|------|
| 框架 | gin-vue-admin（前端 Vue 3 + Vite + Pinia，后端 Gin + GORM + go-redis）|
| 认证 | JWT，Header：`x-token` |
| 数据库 | MySQL 8.0 `game` 库（AFS 文章、游戏资源等）；小说模块单独用 `novel` 库 |
| 图片存储 | AWS S3（S3-compatible，支持 Cloudflare R2 配置）|
| 后台地址 | 内网 IP（如 `http://52.76.173.58:6688`），正式部署挂域名 |

---

## 二、与 CompSoccer 直接相关的模块

### 2.1 AFS 文章管理（3.3 节）

**数据库表：`article_library`（`game` 库）**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | int AUTO_INCREMENT | 主键 |
| `name` | varchar(200) | 文章英文标题 |
| `name_cn` | varchar(200) | 中文标题（内部查看用）|
| `source_url` | text | 文章来源 URL |
| `category_id` | int | 分类 ID |
| `cover` | text | 封面图 URL |
| `first_paragraph` | text | 摘要/首段 |
| `content` | text | 正文 HTML |
| `desc` | text | SEO 描述 |
| `region` | varchar(10) | 地区 country_code |
| `language` | varchar(20) | 语言（en/es/pt/ar/ja/ko）|
| `keywords` | text | 关键词，逗号分隔 |
| `article_type` | tinyint | 文章类型：1-首页文章 2-投放文章 |
| `status` | tinyint | 0-待处理 1-未发布 2-已发布 |
| `created_at` | timestamp | 创建时间 |
| `updated_at` | timestamp | 更新时间 |

**与 `generate_news.js` 的字段对应关系**

`POST /api/article/create` 的 payload 字段与 `article_library` 表完全对应，**无需修改**：

```js
{
  site_id:         "soccerins-afs",   // 路由到对应 site
  title:           "...",             // → name
  content:         "...",             // → content
  first_paragraph: "...",             // → first_paragraph
  cover:           "...",             // → cover
  slug:            "...",             // → web-slug（前端路由）
  keywords:        "...",             // → keywords
  lang:            "en",             // → language
  status:          "published",       // → status=2
  source:          "minimax-ai",      // 自定义来源标识
  fixture_id:      1234567,           // 扩展字段，API-Football 赛事 ID
  article_type:    "preview"          // → article_type
}
```

**多语言翻译接口**

```js
POST /api/article/translations/sync
{
  site_id: "soccerins",               // 注意：此处用 SITE_ID，不是 SITE_AFS
  translations: [{
    article_id, lang, title,
    content, summary, translated_at
  }]
}
```

> ⚠️ **注意**：`translate_content.js` 中使用 `SITE_ID=soccerins`，而 `generate_news.js` 创建文章使用 `SITE_AFS=soccerins-afs`。这是两个不同接口的参数，均正确，不是 Bug。

---

### 2.2 前端发版流程（2.2 节）

这是本次评估最关键的发现，直接影响 `deploy.yml` 的写法。

**正确发版流程（4 步）：**

```
yarn generate
    ↓
打包 dist/ 为 ZIP 文件（< 100MB）
    ↓
POST /fileUploadAndDownload/uploadFrontEndZip
  参数：siteId=soccerins, env=prod, file=<zip>
    ↓
POST /fileUploadAndDownload/releaseFrontEnd
  参数：siteId=soccerins, env=prod
    ↓
后台并发上传所有文件到 AWS S3 / Cloudflare R2（最多 100 并发）
```

**旧的 `deploy.yml`（错误）：** 使用 `rsync + SSH` 直接同步到 EC2，跳过了管理后台，无法触发 S3 上传，部署无效。

**新的 `deploy.yml`（已修正）：** 调用管理后台的 `uploadFrontEndZip` + `releaseFrontEnd` 接口，与生产环境一致。

**新增所需 GitHub Secrets：**

| Secret 名称 | 说明 | 示例 |
|-------------|------|------|
| `ADMIN_BACKEND_URL` | gin-vue-admin 后台地址 | `http://52.76.173.58:6688` |
| `ADMIN_JWT_TOKEN` | 管理后台登录 JWT token | `eyJhbGciOiJIUzI1...` |

---

### 2.3 图片上传（2.1 节）

**接口：** `POST /fileUploadAndDownload/upload`

| 参数 | 说明 |
|------|------|
| `file` | FormData，支持 jpg/png/webp/gif，最大 10MB |
| `fileType` | 固定传 `article`，回传 CDN URL |

上传后返回的 URL 格式（封面图）：
```
https://bunchthings.com/cdncgi/image/w=366,h=244,f=auto,fit=cover/article_site/article_cover/xxx.jpeg
```

> CompSoccer 目前暂用球队徽标 URL 作为封面，待后续完善封面图上传流程后接入此接口。

---

## 三、暂不涉及的模块（与 CompSoccer 无关）

以下模块属于其他业务线，CompSoccer 开发期间**不应接触**：

| 模块 | 说明 |
|------|------|
| 游戏-工具模块（3.1）| GameLibrary CRUD，`game` 库 game 系列表 |
| 短剧管理（3.2）| DramaVideoLibrary，`game` 库 |
| 种草站管理（3.4）| RecArticle，AFS 渠道投放相关 |
| 视频管理（3.5）| VideoLibrary，CRUD + 站点发布 |
| 小说管理（3.6）| NovelLibrary，**独立 `novel` 库** |
| 招聘站管理（3.7）| JobLibrary，`game` 库 |
| Flow 配置（3.8）| FlowCfg，Redis 缓存 |
| H5 站点投放链接（3.9）| HSSiteLandingPage |
| BI 模块（第 4 章）| 数据统计，多个外部广告平台 ROI 分析 |

---

## 四、爬取文章入库流程参考（附录）

PDF 附带了竞品内容爬取入库的 SQL 和流程，与 CompSoccer AI 生成文章的存储路径相同（均写入 `article_library`），供参考：

```sql
-- 去重查询
SELECT name, source_url FROM article_library
WHERE name IN (?) OR source_url IN (?);

-- 批量入库（从临时表）
INSERT INTO article_library (name, name_cn, source_url, category_id, cover,
  first_paragraph, content, language, article_type, created_at)
SELECT name, name_cn, source_url, category_id, cover,
  first_paragraph, content, language, article_type, :utcnow
FROM crawl_article_temp
WHERE status = 1
  AND NOT EXISTS (
    SELECT 1 FROM article_library t
    WHERE t.name = crawl_article_temp.name
       OR t.source_url = crawl_article_temp.source_url
  );
```

> CompSoccer 通过 API 写入，无需直接操作 SQL，但此去重逻辑可参考用于判断重复生成。

---

## 五、待办事项（基于本次评估）

- [ ] 在 GitHub Secrets 中添加 `ADMIN_BACKEND_URL` 和 `ADMIN_JWT_TOKEN`
- [ ] 确认 `releaseFrontEnd` 接口路径（本文假设为该路径，需与后端对齐后确认）
- [ ] 确认 `uploadFrontEndZip` 上传成功后的响应结构（`filePath` 字段名）
- [ ] 可选：接入 `/fileUploadAndDownload/upload` 实现封面图自动上传
