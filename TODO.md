# CompSoccer 待办事项

> 最后更新：2026-05-14（Day7 完成）
> 截止日期：2026-06-11（世界杯开幕）
> 工作分支：`claude/review-codebase-sync-08s8r`（已含 Day1–Day7 全部代码）

---

## 🔴 立刻要做（阻塞后续开发）

- [ ] **确认后端 API 文章创建接口**
  - `generate_news.js` 目前调用 `POST /api/article/create`
  - 需确认 `api.tapmygame.com` 的实际接口路径和请求字段格式
  - 如接口不同，更新 `scripts/generate_news.js` Step 3 部分

---

## ✅ Day 7 — 已完成（2026-05-14）

### GitHub Actions CI/CD
- [x] `.github/workflows/deploy.yml` — push to master 自动构建+rsync部署
- [x] `.github/workflows/cron.yml` — 5个脚本定时执行（支持 workflow_dispatch）

### SEO JSON-LD 结构化数据
- [x] NewsArticle JSON-LD — `pages/news/_slug.vue`
- [x] BreadcrumbList JSON-LD — 全部 6 个页面
- [x] Sitemap 动态文章 URL — `nuxt.config.js` async routes()

---

## 🔴 Day 8 — 上线前必做（阻塞）

- [ ] **配置 GitHub Secrets** — 在仓库 Settings → Secrets and variables → Actions 设置所有密钥（见 CONTEXT.md）
- [ ] **确认后端 API 文章创建接口** — `generate_news.js` 的 `POST /api/article/create` 字段格式

---

## 🟡 Day 8 — 上线流程

### CDN
- [ ] 确认是否继续使用 Cloudflare（bunchthings.com）还是切换新 CDN
- [ ] CDN 确定后替换 `nuxt.config.js` 中 `image.provider` 配置

### 部署
- [ ] 灰度上线英语版（`/en/`），监控报错和加载速度
- [ ] 确认 6 语言路由全部可访问（200 状态）
- [ ] 全量发布 6 语言

### SEO 验证
- [ ] 上线后登录 Google Search Console 提交站点
- [ ] 提交 sitemap：`https://compsoccer.com/sitemap.xml`
- [ ] 验证 hreflang 标签生成正确（6语言 + x-default）
- [ ] 验证 canonical 标签各语言指向自身

---

## 🟢 上线后优化（长期）

### 内容
- [ ] 扩充 `generate_news.js` 的话题列表（球队专题、球员专访模板等）
- [ ] 为每篇文章配封面图（目前用球队队徽替代）
- [ ] 建立 About 页面（E-E-A-T 信号，提升 AI 爬虫信任度）

### SEO / GEO
- [ ] 为新闻详情页添加 `NewsArticle` JSON-LD（`datePublished`、`author`、`publisher`）
- [ ] 为列表页添加 `BreadcrumbList` JSON-LD
- [ ] Sitemap 接入动态文章 URL（目前只有静态页面路由）
- [ ] `llms.txt` 随内容增长持续更新

### 广告
- [ ] 在 GAM 后台为新页面申请专属广告单元（新闻详情页、比赛详情页）
- [ ] 拿到正式 ad unit path 和 slot ID 后更新对应页面广告代码

### 监控
- [ ] 接入 Google Analytics 事件追踪（文章阅读完成率、语言切换点击）
- [ ] API-Football 额度监控（100次/天，接近上限时告警）

---

## ✅ 已完成

### Day 1 — 基础框架
- [x] nuxt-i18n 多语言配置（6语言：EN/ES/PT/AR/JA/KO）
- [x] 6个语言 JSON 文件 + 语言检测插件
- [x] Header 语言切换器

### Day 2 — 新闻模块
- [x] `pages/index.vue` — 世界杯首页（精选+趋势+无限滚动）
- [x] `pages/news/index.vue` — 新闻列表页
- [x] `pages/news/_slug.vue` — 新闻详情页

### Day 3 — 赛事数据页
- [x] `pages/schedule/index.vue` — 赛程页（阶段Tab+空状态）
- [x] `pages/results/index.vue` — 比赛结果页（日期筛选）
- [x] `pages/standings/index.vue` — 积分榜页（分组Tab+晋级指示）

### Day 4 — 详情与直播
- [x] `pages/matches/_slug.vue` — 比赛详情/评述页（SportsEvent schema）
- [x] `pages/live-tv/index.vue` — 直播推荐页（地区Tab+FAQ+FAQPage schema）
- [x] 联调修复 10 处 Bug

### Day 5 — 数据采集脚本
- [x] `scripts/fetch_matches.js` — API-Football 赛程采集
- [x] `scripts/fetch_results.js` — 赛果采集（本地缓存防超额度）
- [x] `scripts/fetch_standings.js` — 积分榜采集
- [x] `.env` 配置 API Key

### Day 6 — AI 内容生成
- [x] `scripts/generate_news.js` — 三步流程（拉赛事→生成文章→后台上架）
- [x] `scripts/translate_content.js` — MiniMax 6语言翻译
- [x] `static/llms.txt` — GEO 优化文件
- [x] Sitemap 精细化（changefreq/priority/lastmod）

---

## 📋 关键信息速查

| 项目 | 内容 |
|------|------|
| 站点域名 | compsoccer.com |
| 后端 API | api.tapmygame.com |
| site_id | soccerins |
| site_afs | soccerins-afs |
| API-Football Key | 已配置到 `.env` |
| MiniMax Key | 已配置到 `.env` |
| MiniMax Group ID | 不需要（套餐直接调用）|
| 世界杯 League ID | 1 |
| 赛季 | 2026 |
| CDN | Cloudflare（bunchthings.com，暂定） |
