# SoccerIns 项目上下文记忆文档

> 供 Claude Code 每次会话开始时读取，快速恢复项目背景。
> 最后更新：2026-05-14（涵盖 Day1–Day6 全部开发记录）

---

## 项目基本情况

| 项目 | 说明 |
|------|------|
| 网站 | soccerins.com — 世界杯2026资讯站 |
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

## API Keys（全部已配置到 .env）

| 变量名 | 值/状态 | 用途 |
|--------|--------|------|
| `API_FOOTBALL_KEY` | `a59ad9d574617a71686ae458a25dafd2` | 赛程/比分/积分榜实时数据 |
| `API_FOOTBALL_BASE` | `https://v3.football.api-sports.io` | API-Football 接口地址 |
| `WORLD_CUP_LEAGUE_ID` | `1` | FIFA 世界杯赛事 ID |
| `WORLD_CUP_SEASON` | `2026` | 赛季年份 |
| `MINIMAX_API_KEY` | `sk-cp-GyV6...`（已配置） | AI新闻生成 + 6语言翻译 |
| `MINIMAX_BASE` | `https://api.minimaxi.chat` | MiniMax 接口地址 |
| `MINIMAX_GROUP_ID` | **不需要**（付费套餐直接用 API Key） | — |
| `CDN_BASE_URL` | `https://bunchthings.com` | Cloudflare CDN（暂定继续使用） |
| `PROD_API_URL` | `https://api.tapmygame.com` | 后端 API |

> ⚠️ MiniMax 付费套餐无需 Group ID，直接 Bearer Token 鉴权即可。

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
- API 端点：`/api/match/schedule?site_id=soccerins`
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

## 数据采集脚本（Day5）✅

| 脚本 | 功能 | 推送接口 |
|------|------|---------|
| `scripts/fetch_matches.js` | 抓全部赛程 | `POST /api/match/schedule/sync` |
| `scripts/fetch_results.js` | 抓已完成赛果（本地缓存 `.results_cache.json`，防超100次/天额度） | `POST /api/match/results/sync` |
| `scripts/fetch_standings.js` | 抓积分榜，转换为 `{ groups: [{name, table}] }` 格式 | `POST /api/match/standings/sync` |

**运行方式：**
```bash
node scripts/fetch_matches.js
node scripts/fetch_results.js
node scripts/fetch_standings.js
```

---

## AI内容生成脚本（Day6）✅

### generate_news.js — 三步流程

```
Step 1: API-Football 拉今日前后 N 天世界杯赛事
Step 2: MiniMax 按赛事状态生成文章
         - 未开赛 → Match Preview（前瞻/预测，约350字）
         - 已结束 → Match Review（赛后综述，约350字）
Step 3: POST /api/article/create 上架到后台（site_id=soccerins-afs）
```

**本地缓存：** `.news_cache.json` 记录已生成 fixture_id，避免重复生成。

**运行方式：**
```bash
node scripts/generate_news.js           # 今日赛事
node scripts/generate_news.js --days 3  # 前后3天赛事
```

### translate_content.js — 6语言翻译

- 读取后端未翻译的英文文章
- 调 MiniMax 翻译为 ES / PT / AR / JA / KO
- 批量上传翻译到 `POST /api/article/translations/sync`

**运行方式：**
```bash
node scripts/translate_content.js              # 翻译所有未翻译文章
node scripts/translate_content.js <article_id> # 翻译指定文章
```

---

## 联调已修复的 Bug（2026-05-14）

| # | 文件 | Bug | 修复方式 |
|---|------|-----|---------|
| 1 | `components/Afs/Header.vue` | `searchText` 未定义，SSR 500 | 改用 `$t('common.search')` |
| 2 | `components/Afs/Sidebar.vue` | 同上 | 改用 `$t('common.search')` |
| 3 | `plugins/nav-data.js` | API 失败注入 `[]`，Sidebar 期望 Object | 改为注入 `{ list: [] }` |
| 4 | `nuxt.config.js` | i18n 缺 `baseUrl`，hreflang 无完整 URL | 添加 `baseUrl: 'https://soccerins.com'` |
| 5 | `Soccer/NewsCardGrid.vue` + `NewsCardRow.vue` | 日期颜色 `$font2=#fff`（白底白字） | 改为 `rgba($font1, 0.5)` |
| 6 | `pages/standings/index.vue` | 图例符号被错误条件包裹 | 简化为始终显示 |
| 7 | `pages/news/_slug.vue` | `newInfo.terms` 可能 undefined，keywords 输出 "undefined" | 加 `\|\| ''` 兜底 |
| 8 | `pages/index.vue` + `pages/news/index.vue` | `InfiniteScrollList1` 传了不存在的 `extra-params` prop | 移除该 prop |
| 9 | `pages/matches/_slug.vue` | JSON-LD `json:` 属性 Nuxt 2 不支持 | 改为 `innerHTML + __dangerouslyDisableSanitizers` |
| 10 | `pages/live-tv/index.vue` | FAQPage JSON-LD 同上 | 同上修复 |

---

## SEO / GEO 完成状态

| 项目 | 状态 | 说明 |
|------|------|------|
| hreflang 标签 | ✅ | nuxt-i18n `seo:true` + `baseUrl` 自动注入 |
| 动态 OG / Twitter Card | ✅ | 首页、新闻详情、比赛详情均已实现 |
| `htmlAttrs` lang + dir | ✅ | 所有页面 `head()` 已设置，阿拉伯语 RTL 正确 |
| SportsEvent JSON-LD | ✅ | `pages/matches/_slug.vue`（`innerHTML` 写法） |
| FAQPage JSON-LD | ✅ | `pages/live-tv/index.vue`（`innerHTML` 写法） |
| Sitemap 精细化 | ✅ | 6语言全路由，changefreq/priority/lastmod 已配置 |
| `llms.txt` | ✅ | `static/llms.txt` 已创建，告知 AI 爬虫站点结构 |
| Canonical 标签 | ⏳ | nuxt-i18n 自动处理，上线前验证 |
| E-E-A-T About 页面 | ⏳ | 上线后持续优化 |

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
<adm-slot-preload adm-id="home-1" adm-unit="/23197833490/soccerins/soccerins_home_1" ads-slot="6667048681" />
<!-- 通栏大位（滚动到视口前半屏预加载） -->
<adm-slot-full adm-id="home-full" adm-unit="/23197833490/soccerins/soccerins_home_full" ads-slot="4080715115" />
<!-- 普通位（滚动进入视口时执行） -->
<adm-slot adm-id="home-3" adm-unit="/23197833490/soccerins/soccerins_home_3" ads-slot="6028318341" />
```

> 新页面需要新广告位时，必须在 GAM 后台申请新 ad unit，拿到正式 unit path 和 slot ID 再写代码。

---

## CDN 情况

- 当前：**Cloudflare（bunchthings.com）**，决定暂时继续使用
- 新图片全部用 `<img :src="imgUrl" loading="lazy" />`，**不用** `<NuxtImg>`
- `.env` 里已配置 `CDN_BASE_URL=https://bunchthings.com`

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

3. **图片不用 `<NuxtImg>`**，用 `<img>` + CDN 变量

4. **阿拉伯语 RTL**：所有新页面的 `head()` 要加：
   ```js
   htmlAttrs: { dir: this.$i18n.locale === 'ar' ? 'rtl' : 'ltr' }
   ```

5. **API-Football 额度**：100次/天，`fetch_results.js` 已做缓存，其他脚本按需调用

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

## 本地开发说明

```bash
# 安装依赖
yarn install

# 启动开发服务器（注意：运行在云端容器，本地浏览器无法通过 localhost 直接访问）
yarn dev

# 注意：本地开发时 api.tapmygame.com 会返回 403（IP 白名单限制）
# 这是正常现象，页面会降级显示空状态，不影响开发
```

---

## 下一步（Day 7）

1. **确认后端文章上架接口** — `generate_news.js` 的 `POST /api/article/create` 字段是否与实际接口匹配
2. **配置定时任务（Cron）** — 5个脚本按频率自动运行（详见 `TODO.md`）
3. **上线部署** — CDN验证 → Google Search Console 提交 → 灰度英语版 → 全量发布

---

*文档由 Claude Code 根据完整开发过程整理（Day1–Day6），每次会话开始时读取此文件恢复上下文。*
