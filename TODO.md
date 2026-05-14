# SoccerIns 待办事项

> 最后更新：2026-05-14
> 截止日期：2026-06-11（世界杯开幕）
> 工作分支：`claude/review-codebase-BBc0l`

---

## 🔴 立刻要做（阻塞后续开发）

- [ ] **填写 MINIMAX_GROUP_ID**
  - 登录 [platform.minimaxi.com](https://platform.minimaxi.com)
  - 右上角头像 → 账号信息 → 复制 Group ID（18位数字）
  - 填入 `.env`：`MINIMAX_GROUP_ID=xxxxxxxxxxxxxxxxxx`

- [ ] **确认后端 API 文章创建接口**
  - `generate_news.js` 目前调用 `POST /api/article/create`
  - 需确认 `api.tapmygame.com` 的实际接口路径和请求字段格式
  - 如接口不同，更新 `scripts/generate_news.js` Step 3 部分

---

## 🟡 Day 7 — 上线准备

### CDN
- [ ] 确认是否继续使用 Cloudflare（bunchthings.com）还是切换新 CDN
- [ ] CDN 确定后，替换 `nuxt.config.js` 中的 `image.provider` 配置
- [ ] 全站图片地址统一替换（目前 `.env` 预留了 `CDN_BASE_URL`）

### SEO 验证
- [ ] 上线后登录 [Google Search Console](https://search.google.com/search-console) 提交站点
- [ ] 提交 sitemap：`https://soccerins.com/sitemap.xml`
- [ ] 验证 hreflang 标签生成正确（6语言 + x-default）
- [ ] 验证 canonical 标签各语言指向自身

### 部署
- [ ] 配置 GitHub Actions 或 CI/CD 自动部署流程
- [ ] 灰度上线英语版（`/en/`），监控报错和加载速度
- [ ] 确认 6 语言路由全部可访问（200 状态）
- [ ] 全量发布 6 语言

---

## 🟡 Day 7 — 数据脚本定时运行

- [ ] 配置定时任务（Cron）自动运行以下脚本：

| 脚本 | 建议频率 | 说明 |
|------|---------|------|
| `node scripts/fetch_matches.js` | 每天1次 | 更新赛程 |
| `node scripts/fetch_results.js` | 每天3次（赛后） | 更新赛果 |
| `node scripts/fetch_standings.js` | 每天1次 | 更新积分榜 |
| `node scripts/generate_news.js` | 每天1次 | 生成当日赛事文章 |
| `node scripts/translate_content.js` | 每天1次（生成后） | 翻译新文章 |

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
| 站点域名 | soccerins.com |
| 后端 API | api.tapmygame.com |
| site_id | soccerins |
| site_afs | soccerins-afs |
| API-Football Key | 已配置到 `.env` |
| MiniMax Key | 已配置到 `.env` |
| MiniMax Group ID | ⚠️ **待填写** |
| 世界杯 League ID | 1 |
| 赛季 | 2026 |
| CDN | Cloudflare（bunchthings.com，暂定） |
