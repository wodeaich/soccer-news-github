# SoccerIns 世界杯网站改版规划

## 项目概述

基于现有 soccerins.com 网站进行改版，打造多语言世界杯资讯网站。

---

## 一、需求确认

### 1.1 功能模块（4个）

| 模块 | 说明 | 页面路径 |
|------|------|----------|
| 世界杯新闻 | 最新资讯、转会消息、球队动态 | `/{lang}/news/` |
| 比赛日程与结果 | 赛程表、实时比分、比赛结果、积分榜 | `/{lang}/schedule/` `/{lang}/results/` |
| 比赛回顾 | 比赛详细回顾、数据分析、精彩集锦 | `/{lang}/matches/{slug}/` |
| 直播推荐 | 直播渠道、观看指南、平台推荐 | `/{lang}/live-tv/` |

### 1.2 支持语言（6种）

| 语言代码 | 语言名称 | URL前缀 |
|----------|----------|---------|
| en | 英语（默认） | `/en/` |
| es | 西班牙语 | `/es/` |
| pt | 葡萄牙语 | `/pt/` |
| ar | 阿拉伯语 | `/ar/` |
| ja | 日语 | `/ja/` |
| ko | 韩语 | `/ko/` |

---

## 二、网站结构

### 2.1 URL结构设计

```
soccerins.com/
│
├── /en/                          ← 英语版（默认）
│   ├── /en/                      ← 首页
│   ├── /en/news/                 ← 新闻列表
│   ├── /en/news/{slug}/          ← 新闻详情
│   ├── /en/schedule/             ← 赛程表
│   ├── /en/results/              ← 比赛结果
│   ├── /en/matches/{slug}/       ← 比赛详情（含回顾）
│   ├── /en/standings/            ← 积分榜
│   ├── /en/live-tv/              ← 直播推荐
│   └── /en/teams/{slug}/         ← 球队详情
│
├── /es/                          ← 西班牙语版
│   ├── /es/
│   ├── /es/noticias/
│   ├── /es/noticias/{slug}/
│   ├── /es/calendario/
│   ├── /es/resultados/
│   ├── /es/partidos/{slug}/
│   ├── /es/clasificacion/
│   ├── /es/tv-en-vivo/
│   └── /es/equipos/{slug}/
│
├── /pt/                          ← 葡萄牙语版
│   ├── /pt/
│   ├── /pt/noticias/
│   ├── /pt/noticias/{slug}/
│   ├── /pt/cronograma/
│   ├── /pt/resultados/
│   ├── /pt/jogos/{slug}/
│   ├── /pt/classificacao/
│   ├── /pt/tv-ao-vivo/
│   └── /pt/times/{slug}/
│
├── /ar/                          ← 阿拉伯语版（RTL布局）
│   ├── /ar/
│   ├── /ar/news/
│   ├── /ar/news/{slug}/
│   ├── /ar/schedule/
│   ├── /ar/results/
│   ├── /ar/matches/{slug}/
│   ├── /ar/standings/
│   ├── /ar/live-tv/
│   └── /ar/teams/{slug}/
│
├── /ja/                          ← 日语版
│   ├── /ja/
│   ├── /ja/news/
│   ├── /ja/news/{slug}/
│   ├── /ja/schedule/
│   ├── /ja/results/
│   ├── /ja/matches/{slug}/
│   ├── /ja/standings/
│   ├── /ja/live-tv/
│   └── /ja/teams/{slug}/
│
└── /ko/                          ← 韩语版
    ├── /ko/
    ├── /ko/news/
    ├── /ko/news/{slug}/
    ├── /ko/schedule/
    ├── /ko/results/
    ├── /ko/matches/{slug}/
    ├── /ko/standings/
    ├── /ko/live-tv/
    └── /ko/teams/{slug}/
```

### 2.2 URL命名规则

- 英语：`/en/news/world-cup-2026-preview/`
- 西班牙语：`/es/noticias/copa-mundial-2026-previa/`
- 葡萄牙语：`/pt/noticias/copa-do-mundo-2026-previa/`
- 阿拉伯语：`/ar/news/كأس-العالم-2026/`
- 日语：`/ja/news/ワールドカップ2026/`
- 韩语：`/ko/news/월드컵-2026/`

每种语言的URL slug都是本地化的，这对SEO非常重要。

---

## 三、功能模块详细设计

### 3.1 模块1：世界杯新闻

**页面路径：** `/{lang}/news/`

**页面内容：**

新闻列表页：
- 置顶新闻（1-2条）
- 最新新闻（分页加载）
- 分类筛选（全部/转会/球队/球员）
- 搜索功能

新闻详情页：
- 标题
- 发布时间
- 封面图片
- 正文内容
- 相关新闻推荐
- 分享按钮

**数据来源：**
- API-Football（官方新闻）
- NewsData.io（全球新闻）
- MiniMax AI生成（原创内容）

**更新频率：** 每天20-50篇

---

### 3.2 模块2：比赛日程与结果

**页面路径：** `/{lang}/schedule/` 和 `/{lang}/results/`

**页面内容：**

赛程表页面：
- 按日期筛选
- 按小组筛选（A组/B组/C组...）
- 按阶段筛选（小组赛/淘汰赛/决赛）
- 比赛时间（当地时间）
- 对阵双方
- 直播渠道快速入口

比赛结果页面：
- 今日比赛结果
- 历史比赛结果
- 比分详情
- 快速跳转到比赛回顾

积分榜页面：
- 小组积分榜
- 进球榜
- 助攻榜
- 红黄牌榜

比赛详情页：
- 基本信息（时间、场地、裁判）
- 比分
- 进球详情
- 红黄牌
- 换人信息
- 技术统计（控球率、射门、角球等）
- 快速跳转到比赛回顾

**数据来源：** API-Football（实时数据），每5分钟自动更新

---

### 3.3 模块3：比赛回顾

**页面路径：** `/{lang}/matches/{slug}/`

**页面内容：**

比赛基本信息：
- 对阵双方
- 最终比分
- 比赛时间
- 比赛场地

比赛回顾文章：
- 比赛概述（200-300字）
- 上半场回顾
- 下半场回顾
- 关键时刻分析
- 球员表现评分
- 战术分析
- 赛后声音

数据分析：
- 进球时间线
- 技术统计对比
- 球员热力图（如数据支持）
- 关键数据对比

精彩集锦：
- 进球视频（如可用）
- 精彩瞬间图片
- 赛后采访

相关推荐：
- 两队其他比赛
- 相关新闻

**数据来源：**
- API-Football（比赛数据）
- MiniMax AI（生成回顾文章）
- 赛后2小时内自动生成

---

### 3.4 模块4：直播推荐

**页面路径：** `/{lang}/live-tv/`

**页面内容：**

今日直播安排：
- 今日比赛列表
- 开球时间
- 直播平台列表
- 快速跳转链接

直播平台推荐（按地区分类）：

| 地区 | 平台 |
|------|------|
| 英语地区 | Fox Sports（美国）、BBC/ITV（英国）、TSN（加拿大）、Optus Sport（澳大利亚） |
| 西班牙语地区 | Telemundo（美国）、Mediaset（西班牙）、TV Azteca（墨西哥）、TyC Sports（阿根廷） |
| 葡萄牙语地区 | Globo（巴西）、SporTV（巴西）、RTP（葡萄牙） |
| 阿拉伯语地区 | beIN Sports（中东）、Al Jazeera（中东） |
| 日语地区 | NHK（日本）、Fuji TV（日本）、TV Asahi（日本） |
| 韩语地区 | KBS（韩国）、MBC（韩国）、SBS（韩国） |

免费直播渠道：
- FIFA+（官方免费）
- 各国公共电视台
- 免费流媒体平台

付费直播平台：
- 各平台价格对比
- 优缺点分析
- 订阅链接

**特点：**
- 根据用户IP自动推荐当地直播渠道
- 支持手动切换地区
- 实时更新直播链接

---

## 四、数据库设计

### 4.1 articles（文章表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| article_code | VARCHAR | 文章编号 |
| type | VARCHAR | 文章类型（news/match_review/preview） |
| status | VARCHAR | 状态（draft/published） |
| match_id | INT | 关联比赛（可选） |
| cover_image | VARCHAR | 封面图片 |
| published_at | DATETIME | 发布时间 |
| created_at | DATETIME | 创建时间 |

### 4.2 article_translations（文章翻译表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| article_id | INT | 文章ID |
| language | VARCHAR | 语言代码（en/es/pt/ar/ja/ko） |
| title | VARCHAR | 标题 |
| summary | TEXT | 摘要 |
| content | LONGTEXT | 正文 |
| slug | VARCHAR | URL别名 |
| meta_title | VARCHAR | SEO标题 |
| meta_desc | VARCHAR | SEO描述 |
| keywords | VARCHAR | 关键词 |

### 4.3 matches（比赛表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| external_id | VARCHAR | 外部API比赛ID |
| home_team_id | INT | 主队ID |
| away_team_id | INT | 客队ID |
| match_time | DATETIME | 比赛时间 |
| venue | VARCHAR | 比赛场地 |
| stage | VARCHAR | 阶段（group/round16/quarter/semi/final） |
| home_score | INT | 主队比分 |
| away_score | INT | 客队比分 |
| status | VARCHAR | 状态（scheduled/live/finished） |

### 4.4 teams（球队表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| external_id | VARCHAR | 外部API球队ID |
| name_en | VARCHAR | 英文名 |
| name_es | VARCHAR | 西班牙语名 |
| name_pt | VARCHAR | 葡萄牙语名 |
| name_ar | VARCHAR | 阿拉伯语名 |
| name_ja | VARCHAR | 日语名 |
| name_ko | VARCHAR | 韩语名 |
| code | VARCHAR | 球队代码 |
| logo_url | VARCHAR | Logo图片 |
| group_name | VARCHAR | 所在小组 |

### 4.5 live_channels（直播渠道表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| region | VARCHAR | 地区（us/uk/br/ar/jp/kr等） |
| language | VARCHAR | 语言 |
| channel_name | VARCHAR | 渠道名称 |
| channel_type | VARCHAR | 类型（free/paid） |
| website_url | VARCHAR | 官网链接 |
| logo_url | VARCHAR | Logo图片 |
| description | TEXT | 描述 |
| sort_order | INT | 排序 |

### 4.6 standings（积分榜表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| team_id | INT | 球队ID |
| group_name | VARCHAR | 小组 |
| played | INT | 已赛 |
| won | INT | 胜 |
| draw | INT | 平 |
| lost | INT | 负 |
| goals_for | INT | 进球 |
| goals_against | INT | 失球 |
| points | INT | 积分 |

---

## 五、技术方案

### 5.1 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 前端 | Nuxt.js + nuxt-i18n | 现有框架 + 多语言模块 |
| 后端 | GO | 现有后台 |
| 数据采集 | Node.js | 脚本 |
| AI生成 | MiniMax API | 内容生成和翻译 |
| 足球数据 | API-Football | 免费100次/天 |
| 新闻数据 | NewsData.io | 免费200次/天 |
| 部署 | GitHub Actions | 自动部署 |

### 5.2 数据采集脚本

| 脚本 | 功能 | 执行频率 |
|------|------|----------|
| fetch_matches.js | 从API-Football获取赛程 | 每天6点 |
| fetch_results.js | 从API-Football获取比赛结果 | 每5分钟 |
| fetch_standings.js | 从API-Football获取积分榜 | 每小时 |
| generate_news.js | 用MiniMax生成新闻文章 | 每天7点 |
| generate_reviews.js | 用MiniMax生成比赛回顾 | 每天8点 |
| translate_content.js | 用MiniMax翻译成6种语言 | 每天8点30 |
| upload_to_api.js | 提交到GO后台API | 每天9点 |

### 5.3 后台API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/articles | POST | 创建文章 |
| /api/articles | GET | 获取文章列表 |
| /api/articles/:id | GET | 获取文章详情 |
| /api/matches | POST | 创建比赛 |
| /api/matches | GET | 获取比赛列表 |
| /api/teams | POST | 创建球队 |
| /api/teams | GET | 获取球队列表 |
| /api/standings | GET | 获取积分榜 |
| /api/live-channels | GET | 获取直播渠道 |

---

## 六、SEO优化方案

### 6.1 Hreflang标签

每个页面的 `<head>` 标签里添加：

```html
<link rel="alternate" hreflang="en" href="https://soccerins.com/en/news/xxx/" />
<link rel="alternate" hreflang="es" href="https://soccerins.com/es/news/xxx/" />
<link rel="alternate" hreflang="pt" href="https://soccerins.com/pt/news/xxx/" />
<link rel="alternate" hreflang="ar" href="https://soccerins.com/ar/news/xxx/" />
<link rel="alternate" hreflang="ja" href="https://soccerins.com/ja/news/xxx/" />
<link rel="alternate" hreflang="ko" href="https://soccerins.com/ko/news/xxx/" />
<link rel="alternate" hreflang="x-default" href="https://soccerins.com/en/news/xxx/" />
```

### 6.2 Sitemap

生成多语言sitemap：

```
https://soccerins.com/sitemap.xml          ← 主sitemap
https://soccerins.com/sitemap-en.xml       ← 英语sitemap
https://soccerins.com/sitemap-es.xml       ← 西班牙语sitemap
https://soccerins.com/sitemap-pt.xml       ← 葡萄牙语sitemap
https://soccerins.com/sitemap-ar.xml       ← 阿拉伯语sitemap
https://soccerins.com/sitemap-ja.xml       ← 日语sitemap
https://soccerins.com/sitemap-ko.xml       ← 韩语sitemap
```

### 6.3 结构化数据

添加JSON-LD结构化数据：

```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "文章标题",
  "image": "封面图片URL",
  "datePublished": "发布时间",
  "author": {
    "@type": "Organization",
    "name": "SoccerIns"
  }
}
```

### 6.4 页面速度优化

- 图片使用WebP格式
- 启用CDN加速
- 启用Gzip压缩
- 懒加载图片
- 减少JavaScript大小

---

## 七、开发执行计划

### 第1周：多语言架构 + 基础功能

| 天数 | 任务 |
|------|------|
| 第1天 | 安装nuxt-i18n、配置6种语言、创建语言文件框架 |
| 第2天 | 改造URL结构、配置路由、添加hreflang标签 |
| 第3天 | 创建新闻列表页面（多语言）、创建新闻详情页面（多语言） |
| 第4天 | 创建赛程表页面、创建比赛结果页面、创建积分榜页面 |
| 第5天 | 创建比赛详情页面、创建比赛回顾模板、测试所有页面 |

### 第2周：直播模块 + 数据采集

| 天数 | 任务 |
|------|------|
| 第6天 | 创建直播推荐页面、设计直播渠道数据结构、录入各地区直播渠道 |
| 第7天 | 创建数据采集脚本框架、配置API-Football、测试数据采集 |
| 第8天 | 创建fetch_matches.js、fetch_results.js、fetch_standings.js |
| 第9天 | 对接MiniMax API、创建generate_news.js、generate_reviews.js |
| 第10天 | 创建translate_content.js、upload_to_api.js、测试完整流程 |

### 第3周：SEO优化 + 上线

| 天数 | 任务 |
|------|------|
| 第11天 | 生成sitemap、配置robots.txt、添加结构化数据 |
| 第12天 | 页面速度优化、图片优化、CDN配置 |
| 第13天 | Google Search Console配置、提交sitemap、测试所有功能 |
| 第14天 | 灰度发布（先上英语版）、监控错误、修复问题 |
| 第15天 | 全量发布（6种语言）、监控流量、完成上线 |

**总计：15个工作日（3周）**

---

## 八、免费API资源

| API | 用途 | 免费额度 | 网址 |
|-----|------|----------|------|
| API-Football | 赛程、比分、球队数据 | 100次/天 | https://www.api-football.com/ |
| NewsData.io | 新闻数据 | 200次/天 | https://newsdata.io/ |
| TheSportsDB | 球队Logo、球员照片 | 100次/天 | https://www.thesportsdb.com/ |
| Football-Data.org | 补充数据 | 无限制 | https://www.football-data.org/ |
| MiniMax | AI内容生成和翻译 | 根据套餐 | https://platform.minimaxi.com/ |

---

## 九、成本估算

| 项目 | 费用 | 说明 |
|------|------|------|
| 服务器 | 现有 | 使用现有服务器 |
| 域名 | 现有 | 使用现有域名 |
| API-Football | 免费 | 100次/天免费额度 |
| NewsData.io | 免费 | 200次/天免费额度 |
| MiniMax API | 根据使用量 | 内容生成和翻译 |
| GitHub | 免费 | 代码托管 |

**总成本：主要为MiniMax API调用费用**

---

## 十、预期效果

| 指标 | 改版前 | 改版后（3个月） | 改版后（6个月） |
|------|--------|-----------------|-----------------|
| 支持语言 | 1-2种 | 6种 | 6种 |
| 内容更新 | 人工 | 自动化 | 自动化 |
| 日均流量 | 有限 | 3-5倍增长 | 10-20倍增长 |
| 覆盖地区 | 英语国家 | 全球6个地区 | 全球6个地区 |

---

## 十一、待确认事项

- [ ] 现有网站代码GitHub仓库地址
- [ ] 服务器SSH登录信息
- [ ] MiniMax API密钥
- [ ] 后台API地址和文档
- [ ] API-Football账号注册
- [ ] GitHub Token

---

## 十二、联系方式

如有问题，请在GitHub Issues中提出。

---

**文档版本：** v1.0  
**最后更新：** 2026-05-12  
**作者：** SoccerIns Team
