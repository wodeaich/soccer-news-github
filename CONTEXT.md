# SoccerIns 项目上下文记忆文档

> 供 Claude Code 每次会话开始时读取，快速恢复项目背景。
> 最后更新：2026-05-13

---

## 项目基本情况

| 项目 | 说明 |
|------|------|
| 网站 | soccerins.com — 世界杯资讯站 |
| 负责人 | 非技术背景，独自负责整个项目 |
| 开发方式 | Claude Code 完成所有代码 |
| 代码仓库 | wodeaich/soccer-news-github |
| 工作分支 | claude/review-codebase-BBc0l |
| 截止日期 | 2026年6月11日（世界杯开幕前） |
| 代码完成目标 | 1周内完成所有代码 |

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端框架 | Nuxt.js 2，`target: "static"` 静态生成 |
| 语言 | Vue 2 + JavaScript |
| CSS | SCSS |
| HTTP | @nuxtjs/axios |
| 多语言 | @nuxtjs/i18n v7（已安装） |
| 后端 API | api.tapmygame.com（可正常访问） |
| 站点 ID | `SITE_ID=soccerins`，`SITE_AFS=soccerins-afs` |
| 构建 | Yarn，Terser + PurgeCSS |

---

## 支持语言（6种）

| 代码 | 语言 | ISO | 特殊处理 |
|------|------|-----|---------|
| en | English | en-US | 默认语言 |
| es | Español | es-ES | — |
| pt | Português | pt-BR | — |
| ar | العربية | ar-SA | RTL 布局 |
| ja | 日本語 | ja-JP | — |
| ko | 한국어 | ko-KR | — |

---

## 页面路由规划

所有语言使用相同路径名（简化方案）：

| 页面 | 路径 |
|------|------|
| 首页 | `/{lang}/` |
| 新闻列表 | `/{lang}/news/` |
| 新闻详情 | `/{lang}/news/{slug}/` |
| 赛程 | `/{lang}/schedule/` |
| 比赛结果 | `/{lang}/results/` |
| 积分榜 | `/{lang}/standings/` |
| 比赛详情 | `/{lang}/matches/{slug}/` |
| 直播推荐 | `/{lang}/live-tv/` |

---

## 已完成的工作（持续更新）

### Day 1（2026-05-13）✅
- [x] 合并 master 分支代码到开发分支
- [x] 安装 yarn 依赖
- [x] 安装 @nuxtjs/i18n v7
- [x] 创建 6 个语言文件（`locales/en.js` ~ `locales/ko.js`）
- [x] 配置 nuxt.config.js（i18n 模块，6语言路由）
- [x] 创建 `plugins/lang-redirect.js`（浏览器语言检测 + Cookie 记忆）
- [x] 改造 `components/Afs/Header.vue`（导航菜单 + 语言切换器）

### Day 2（2026-05-14）✅
- [x] `pages/index.vue` — 世界杯多语言首页（精选+趋势+无限滚动+广告）
- [x] `pages/news/index.vue` — 新闻列表页（精选卡片+无限滚动+广告）
- [x] `pages/news/_slug.vue` — 新闻详情页（文章+广告穿插+OG标签）
- [x] `components/Soccer/NewsCardFeatured.vue` / `NewsCardGrid.vue` / `NewsCardRow.vue`
- [x] 修复 Header/Sidebar `searchText` 未定义 bug
- [x] 修复 nav-data.js 错误时注入类型不匹配 bug
- [x] 添加 i18n.baseUrl 以生成完整 hreflang 标签
- [x] 测试验证：6种语言首页全部 200，新闻列表 200，详情 404 错误处理正确

### Day 3（2026-05-14）✅
- [x] `pages/schedule/index.vue` — 赛程页（阶段 Tab 筛选 + 按日分组 + 开球时间/场地 + 广告）
- [x] `pages/results/index.vue` — 比赛结果页（今日/全部 Tab + 比分卡片 + 评述链接 + 广告）
- [x] `pages/standings/index.vue` — 积分榜页（分组 Tab + 标准积分表 + 晋级/淘汰颜色标识 + 广告）
- [x] 测试验证：6语言路由全部 200，标题正确翻译，空状态正常展示

### Day 4（待做）
- [ ] `pages/_lang/matches/_slug.vue` — 比赛详情/回顾页
- [ ] `pages/_lang/live-tv/index.vue` — 直播推荐页

### Day 5（待做）
- [ ] `scripts/fetch_matches.js`
- [ ] `scripts/fetch_results.js`
- [ ] `scripts/fetch_standings.js`

### Day 6（待做）
- [ ] `scripts/generate_news.js`（需要 MiniMax Key）
- [ ] `scripts/translate_content.js`（需要 MiniMax Key）
- [ ] `static/llms.txt`
- [ ] Sitemap 精细化配置

### Day 7（待做）
- [ ] 全站测试
- [ ] 修复问题
- [ ] 最终推送

---

## 广告系统（绝对不动）

### 关键标识符
```
pub-1853000876464912    ← AdSense 主账号（GoogleAd.vue 用）
pub-3628028403766401    ← 第二账号
/23197833490/soccerins/ ← GAM 网络前缀
GTM-MVL6T7G3           ← GTM 容器
G-4ZQQBJW72Y           ← GA4
```

### 不能改动的文件
- `components/AdmSlot.vue`
- `components/AdmSlotFull.vue`
- `components/AdmSlotPreload.vue`
- `components/AdLoading.vue`
- `components/GoogleAd.vue`
- `app.html`（整个文件原样保留）
- `static/ads.txt`

### 三个 AdmSlot 的用法
```html
<!-- 首屏位 -->
<adm-slot-preload adm-id="news-1" adm-unit="/23197833490/soccerins/soccerins_home_1" ads-slot="6667048681" />
<!-- 通栏 -->
<adm-slot-full adm-id="match-full" adm-unit="/23197833490/soccerins/soccerins_home_full" ads-slot="4080715115" />
<!-- 普通位 -->
<adm-slot adm-id="detail-3" adm-unit="/23197833490/soccerins/soccerins_home_3" ads-slot="6028318341" />
```

---

## CDN 情况

- 当前：Cloudflare（bunchthings.com）
- 即将迁移到新 CDN（地址待确认）
- **迁移前不上线，CDN 确定后统一替换**
- 新图片全部用 `<img :src="\`${$config.cdnBase}${item.icon}\`" loading="lazy" />`，不用 `<NuxtImg>`
- `.env` 里有 `CDN_BASE_URL` 变量，确定后填入

---

## API Keys 状态

| Key | 状态 | 用途 |
|-----|------|------|
| API-Football | ❌ 未注册 | 赛程/比分/积分榜数据 |
| MiniMax | ❌ 未注册 | AI生成新闻 + 6语言翻译 |
| 后端 API | ✅ 可用 | api.tapmygame.com |

**用户需要注册（不影响前端页面开发）：**
- API-Football: https://www.api-football.com/ （免费100次/天）
- MiniMax: https://platform.minimaxi.com/

---

## 语言切换逻辑

```
用户访问 soccerins.com/
  → cookie preferred_lang 存在？→ 直接跳对应语言
  → 没有 → 读 navigator.languages → 跳匹配语言（兜底 /en/）
  → 写入 cookie（1年有效）

用户切换语言（Header）
  → switchLang(code) 更新 cookie
  → switchLocalePath(code) 跳转

文章详情页切换语言 → 跳目标语言新闻列表页（后台无关联字段，可接受）
```

---

## SEO/GEO 规划

### 上线前必须
- [ ] Canonical 标签（nuxt-i18n seo:true 自动处理，需验证动态路由）
- [ ] 每页动态 OG + Twitter Card
- [ ] Sitemap lastmod/changefreq
- [ ] `static/llms.txt`（GEO）

### 上线后持续优化
- [ ] SportsEvent schema（比赛详情页）
- [ ] FAQPage schema（直播推荐页）
- [ ] E-E-A-T About 页面

---

## 开发注意事项

1. **所有内部链接用 `localePath()`，不写死 URL**
2. **广告组件参数一个字不改**
3. **不新增 `<NuxtImg>`，图片用 `<img>` + CDN 变量**
4. **阿拉伯语页面需要单独测试 RTL 布局**
5. **API-Football 免费额度 100次/天，fetch_results.js 要做缓存**
