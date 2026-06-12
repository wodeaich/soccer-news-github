# 后台接口需求：列出"已发布"文章（供静态发版同步）

> 面向：管理后台（gin-vue-admin）开发
> 用途：CompSoccer 世界杯站采用「后台录入 + 审核 → 发版」流程。
> 发版程序需要从后台读取**已审核发布**的文章，写入仓库 `content/` 后生成静态页。
>
> **重要前提：每篇文章相互独立**——同一篇文章的不同语言是**各自独立录入**的，
> 各有自己的 id 和 slug，彼此不关联。因此本接口**无需做任何分组/关联**，
> 只要把已发布文章**平铺列出**，每条带上它的语言即可。

---

## 一、接口概述

| 项目 | 内容 |
|------|------|
| 类型 | HTTP **GET**（只读查询，不修改任何数据）|
| 作用 | 平铺返回某站点下所有「已发布」文章，每条是一个独立的语言版本 |
| 鉴权 | Header `x-token`（与现有后台接口一致）|
| 数据来源 | `article_library` 表 |
| 调用方 | GitHub Actions 发版工作流（每次发版前调用一次）|

> 文章的创建/录入/审核沿用现有后台流程；本接口**只负责把已发布结果读出来**，不新增写入逻辑。

---

## 二、请求规格

```
GET /api/article/published_list?site_id=soccerins-afs&page=1&size=50
Header:
  x-token: <管理后台 JWT>
```

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `site_id` | 是 | 站点标识，过滤本站文章 | `soccerins-afs` |
| `page` | 否 | 页码，从 1 开始，默认 1 | `1` |
| `size` | 否 | 每页条数，默认 50，建议上限 100 | `50` |
| `language` | 否 | 可选，按语言过滤；不传则返回全部语言 | `en` |

---

## 三、返回规格（JSON）——平铺，每条一个独立文章

```json
{
  "success": true,
  "data": {
    "total": 320,
    "page": 1,
    "size": 50,
    "list": [
      {
        "id": 1234567,
        "slug": "argentina-vs-brazil-preview",
        "language": "en",
        "article_type": "preview",
        "title": "Argentina vs Brazil: World Cup 2026 preview",
        "summary": "A blockbuster Group C clash awaits as Argentina face Brazil...",
        "content": "<p>A blockbuster Group C clash awaits...</p>",
        "cover": "https://cdn.example.com/cover.jpg",
        "keywords": "world-cup-2026,argentina,brazil",
        "fixture_id": 1234567,
        "published_at": "2026-06-11T10:00:00Z",
        "updated_at": "2026-06-11T12:30:00Z"
      },
      {
        "id": 1234568,
        "slug": "argentina-brasil-previa",
        "language": "es",
        "article_type": "preview",
        "title": "Argentina vs Brasil: previa del Mundial 2026",
        "summary": "Un choque estelar del Grupo C...",
        "content": "<p>Un choque estelar del Grupo C...</p>",
        "cover": "https://cdn.example.com/cover.jpg",
        "keywords": "mundial-2026,argentina,brasil",
        "fixture_id": 1234567,
        "published_at": "2026-06-11T11:00:00Z",
        "updated_at": "2026-06-11T11:00:00Z"
      }
      // ... 每条都是独立文章（含独立 id / slug / language）
    ]
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 | 对应表字段 |
|------|------|------|-----------|
| `data.total` | int | 已发布文章总数（用于分页）| count(*) |
| `id` | int | 文章主键 | `article_library.id` |
| `slug` | string | 该文章的 URL 别名（**每条独立、唯一**）| web-slug |
| `language` | string | 语言码：`en`/`es`/`pt`/`ar`/`ja`/`ko` | `language` |
| `article_type` | string | 文章类型：`preview`/`review`/`news` | `article_type` |
| `title` | string | 标题 | `name` |
| `summary` | string | 摘要/首段 | `first_paragraph` |
| `content` | string | 正文（HTML 原文，不转义/不截断）| `content` |
| `cover` | string | 封面图 URL | `cover` |
| `keywords` | string | 关键词，逗号分隔 | `keywords` |
| `fixture_id` | int / null | 关联赛事 ID（可选）| 扩展字段 |
| `published_at` | string | 发布时间（ISO 8601 或时间戳，统一即可）| 发布时间 |
| `updated_at` | string | 最后更新时间 | `updated_at` |

---

## 四、必须满足的规则（验收点）

1. **只返回「已发布」文章**：`status = 已发布`（评估文档中 `status=2`），草稿/待审核不返回。
2. **按 `site_id` 过滤**：只返回该站点的文章。
3. **平铺返回，每条独立**：不做任何语言分组/合并；每条记录就是一个独立语言版本。
4. **每条必须带 `language` 字段**：发版程序据此把文章归到对应语言区。
5. **`slug` 每条唯一**：作为该语言区内的页面网址名。
6. **分页可用**：`total` 准确，`page`/`size` 生效，便于发版程序循环取全量。
7. **鉴权**：`x-token` 校验，与其它后台接口一致。
8. **时间格式统一**：ISO 8601（如 `2026-06-11T10:00:00Z`）或秒级时间戳皆可，全站统一。

---

## 五、给后台开发的一句话总结

> 加一个 GET 接口 `/api/article/published_list`，按 `site_id`（可选 `language`）查 `status=已发布`
> 的文章，**平铺**返回（每条含 `id/slug/language/title/summary/content/cover/...`），
> 支持分页和 `x-token` 鉴权。**不需要做语言分组**，纯读取、不动写入逻辑。

接口做好后，把 **路径、是否需要额外参数、一份真实返回示例** 回给我，我据此完成发版同步脚本。
