# SoccerIns 改版技术规划总结

> 文档版本：v1.0 | 整理日期：2026-05-13

---

## 一、代码仓现状

### 分支说明

| 分支 | 内容 |
|------|------|
| `main` | 改版规划文档（README.md） |
| `master` | 现有站点完整原始代码 |

### 现有站点技术栈（master 分支）

- **框架**：Nuxt.js 2，静态生成模式（`target: "static"`）
- **语言**：Vue 2 + JavaScript
- **CSS**：SCSS
- **HTTP**：@nuxtjs/axios
- **构建**：Yarn，Terser + PurgeCSS 生产优化
- **后端 API**：`api.tapmygame.com`，站点 ID：`soccerins`

### 现有页面路由

```
pages/
├── index.vue         首页
├── afsearch/         文章搜索
├── casual/           休闲游戏
├── category/         分类页
├── detail/           文章详情
├── download/         下载页
├── game/             游戏详情
├── games/            游戏列表
├── hot/              热门内容
├── landing/          落地页
├── live/             直播
└── search/           搜索
```

> 现有站点实质是游戏/资讯混合平台，改版目标是转型为纯世界杯资讯站。

---

## 二、CDN 迁移注意事项（从 Cloudflare 迁出）

### 代码中的 CF 硬依赖

**1. `nuxt.config.js` — 图片 provider 写死 CF**

```js
image: {
  provider: "cloudflare",
  cloudflare: {
    baseURL: "https://bunchthings.com"
  }
}
```

**2. `<NuxtImg>` 组件依赖 CF Image Resizing 能力**

```html
<NuxtImg format="auto" fit="cover" width="280" height="280" :src="item.icon" />
```

`format="auto"`、`fit="cover"` 是 CF 专属参数，换 CDN 后会失效。

### 迁移期开发规范

1. **迁移完成前不新增任何 `<NuxtImg>` 用法**，新图片组件改用原生 `<img>`
2. `.env` 新增 `CDN_BASE_URL` 变量，所有图片地址通过此变量拼接
3. `nuxt.config.js` 的 `image.provider` 改为 `ipx`（本地）或 `none`，等新 CDN 确定后再配置
4. 完成 CDN 切换后统一替换所有图片地址，上线前验证

```bash
# .env 新增
CDN_BASE_URL=https://新CDN地址
```

---

## 三、开发时间节奏规划

### 第 0 步（Day 1）— 环境准备

- `master` 分支本地跑通
- 配置新 CDN 地址（`CDN_BASE_URL`）
- 将 `image.provider` 从 `cloudflare` 改为临时本地模式
- 建开发分支，建 staging 环境

### 第 1 阶段（Day 2–5）— 多语言架构

| 天 | 任务 |
|----|------|
| Day 2 | 安装 `nuxt-i18n`，配置 6 种语言路由，创建 `locales/` 目录和语言文件框架 |
| Day 3 | 改造 Header/Footer/路由，加 hreflang 标签，验证 `/en/`、`/es/` 路由可访问 |
| Day 4 | 新闻列表页 `/{lang}/news/`，新闻详情页 `/{lang}/news/{slug}/`，接入后台 API |
| Day 5 | 赛程 `/{lang}/schedule/`、结果 `/{lang}/results/`、积分榜 `/{lang}/standings/` |

### 第 2 阶段（Day 6–9）— 核心功能页

| 天 | 任务 |
|----|------|
| Day 6 | 比赛详情页 `/{lang}/matches/{slug}/`，含数据展示和比赛回顾模板 |
| Day 7 | 直播推荐页 `/{lang}/live-tv/`，按地区分组展示渠道 |
| Day 8 | 数据采集脚本：`fetch_matches.js`、`fetch_results.js`、`fetch_standings.js` |
| Day 9 | MiniMax 对接：`generate_news.js`、`generate_reviews.js`、`translate_content.js` |

### 第 3 阶段（Day 10–12）— SEO + 上线准备

| 天 | 任务 |
|----|------|
| Day 10 | 多语言 sitemap，robots.txt，JSON-LD 结构化数据 |
| Day 11 | 新 CDN 切换完成，统一替换图片地址，验证图片加载 |
| Day 12 | 灰度上线英语版，Google Search Console 提交，监控错误 |

### 第 4 阶段（Day 13–14）— 全量发布

| 天 | 任务 |
|----|------|
| Day 13 | 开启其余 5 种语言，全站回归测试 |
| Day 14 | 全量发布，监控流量和报错 |

**总计：14 个工作日**

### 关键风险

| 风险 | 建议 |
|------|------|
| CDN 切换时图片全部 404 | Day 11 之前不上线，先迁好 CDN 再发布 |
| `nuxt-i18n` 和现有路由冲突 | Day 2–3 先做路由验证，早暴露问题 |
| MiniMax 翻译质量参差 | 阿拉伯语 RTL 布局要单独测试 |
| API-Football 免费额度 100 次/天 | `fetch_results.js` 要做缓存，避免浪费配额 |

---

## 四、广告代码保留规范（AdSense / AFC / GAM）

### 两套广告系统并存

| 系统 | 组件 | 类型 |
|------|------|------|
| GAM（Google Ad Manager） | `AdmSlot.vue` / `AdmSlotFull.vue` / `AdmSlotPreload.vue` | 程序化广告，走 `googletag` |
| AdSense（AFC） | `GoogleAd.vue` | 标准 AdSense，走 `adsbygoogle` |
| 加载遮罩 | `AdLoading.vue` | 监听 `ins.adsbygoogle` 出现后隐藏 loading |

### 关键标识符（绝对不能改）

```
# ads.txt — 两行都保留
pub-1853000876464912
pub-3628028403766401

# GAM 广告单元
/23197833490/soccerins/soccerins_home_1      → ads-slot="6667048681"
/23197833490/soccerins/soccerins_home_full   → ads-slot="4080715115"
/23197833490/soccerins/soccerins_home_3      → ads-slot="6028318341"
/23197833490/soccerins/soccerins_interstitial  （插页广告）
/23197833490/soccerins/soccerins_anchor        （锚定广告）
```

### 三个 AdmSlot 组件区别

| 组件 | 触发时机 | 适用场景 |
|------|----------|----------|
| `AdmSlotPreload` | 页面加载立即执行 | 首屏广告位 |
| `AdmSlotFull` | 滚动到视口前半屏预加载 | 通栏大广告 |
| `AdmSlot` | 滚动进入视口时执行 | 普通广告位 |

### 必须原样保留的文件

- `components/AdmSlot.vue`
- `components/AdmSlotFull.vue`
- `components/AdmSlotPreload.vue`
- `components/GoogleAd.vue`
- `components/AdLoading.vue`
- `static/ads.txt`
- `app.html`（整个文件，含 GPT 初始化、GA4、GTM、埋点逻辑）

### GAM → AdSense Fallback 机制（不能破坏）

`app.html` 中有 `slotRenderEnded` 监听：当 GAM 广告无填充（`isEmpty === true`）时，自动用 AdSense 补位。这套机制依赖：

1. `AdmSlot` 组件里的 `<div :data-slot="adsSlot">` — **不能删除此属性**
2. `app.html` 里的 `slotRenderEnded` 监听代码 — **不能删除**

### 新页面放广告的规则

```html
<!-- 首屏位 → AdmSlotPreload -->
<adm-slot-preload
  adm-id="news-1"
  adm-unit="/23197833490/soccerins/soccerins_home_1"
  ads-slot="6667048681"
/>

<!-- 通栏大位 → AdmSlotFull -->
<adm-slot-full
  adm-id="match-full"
  adm-unit="/23197833490/soccerins/soccerins_home_full"
  ads-slot="4080715115"
/>

<!-- 普通位 → AdmSlot -->
<adm-slot
  adm-id="detail-3"
  adm-unit="/23197833490/soccerins/soccerins_home_3"
  ads-slot="6028318341"
/>
```

> 新页面需要新广告位时，必须在 GAM 后台新建 ad unit，拿到正式 unit path 和 slot ID 再写代码，不能自造 ID。

---

## 五、多语言链接架构

### 路由策略

使用 `nuxt-i18n` + `prefix` 策略，所有语言（含英语）都带前缀。

```js
// nuxt.config.js
i18n: {
  strategy: 'prefix',
  defaultLocale: 'en',
  locales: [
    { code: 'en', iso: 'en-US', file: 'en.js' },
    { code: 'es', iso: 'es-ES', file: 'es.js' },
    { code: 'pt', iso: 'pt-BR', file: 'pt.js' },
    { code: 'ar', iso: 'ar-SA', file: 'ar.js', dir: 'rtl' },
    { code: 'ja', iso: 'ja-JP', file: 'ja.js' },
    { code: 'ko', iso: 'ko-KR', file: 'ko.js' },
  ],
  langDir: 'locales/',
  pages: {
    'news/index':      { en: '/news/', es: '/noticias/', pt: '/noticias/', ar: '/news/', ja: '/news/', ko: '/news/' },
    'news/_slug':      { en: '/news/:slug', es: '/noticias/:slug', pt: '/noticias/:slug', ar: '/news/:slug', ja: '/news/:slug', ko: '/news/:slug' },
    'schedule/index':  { en: '/schedule/', es: '/calendario/', pt: '/cronograma/', ar: '/schedule/', ja: '/schedule/', ko: '/schedule/' },
    'results/index':   { en: '/results/', es: '/resultados/', pt: '/resultados/', ar: '/results/', ja: '/results/', ko: '/results/' },
    'standings/index': { en: '/standings/', es: '/clasificacion/', pt: '/classificacao/', ar: '/standings/', ja: '/standings/', ko: '/standings/' },
    'matches/_slug':   { en: '/matches/:slug', es: '/partidos/:slug', pt: '/jogos/:slug', ar: '/matches/:slug', ja: '/matches/:slug', ko: '/matches/:slug' },
    'live-tv/index':   { en: '/live-tv/', es: '/tv-en-vivo/', pt: '/tv-ao-vivo/', ar: '/live-tv/', ja: '/live-tv/', ko: '/live-tv/' },
  },
  seo: true,   // 自动生成 hreflang
  lazy: true,
}
```

### 链接写法规范

```html
<!-- ✅ 正确：始终用 localePath() -->
<nuxt-link :to="localePath('/news/')">News</nuxt-link>
<nuxt-link :to="localePath({ name: 'news-slug', params: { slug: item.slug } })">
  {{ item.title }}
</nuxt-link>

<!-- ❌ 错误：硬编码语言路径 -->
<a href="/en/news/">News</a>
```

`CustomLink.vue` 需改造，内部使用 `localePath()`。

### 语言切换器

在 `Afs/Header.vue` 加入，用 `switchLocalePath()` 切换到同页面其他语言版本：

```html
<span
  v-for="locale in $i18n.locales"
  :key="locale.code"
  @click="$router.push(switchLocalePath(locale.code))"
>
  {{ locale.code.toUpperCase() }}
</span>
```

### 阿拉伯语 RTL 处理

```js
// plugins/i18n.js
export default ({ app }) => {
  app.i18n.onBeforeLanguageSwitch = (_, newLang) => {
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }
}
```

### hreflang 自动生成

`seo: true` 后 nuxt-i18n 自动注入，无需手动维护：

```html
<link rel="alternate" hreflang="en-US" href="https://compsoccer.com/en/news/world-cup/" />
<link rel="alternate" hreflang="es-ES" href="https://compsoccer.com/es/noticias/copa-mundial/" />
<link rel="alternate" hreflang="pt-BR" href="https://compsoccer.com/pt/noticias/copa-do-mundo/" />
<!-- ... -->
<link rel="alternate" hreflang="x-default" href="https://compsoccer.com/en/news/world-cup/" />
```

---

## 六、SEO + GEO 优化规划

### 现有规划评估

| 项目 | 完整度 | 说明 |
|------|--------|------|
| hreflang | ✅ 完整 | 6 语言 + x-default |
| URL 结构 | ✅ 完整 | prefix 策略，语言隔离清晰 |
| Sitemap | ⚠️ 不足 | 缺 `lastmod`、`changefreq`、图片 sitemap |
| JSON-LD | ⚠️ 不足 | 只有 NewsArticle，缺体育专用 schema |
| Canonical | ❌ 未覆盖 | 多语言最容易出的问题 |
| GEO 优化 | ❌ 空白 | 需从零建设 |

### SEO 补充项

#### 1. Canonical 标签

每个语言页面 canonical 必须指向自身，不能指向英语版：

```html
<!-- /es/noticias/copa-mundial/ -->
<link rel="canonical" href="https://compsoccer.com/es/noticias/copa-mundial/" />
```

#### 2. 根路径重定向

在 Nginx/CDN 层根据 `Accept-Language` 引导用户到对应语言版本，`x-default` 始终指向 `/en/`。

#### 3. Sitemap 精细化

```xml
<url>
  <loc>https://compsoccer.com/en/news/world-cup-preview/</loc>
  <lastmod>2026-05-13</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
  <image:image>
    <image:loc>https://cdn.../cover.jpg</image:loc>
    <image:title>World Cup Preview</image:title>
  </image:image>
</url>
```

| 页面类型 | changefreq | priority |
|----------|------------|----------|
| 首页 | hourly | 1.0 |
| 比赛结果 | daily | 0.9 |
| 新闻列表 | daily | 0.8 |
| 新闻详情 | weekly | 0.7 |
| 积分榜 | daily | 0.8 |

#### 4. 动态 Open Graph + Twitter Card

每个页面的 `head()` 需动态生成：

```js
head() {
  return {
    title: this.article.meta_title,
    meta: [
      { hid: 'og:title', property: 'og:title', content: this.article.title },
      { hid: 'og:description', property: 'og:description', content: this.article.summary },
      { hid: 'og:image', property: 'og:image', content: this.article.cover_image },
      { hid: 'og:locale', property: 'og:locale', content: this.$i18n.locale },
      { name: 'twitter:card', content: 'summary_large_image' },
    ]
  }
}
```

#### 5. 结构化数据补完

**比赛详情页 — SportsEvent Schema：**

```json
{
  "@type": "SportsEvent",
  "name": "Argentina vs France - World Cup Final",
  "startDate": "2026-07-19T20:00:00Z",
  "location": { "@type": "Place", "name": "MetLife Stadium" },
  "homeTeam": { "@type": "SportsTeam", "name": "Argentina" },
  "awayTeam": { "@type": "SportsTeam", "name": "France" },
  "sport": "Soccer"
}
```

**新闻页 — NewsArticle Schema（完整版）：**

```json
{
  "@type": "NewsArticle",
  "datePublished": "...",
  "dateModified": "...",
  "inLanguage": "en",
  "author": { "@type": "Organization", "name": "SoccerIns" },
  "publisher": { "@type": "Organization", "name": "SoccerIns", "logo": "..." }
}
```

其他页面需补充：`BreadcrumbList`、`ItemList`（直播推荐页）

### GEO 优化补充项（AI 搜索引擎）

目标：ChatGPT 搜索、Perplexity、Google AI Overview、Bing Copilot

#### 1. `llms.txt` 文件

放置于站点根目录，告知 AI 爬虫站点结构：

```
# compsoccer.com/llms.txt

> SoccerIns: World Cup 2026 multilingual news and match coverage

## About
SoccerIns covers World Cup 2026 news, match results, schedules,
standings and live TV guides in 6 languages (EN/ES/PT/AR/JA/KO).

## Content
- /en/news/        : Latest World Cup news articles
- /en/matches/     : Match reviews and analysis
- /en/schedule/    : Match schedules
- /en/standings/   : Group standings
- /en/live-tv/     : Live broadcast guides by region

## Data sources
- Match data: API-Football (official)
- News: Original reporting + AI-assisted (MiniMax)

## Update frequency
- Match results: Every 5 minutes during live matches
- News articles: 20–50 per day
```

#### 2. E-E-A-T 信号

- 每篇文章加 `dateModified`（AI 引擎优先引用新鲜内容）
- 比赛数据注明来源：「数据来源：API-Football」
- 建立 About 页面，描述 SoccerIns 的定位和数据来源
- 文章中引用权威来源：「According to FIFA official data...」

#### 3. 内容结构对 AI 友好

MiniMax 生成文章时 prompt 需包含指令：使用 H2/H3 标题，直接回答问题。

```
✅ AI 喜欢的结构：
## When is Argentina vs France?
直接给出答案...

## What channel shows World Cup in USA?
- Fox Sports (English)
- Telemundo (Spanish)
```

#### 4. FAQ Schema

直播推荐页、新闻列表页添加：

```json
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Where can I watch World Cup 2026 for free?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "FIFA+ streams select matches for free worldwide..."
    }
  }]
}
```

### 优先级排序

| 优先级 | 项目 | 原因 |
|--------|------|------|
| 🔴 立刻做 | Canonical 标签 | 不做会导致多语言内容互相竞争排名 |
| 🔴 立刻做 | 动态 OG 标签 | 影响社交分享和 AI 爬取理解 |
| 🟡 上线前 | SportsEvent schema | 世界杯期间 Google 会重点展示 |
| 🟡 上线前 | Sitemap `lastmod` | 影响 Google 抓取优先级 |
| 🟡 上线前 | `llms.txt` | 配置简单，GEO 收益高 |
| 🟢 上线后 | FAQ schema | 需配合内容积累 |
| 🟢 上线后 | E-E-A-T About 页面 | 长期信任建设 |
| 🟢 上线后 | Accept-Language 重定向 | 需服务器配置配合 |

---

## 七、待确认事项

- [ ] 新 CDN 服务商确认（替换 Cloudflare 图片处理能力）
- [ ] GAM 后台新广告单元申请（新闻详情页、比赛详情页专属位）
- [ ] MiniMax API 密钥
- [ ] API-Football 账号注册
- [ ] 后台 API 地址和文档（`api.tapmygame.com` 是否继续使用）
- [ ] GitHub Actions 部署配置
- [ ] Google Search Console 验证权限

---

*文档由 Claude AI 根据技术评审对话整理，如有变更请在此文档中更新。*
