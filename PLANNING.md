# CompSoccer 世界杯改版 — 规划与技术决策文档

> 本文档整理自项目规划讨论，记录代码现状、技术决策、开发规范和执行计划。
> 最后更新：2026-05-13

---

## 一、现有代码库分析（master 分支）

### 技术栈

- **框架**：Nuxt.js 2（`target: "static"` 静态生成模式）
- **语言**：Vue 2 + JavaScript
- **CSS**：SCSS
- **HTTP**：@nuxtjs/axios
- **构建**：Yarn，生产优化用 Terser + PurgeCSS
- **后端 API**：`api.tapmygame.com`，站点 ID `soccerins`

### 目录结构

```
master/
├── pages/                  ← 页面路由
│   ├── index.vue           ← 首页
│   ├── afsearch/           ← 文章搜索
│   ├── casual/             ← 休闲游戏
│   ├── category/           ← 分类页
│   ├── detail/             ← 文章详情
│   ├── download/           ← 下载页
│   ├── game/               ← 游戏详情
│   ├── games/              ← 游戏列表
│   ├── hot/                ← 热门内容
│   ├── landing/            ← 落地页
│   ├── live/               ← 直播
│   └── search/             ← 搜索
│
├── components/             ← 公共组件（含完整广告系统）
├── plugins/                ← axios / global-data / report / nav-data
├── utils/                  ← utils.js / env.js
├── static/                 ← 静态文件（含 ads.txt / 各语言法律页）
├── assets/                 ← CSS / 字体 / 图片
├── app.html                ← 全局 HTML 模板（广告核心）
└── nuxt.config.js
```

### 关键发现

| 发现 | 说明 |
|------|------|
| 现在不是纯足球新闻站 | 路由含 `game/`、`games/`、`casual/`，实际是游戏+资讯混合平台 |
| 已有多语言静态法律页 | `static/` 下有日语、韩语、繁体中文的隐私/协议页面 |
| 广告系统完整 | AdmSlot、GoogleAd、AdLoading 等组件已就绪 |
| 埋点完整 | commonsEvent.js、dataMonitor.js、trackEvent.js 已有用户行为追踪 |
| nuxt-i18n 未引入 | 当前无多语言路由，这是改版的主要改动点 |

---

## 二、CDN 迁移注意事项（从 Cloudflare 迁出）

### 现有 CF 硬依赖

**1. `nuxt.config.js` 图片 provider 写死了 CF：**

```js
image: {
  provider: "cloudflare",
  cloudflare: {
    baseURL: "https://bunchthings.com"
  }
}
```

**2. `<NuxtImg>` 依赖 CF Image Resizing 能力：**

```html
<NuxtImg format="auto" fit="cover" width="280" height="280" :src="item.icon" />
```

`format="auto"`、`fit="cover"` 是 CF 专属功能，换 CDN 后会失效。

### 迁移规范

- **迁移前不新增任何 `<NuxtImg>` 用法**，所有新图片改用 `<img>` + 环境变量：

```html
<img :src="`${$config.cdnBase}${item.icon}`" loading="lazy" />
```

- `.env` 加 `CDN_BASE_URL`，图片地址全部走这个变量
- `nuxt.config.js` 的 `image.provider` 改成 `ipx`（本地）或等新 CDN 确定后配置
- **CDN 切换完成前不上线**，避免图片 404

---

## 三、广告代码保留规范（绝对不动）

### 两套广告系统

| 系统 | 组件 | 类型 |
|------|------|------|
| GAM（Google Ad Manager） | `AdmSlot.vue` / `AdmSlotFull.vue` / `AdmSlotPreload.vue` | 程序化广告，走 `googletag` |
| AdSense（AFC） | `GoogleAd.vue` | 标准 AdSense，走 `adsbygoogle` |
| 加载遮罩 | `AdLoading.vue` | 监听 `ins.adsbygoogle` 出现后隐藏 loading |

### 关键标识符（不能改）

```
# ads.txt
google.com, pub-1853000876464912, DIRECT, f08c47fec0942fa0
google.com, pub-3628028403766401, DIRECT, f08c47fec0942fa0

# GAM 广告单元
/23197833490/soccerins/soccerins_home_1      → ads-slot="6667048681"
/23197833490/soccerins/soccerins_home_full   → ads-slot="4080715115"
/23197833490/soccerins/soccerins_home_3      → ads-slot="6028318341"
/23197833490/soccerins/soccerins_interstitial  ← 插页广告
/23197833490/soccerins/soccerins_anchor        ← 锚定广告

# AdSense Publisher ID
ca-pub-1853000876464912
```

### app.html 完整保留（核心中枢）

`app.html` 包含以下内容，**整个文件不动**：

| 代码块 | 关键 ID |
|--------|--------|
| Google Analytics (GA4) | `G-4ZQQBJW72Y` |
| Google Tag Manager | `GTM-MVL6T7G3` |
| GPT 脚本（GAM） | `securepubads.g.doubleclick.net/tag/js/gpt.js` |
| GAM 插页广告初始化 | `soccerins_interstitial` |
| GAM 锚定广告初始化 | `soccerins_anchor` |
| GAM fallback → AdSense | `pub-1853000876464912` |
| AdSense 脚本 | `ca-pub-1853000876464912` |
| IP 采集上报 | `wc.bunchthings.com/youknowwho.js` |
| 广告点击埋点 | `C_AL` / `D_AL` / `D_RE` / `D_FI` / `D_IP` |

### GAM fallback 机制（关键，不能破坏）

GAM 广告位无填充时自动切 AdSense 兜底，依赖：
1. `AdmSlot` 组件里的 `<div :data-slot="adsSlot">` — **不能删**
2. `app.html` 里的 `slotRenderEnded` 监听代码 — **不能删**

### 三个 AdmSlot 组件的区别

| 组件 | 触发时机 | 适用场景 |
|------|----------|----------|
| `AdmSlotPreload` | 页面加载立即执行 | 首屏广告位 |
| `AdmSlotFull` | 滚动到视口前半屏预加载 | 通栏大广告 |
| `AdmSlot` | 滚动进入视口时执行 | 普通广告位 |

### 新页面放广告规则

沿用现有参数，不自造 slot ID：

```html
<adm-slot-preload
  adm-id="news-1"
  adm-unit="/23197833490/soccerins/soccerins_home_1"
  ads-slot="6667048681"
/>
```

**需要新广告位时，必须在 GAM 后台新建 ad unit，拿到新参数后再写代码。**

---

## 四、多语言链接方案

### 核心方案：nuxt-i18n + prefix 策略（最简化版）

所有语言统一使用相同路径名，不做语言本地化路径（省去大量配置复杂度）：

```
/en/news/     /es/news/     /pt/news/
/en/schedule/ /es/schedule/ /pt/schedule/
/en/results/  /es/results/  /pt/results/
```

### nuxt.config.js 配置

```js
modules: ['@nuxtjs/axios', 'nuxt-i18n'],

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
  seo: true,   // 自动生成 hreflang
  lazy: true,
}
```

### 页面内链接写法

```html
<!-- ✅ 正确：用 localePath() -->
<nuxt-link :to="localePath('/news/')">News</nuxt-link>

<!-- ❌ 错误：写死语言 -->
<a href="/en/news/">News</a>
```

### 语言切换器行为

| 当前页面 | 切换语言结果 |
|----------|-------------|
| 列表页 `/es/news/` | → `/en/news/` ✅ 完美 |
| 赛程页 `/es/schedule/` | → `/en/schedule/` ✅ 完美 |
| 文章详情页 `/es/news/copa-mundial/` | → `/en/news/`（列表页）⚠️ 可接受 |

文章详情页跳列表页是因为各语言文章在后台是独立 ID，无关联字段，无需后台改动即可接受此取舍。

### 阿拉伯语 RTL 处理

```js
// plugins/i18n.js
export default ({ app }) => {
  app.i18n.onBeforeLanguageSwitch = (_, newLang) => {
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
  }
}
```

---

## 五、用户首次访问语言检测

### 方案：浏览器语言检测 + Cookie 记忆（纯客户端，零服务器配置）

```
用户访问 compsoccer.com/
        ↓
有 cookie preferred_lang？
  ├── 有 → 直接跳对应语言（回访用户）
  └── 没有 → 读 navigator.languages
              ├── 支持的语言 → 跳对应语言
              └── 不支持 → 跳 /en/（兜底）
              ↓
          写入 cookie（有效期1年）
```

```js
// plugins/lang-redirect.js
export default ({ route, redirect }) => {
  if (route.path !== '/') return

  const supported = ['en', 'es', 'pt', 'ar', 'ja', 'ko']

  // 1. 优先 cookie
  const saved = document.cookie
    .split('; ')
    .find(r => r.startsWith('preferred_lang='))
    ?.split('=')[1]

  if (saved && supported.includes(saved)) {
    return redirect(301, `/${saved}/`)
  }

  // 2. 新用户：遍历浏览器语言优先级列表
  const langs = navigator.languages || [navigator.language || 'en']
  let target = 'en'
  for (const lang of langs) {
    const code = lang.slice(0, 2).toLowerCase()
    if (supported.includes(code)) { target = code; break }
  }

  document.cookie = `preferred_lang=${target}; path=/; max-age=${60 * 60 * 24 * 365}`
  redirect(301, `/${target}/`)
}
```

```js
// nuxt.config.js — 必须 ssr: false
plugins: [
  { src: '~/plugins/lang-redirect.js', ssr: false },
]
```

用户切换语言时同步更新 cookie：

```js
switchLang(langCode) {
  document.cookie = `preferred_lang=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}`
  this.$router.push(this.switchLocalePath(langCode))
}
```

---

## 六、SEO 规范

### 必须做（上线前）

**1. Canonical 标签**

每个页面 canonical 指向自身，不指向英语版：

```html
<link rel="canonical" href="https://compsoccer.com/es/news/copa-mundial/" />
```

nuxt-i18n `seo: true` 会自动处理，但需验证动态路由页面。

**2. 动态 OG + Twitter Card（每页每语言）**

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

**3. Sitemap 精细化**

```xml
<url>
  <loc>https://compsoccer.com/en/news/world-cup-preview/</loc>
  <lastmod>2026-05-13</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

| 页面类型 | changefreq | priority |
|----------|-----------|----------|
| 首页 | hourly | 1.0 |
| 比赛结果页 | daily | 0.9 |
| 新闻列表页 | daily | 0.8 |
| 新闻详情页 | weekly | 0.7 |
| 直播推荐页 | daily | 0.8 |

### 结构化数据（JSON-LD）

| 页面 | Schema 类型 |
|------|------------|
| 新闻详情页 | `NewsArticle`（含 `dateModified`、`inLanguage`） |
| 比赛详情页 | `SportsEvent`（含 `homeTeam`、`awayTeam`、`startDate`） |
| 列表页 | `BreadcrumbList` |
| 直播推荐页 | `ItemList` + `FAQPage` |

---

## 七、GEO（生成式引擎优化）规范

GEO 针对 ChatGPT、Perplexity、Google AI Overview、Bing Copilot 等 AI 搜索引擎。

### 上线前必做

**1. `llms.txt` 文件（放根目录）**

```
# compsoccer.com/llms.txt

> CompSoccer: World Cup 2026 multilingual news and match coverage

## About
CompSoccer covers World Cup 2026 news, match results, schedules,
standings and live TV guides in 6 languages (EN/ES/PT/AR/JA/KO).

## Content
- /en/news/     : Latest World Cup news
- /en/matches/  : Match reviews and analysis
- /en/schedule/ : Match schedules
- /en/live-tv/  : Live broadcast guides by region

## Data sources
- Match data: API-Football (official)
- News: Original reporting + AI-assisted (MiniMax)

## Update frequency
- Match results: Every 5 minutes during matches
- News: 20-50 articles per day
```

**2. MiniMax 生成文章的 prompt 规范**

生成文章时 prompt 加入以下要求：
- 使用 H2/H3 标题，直接回答问题
- 开头加一句话总结（AI 引用首选）
- 关键数据用表格而非段落
- 标注数据来源（"According to API-Football data..."）
- 每篇文章包含 `datePublished` 和 `dateModified`

### 上线后持续优化

- About 页面（E-E-A-T 信任建设）
- FAQ schema（直播推荐页、赛程页优先）
- `dateModified` 字段（AI 引擎偏好新鲜内容）

---

## 八、开发执行计划（最简化版）

> 零后端改动 · 零服务器配置 · 广告代码完全不动

### 第1周：框架搭建

| 天 | 任务 |
|----|------|
| Day 1 | 环境准备，配置新 CDN 变量，`image.provider` 改为 `ipx`，建开发分支 |
| Day 2 | 安装 nuxt-i18n，配置6种语言，创建 `locales/` 目录 |
| Day 3 | 改造 Header（加语言切换器），写浏览器语言检测插件 |
| Day 4 | 新闻列表页 `/{lang}/news/`，新闻详情页 `/{lang}/news/{slug}/` |
| Day 5 | 赛程 `/{lang}/schedule/`，结果 `/{lang}/results/`，积分榜 `/{lang}/standings/` |

### 第2周：功能完善

| 天 | 任务 |
|----|------|
| Day 6 | 比赛详情页 `/{lang}/matches/{slug}/` |
| Day 7 | 直播推荐页 `/{lang}/live-tv/` |
| Day 8 | 数据采集脚本：`fetch_matches.js`、`fetch_results.js`、`fetch_standings.js` |
| Day 9 | MiniMax 对接：`generate_news.js`、`generate_reviews.js`、`translate_content.js` |
| Day 10 | Sitemap 精细化，`llms.txt`，JSON-LD schema，`robots.txt` |

### 第3周：上线

| 天 | 任务 |
|----|------|
| Day 11 | 新 CDN 切换完成，图片地址统一替换，测试图片加载 |
| Day 12 | 灰度上线英语版，Google Search Console 提交，监控报错 |
| Day 13 | 开启其余5种语言，全站回归测试 |
| Day 14 | 全量发布，监控流量和报错 |

### 关键风险

| 风险 | 规避方法 |
|------|----------|
| CDN 切换期间图片 404 | Day 11 前不上线 |
| nuxt-i18n 与现有路由冲突 | Day 2-3 先做路由验证 |
| API-Football 免费额度100次/天耗尽 | `fetch_results.js` 做缓存，比赛间隙降低频率 |
| 阿拉伯语 RTL 布局错乱 | 上线前单独测试 ar 语言所有页面 |

---

## 九、不需要做的事（明确排除）

- ❌ 跨语言 slug 映射（后台无关联字段，接受语言切换跳列表页）
- ❌ 后端新增接口
- ❌ 服务器 Nginx / CDN 规则配置语言跳转
- ❌ 任何广告代码改动
- ❌ 本地化路径名（noticias / cronograma 等，统一用 news / schedule）

---

*文档版本：v1.0 | 整理日期：2026-05-13*
