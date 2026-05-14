# SoccerIns 项目上下文记忆文档

> 供 Claude Code 每次会话开始时读取，快速恢复项目背景。
> 最后更新：2026-05-14（涵盖 Day1–Day4 + 全站联调完整记录）

---

## 项目基本情况

| 项目 | 说明 |
|------|------|
| 网站 | soccerins.com — 世界杯资讯站 |
| 负责人 | 非技术背景，独自负责整个项目 |
| 开发方式 | Claude Code 完成所有代码 |
| 代码仓库 | wodeaich/soccer-news-github |
| 工作分支 | **claude/review-codebase-BBc0l** |
| 截止日期 | 2026年6月11日（世界杯开幕前） |

### 分支说明

| 分支 | 内容 |
|------|------|
| `main` | 改版规划文档（README.md） |
| `master` | 现有站点原始代码（游戏/资讯混合平台） |
| `claude/review-codebase-BBc0l` | **主开发分支**，所有新代码在此 |

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端框架 | Nuxt.js 2，`target: "static"` 静态生成 |
| 语言 | Vue 2 + JavaScript |
| CSS | SCSS，变量文件 `assets/css/_mixins.scss` |
| HTTP | @nuxtjs/axios |
| 多语言 | @nuxtjs/i18n v7（已安装并配置） |
| 后端 API | api.tapmygame.com（本地开发 403，生产可用） |
| 站点 ID | `SITE_ID=soccerins`，`SITE_AFS=soccerins-afs` |
| 构建 | Yarn，Terser + PurgeCSS |

### 关键 SCSS 变量（`_mixins.scss`）

```scss
$font1: #41414c      // 主文字色
$font2: #ffffff      // 白色（⚠️ 不要用于正文颜色！）
$color1: #68dfc3     // 主题绿色（按钮、边框、高亮）
$bg: #f0f2f5         // 页面背景
```

> ⚠️ `$font2 = #ffffff`，用于白色文字（深色背景上），**不要** 用于浅色背景上的正文颜色。

---

## 支持语言（6种）

| 代码 | 语言 | ISO | 特殊处理 |
|------|------|-----|---------|
| en | English | en-US | 默认语言 |
| es | Español | es-ES | — |
| pt | Português | pt-BR | — |
| ar | العربية | ar-SA | **RTL 布局** |
| ja | 日本語 | ja-JP | — |
| ko | 한국어 | ko-KR | — |

语言文件位置：`locales/en.js` ~ `locales/ko.js`，所有 key 均已完整翻译。

---

## 已完成页面（前端全部完成）✅

### 路由总表

| 页面 | 文件 | 路由 |
|------|------|------|
| 世界杯首页 | `pages/index.vue` | `/{lang}/` |
| 新闻列表 | `pages/news/index.vue` | `/{lang}/news/` |
| 新闻详情 | `pages/news/_slug.vue` | `/{lang}/news/{slug}/` |
| 赛程 | `pages/schedule/index.vue` | `/{lang}/schedule/` |
| 比赛结果 | `pages/results/index.vue` | `/{lang}/results/` |
| 积分榜 | `pages/standings/index.vue` | `/{lang}/standings/` |
| 比赛详情/评述 | `pages/matches/_slug.vue` | `/{lang}/matches/{slug}/` |
| 直播推荐 | `pages/live-tv/index.vue` | `/{lang}/live-tv/` |

所有页面已通过测试：6 种语言路由全部 200，标题正确翻译，无 Vue 警告。

### 各页面功能说明

**`pages/index.vue`（首页）**
- 精选新闻 3 张大卡片（`mod_id: 'rec'`）
- 趋势新闻 6 张网格卡片（`mod_id: 'trending'`）
- 全部文章无限滚动（`mod_id: 'all'`，`InfiniteScrollList1`）
- 广告：首屏位 + 通栏位 + 普通位

**`pages/news/index.vue`（新闻列表）**
- 精选 3 条（`mod_id: 'rec'`）+ 全部文章无限滚动
- 广告：首屏位 + 列表穿插位

**`pages/news/_slug.vue`（新闻详情）**
- `asyncData` 从 slug 末段提取 article_id，调 `/api/article/detail`
- HTML 内容 + 广告穿插（ArticleWithAdm 组件）
- 动态 OG 标签 + 动态 lang/dir 属性
- API 失败 → `error({ statusCode: 404 })`

**`pages/schedule/index.vue`（赛程）**
- 阶段 Tab（全部/小组赛/16强/8强/半决赛/决赛）
- 按日期 key 分组展示，含开球时间 + 场地
- API 端点：`/api/match/schedule?site_id=soccerins`（API-Football 接入后生效）
- 无数据 → 空状态（⚽ + noData 文字）

**`pages/results/index.vue`（比赛结果）**
- 今日/全部 Tab 切换
- 黑底白字比分卡片 + 跳转评述链接（`localePath('/matches/'+slug)`）
- API 端点：`/api/match/results?site_id=soccerins`

**`pages/standings/index.vue`（积分榜）**
- 分组 Tab（A–H）
- 标准积分表：前 2 名绿色左边框（晋级），末位红色（淘汰）
- 净胜球正负颜色区分
- API 端点：`/api/match/standings?site_id=soccerins`，期望返回 `{ groups: [{ name, table: [...] }] }`

**`pages/matches/_slug.vue`（比赛详情/评述）**
- 深色比分头部（队旗 + 比分/VS + 场馆）
- 数据统计条（控球率、射门、角球、犯规、黄/红牌）
- MiniMax AI 评述内容（`v-html` 渲染）
- 相关新闻（复用 `Soccer-NewsCardRow`）
- **SportsEvent JSON-LD schema**（`innerHTML` 写法）
- API 端点：`/api/match/detail?site_id=soccerins&slug=xxx`
- API 失败 → `error({ statusCode: 404 })`

**`pages/live-tv/index.vue`（直播推荐）**
- 7 个地区 Tab（🇺🇸🇬🇧🇧🇷🇲🇽🇯🇵🇰🇷🌍）
- API 无数据时自动展示内置静态频道列表（`DEFAULT_CHANNELS` 常量）
- FAQ 折叠（英/西/葡三语独立内容，其余语言回落英文）
- **FAQPage JSON-LD schema**（`innerHTML` 写法，GEO 优化）
- 今日赛事快览（数据接入后自动显示）
- API 端点：`/api/live/channels`、`/api/match/today`

---

## 新增 Soccer 组件

| 组件 | 用途 |
|------|------|
| `components/Soccer/NewsCardFeatured.vue` | 大图精选卡片（首页/新闻列表置顶） |
| `components/Soccer/NewsCardGrid.vue` | 3列网格卡片（首页趋势区） |
| `components/Soccer/NewsCardRow.vue` | 横排列表卡片（列表/详情相关新闻） |

所有卡片内部链接均用 `localePath()`，支持 6 语言路由。

---

## 联调已修复的 Bug（2026-05-14）

| # | 文件 | Bug | 修复方式 |
|---|------|-----|---------|
| 1 | `components/Afs/Header.vue` | `searchText` 对象未定义，SSR 500 | 改用 `$t('common.search')` |
| 2 | `components/Afs/Sidebar.vue` | 同上 `searchText` 未定义 | 改用 `$t('common.search')` |
| 3 | `plugins/nav-data.js` | API 失败时注入 `[]`，但 Sidebar prop 期望 Object | 改为注入 `{ list: [] }` |
| 4 | `nuxt.config.js` | i18n 缺少 `baseUrl`，hreflang 标签无法生成完整 URL | 添加 `baseUrl: 'https://soccerins.com'` |
| 5 | `Soccer/NewsCardGrid.vue` + `NewsCardRow.vue` | 日期颜色 `$font2 = #fff`（白底白字不可见） | 改为 `rgba($font1, 0.5)` |
| 6 | `pages/standings/index.vue` | 图例 `▪` 符号被错误条件包裹，可能不显示 | 简化为始终显示 |
| 7 | `pages/news/_slug.vue` | `newInfo.terms` 可能 `undefined`，keywords meta 输出 `"undefined"` | 加 `\|\| ''` 兜底 |
| 8 | `pages/index.vue` + `pages/news/index.vue` | 给 `InfiniteScrollList1` 传了不存在的 `extra-params` prop（Vue 警告） | 移除该 prop 及 `data()` 中冗余的 `siteAfs` |
| 9 | `pages/matches/_slug.vue` | JSON-LD 使用 `json:` 属性，Nuxt 2 vue-meta 不支持，schema 不输出 | 改为 `innerHTML: JSON.stringify(...)` + `__dangerouslyDisableSanitizers` |
| 10 | `pages/live-tv/index.vue` | FAQPage JSON-LD 同上问题 | 同上修复 |

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
- `app.html`（整个文件原样保留，含 GPT/GA4/GTM/埋点）
- `static/ads.txt`

### 三个 AdmSlot 用法
```html
<!-- 首屏位（页面加载立即执行） -->
<adm-slot-preload adm-id="news-1" adm-unit="/23197833490/soccerins/soccerins_home_1" ads-slot="6667048681" />
<!-- 通栏大位（滚动到视口前半屏预加载） -->
<adm-slot-full adm-id="match-full" adm-unit="/23197833490/soccerins/soccerins_home_full" ads-slot="4080715115" />
<!-- 普通位（滚动进入视口时执行） -->
<adm-slot adm-id="detail-3" adm-unit="/23197833490/soccerins/soccerins_home_3" ads-slot="6028318341" />
```

> 新页面需要新广告位时，必须在 GAM 后台申请新 ad unit，拿到正式 unit path 和 slot ID 再写代码。

---

## CDN 情况

- 当前：Cloudflare（bunchthings.com）
- 即将迁移到新 CDN（**地址待用户确认**）
- **迁移完成前不上线**，CDN 确定后统一替换
- 新图片全部用 `<img :src="imgUrl" loading="lazy" />`，**不用** `<NuxtImg>`
- `.env` 里预留 `CDN_BASE_URL` 变量，确定后填入

---

## API Keys 状态

| Key | 状态 | 用途 |
|-----|------|------|
| API-Football | ❌ **未注册** | 赛程/比分/积分榜实时数据 |
| MiniMax | ❌ **未注册** | AI生成新闻 + 6语言翻译 |
| 后端 API | ✅ 可用 | api.tapmygame.com（新闻/文章） |

**注册地址：**
- API-Football：https://www.api-football.com/（免费 100次/天）
- MiniMax：https://platform.minimaxi.com/

---

## 后续待完成（Day 5–7）

### Day 5 — 数据采集脚本（需要 API-Football 账号）
- [ ] `scripts/fetch_matches.js` — 抓赛程，写入后端 `/api/match/schedule`
- [ ] `scripts/fetch_results.js` — 抓赛果，**需做缓存**（100次/天额度）
- [ ] `scripts/fetch_standings.js` — 抓积分榜

### Day 6 — AI 内容生成（需要 MiniMax Key）
- [ ] `scripts/generate_news.js` — 调 MiniMax 生成世界杯新闻
- [ ] `scripts/translate_content.js` — 6 语言翻译
- [ ] `static/llms.txt` — GEO 优化，告知 AI 爬虫站点结构
- [ ] Sitemap 精细化（`lastmod`、`changefreq`、图片 sitemap）

### Day 7 — 上线
- [ ] CDN 切换完成后统一替换图片地址
- [ ] Google Search Console 提交
- [ ] 灰度上线英语版，监控错误
- [ ] 全量发布 6 语言

---

## SEO/GEO 完成状态

| 项目 | 状态 | 说明 |
|------|------|------|
| hreflang 标签 | ✅ | nuxt-i18n `seo:true` + `baseUrl` 自动注入 |
| 动态 OG / Twitter Card | ✅ | 首页、新闻详情、比赛详情均已实现 |
| `htmlAttrs` lang + dir | ✅ | 所有页面 `head()` 已设置，阿拉伯语 RTL 正确 |
| SportsEvent JSON-LD | ✅ | `pages/matches/_slug.vue`（`innerHTML` 写法） |
| FAQPage JSON-LD | ✅ | `pages/live-tv/index.vue`（`innerHTML` 写法） |
| Canonical 标签 | ⏳ | nuxt-i18n 自动处理，上线前验证 |
| Sitemap | ⏳ | 需补充 `lastmod`、`changefreq` |
| `llms.txt` | ⏳ | Day 6 完成 |
| E-E-A-T About 页面 | ⏳ | 上线后持续优化 |

---

## 语言切换逻辑

```
用户访问 soccerins.com/
  → cookie preferred_lang 存在？→ 直接跳对应语言
  → 没有 → 读 navigator.languages → 跳匹配语言（兜底 /en/）
  → 写入 cookie（1年有效）

用户切换语言（Header 右上角下拉）
  → switchLang(code) 更新 cookie
  → switchLocalePath(code) 跳转同页面对应语言版本

文章详情页切换语言 → 跳目标语言新闻列表页（后台无多语言关联字段，可接受）
```

---

## 开发规范（重要）

1. **所有内部链接必须用 `localePath()`，不写死 URL**
   ```html
   <!-- ✅ -->
   <nuxt-link :to="localePath('/news/')">News</nuxt-link>
   <!-- ❌ -->
   <a href="/en/news/">News</a>
   ```

2. **广告组件参数一个字不改**，adm-id/adm-unit/ads-slot 严格按现有格式

3. **图片不用 `<NuxtImg>`**，用 `<img>` + CDN 变量（CDN 迁移中）

4. **阿拉伯语 RTL**：所有新页面的 `head()` 要加 `htmlAttrs: { dir: locale === 'ar' ? 'rtl' : 'ltr' }`

5. **API-Football 额度**：100次/天，`fetch_results.js` 必须做缓存

6. **JSON-LD 写法**（Nuxt 2 vue-meta 规范）：
   ```js
   head() {
     return {
       __dangerouslyDisableSanitizers: ['script'],
       script: [{
         hid: 'ld-xxx',
         type: 'application/ld+json',
         innerHTML: JSON.stringify({ '@context': '...', '@type': '...' })
       }]
     }
   }
   ```

7. **`asyncData` 错误处理**：
   - 文章/比赛详情页：API 失败 → `error({ statusCode: 404 })`
   - 列表/数据页：API 失败 → `return { list: [] }` 显示空状态

---

## 本地开发说明

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 注意：本地开发时 api.tapmygame.com 会返回 403（IP 白名单限制）
# 这是正常现象，页面会降级显示空状态，不影响开发
```

---

*文档由 Claude Code 根据完整开发过程整理，每次会话开始时读取此文件恢复上下文。*
