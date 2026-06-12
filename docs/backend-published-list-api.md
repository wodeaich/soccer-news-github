# 后台接口需求：列出"已发布"文章（供静态发版同步）

> 面向：管理后台（gin-vue-admin）开发
> 用途：CompSoccer 世界杯站采用「后台录入 + 审核 → 发版」流程。
> 发版程序需要从后台读取**已审核发布**的文章（含多语言译文），
> 写入仓库 `content/` 后生成静态页。本接口即为此读取入口。

---

## 一、接口概述

| 项目 | 内容 |
|------|------|
| 类型 | HTTP **GET**（只读查询，不修改任何数据）|
| 作用 | 返回某站点下所有「已发布」状态的文章，**每篇含全部已有语言译文** |
| 鉴权 | Header `x-token`（与现有后台接口一致）|
| 数据来源 | `article_library` 表（基础英文行）+ 其翻译行 |
| 调用方 | GitHub Actions 发版工作流（每次发版前调用一次）|

> 说明：文章的**创建/录入/审核**沿用现有后台流程（`/api/article/create`、
> 管理界面、`status` 字段），本接口**只负责把已发布的结果读出来**，不新增写入逻辑。

---

## 二、请求规格

```
GET /api/article/published_list?site_id=soccerins-afs&page=1&size=50
Header:
  x-token: <管理后台 JWT>
```

**Query 参数：**

| 参数 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `site_id` | 是 | 站点标识，过滤本站文章 | `soccerins-afs` |
| `page` | 否 | 页码，从 1 开始，默认 1 | `1` |
| `size` | 否 | 每页条数，默认 50，建议上限 100 | `50` |

---

## 三、返回规格（JSON）

```json
{
  "success": true,
  "data": {
    "total": 128,
    "page": 1,
    "size": 50,
    "list": [
      {
        "id": 1234567,
        "slug": "argentina-vs-brazil-1234567",
        "fixture_id": 1234567,
        "article_type": "review",
        "cover": "https://cdn.example.com/cover.jpg",
        "keywords": "world-cup-2026,argentina,brazil",
        "published_at": "2026-06-11T10:00:00Z",
        "updated_at": "2026-06-11T12:30:00Z",
        "translations": [
          {
            "language": "en",
            "title": "Argentina edge Brazil in a World Cup 2026 classic",
            "summary": "Argentina produced a commanding display to defeat Brazil...",
            "content": "<p>Argentina produced a commanding display...</p>"
          },
          {
            "language": "es",
            "title": "Argentina supera a Brasil en un clásico del Mundial 2026",
            "summary": "Argentina ofreció una actuación dominante...",
            "content": "<p>Argentina ofreció una actuación dominante...</p>"
          }
          // pt / ar / ja / ko 同结构（若该语言已翻译）
        ]
      }
      // ... 更多文章
    ]
  }
}
```

**字段说明：**

| 字段 | 类型 | 说明 | 对应表字段 |
|------|------|------|-----------|
| `data.total` | int | 已发布文章总数（用于分页）| count(*) |
| `data.list[].id` | int | 文章主键 | `article_library.id` |
| `data.list[].slug` | string | URL 别名（前端路由用）| web-slug |
| `data.list[].fixture_id` | int / null | 关联赛事 ID（可选）| 扩展字段 |
| `data.list[].article_type` | string | 文章类型：`preview`/`review`/`news` | `article_type` |
| `data.list[].cover` | string | 封面图 URL | `cover` |
| `data.list[].keywords` | string | 关键词，逗号分隔 | `keywords` |
| `data.list[].published_at` | string | 发布时间（ISO 8601 或时间戳，统一即可）| 发布时间 |
| `data.list[].updated_at` | string | 最后更新时间 | `updated_at` |
| `data.list[].translations` | array | **该文章的全部语言版本**（关键）| 基础行 + 翻译行合并 |
| `translations[].language` | string | 语言码：`en`/`es`/`pt`/`ar`/`ja`/`ko` | `language` |
| `translations[].title` | string | 该语言标题 | `name` |
| `translations[].summary` | string | 该语言摘要/首段 | `first_paragraph` |
| `translations[].content` | string | 该语言正文（HTML 原文）| `content` |

---

## 四、必须满足的规则（验收点）

1. **只返回「已发布」文章**：`status = 已发布`（评估文档中 `status=2`），草稿/待审核不返回。
2. **按 `site_id` 过滤**：只返回该站点的文章。
3. **每篇合并所有语言**：把英文基础行和它的翻译行，合并进同一篇的 `translations` 数组。
   - 至少包含 `en`；其余语言**翻译了才有**（允许少于 6 种）。
4. **分页可用**：`total` 准确，`page`/`size` 生效，便于发版程序循环取全量。
5. **鉴权**：`x-token` 校验，与其它后台接口一致。
6. **时间字段格式统一**：ISO 8601（如 `2026-06-11T10:00:00Z`）或秒级时间戳皆可，但全站统一。
7. **`content` 为 HTML 原文**，不做转义/截断。

---

## 五、给后台开发的一句话总结

> 加一个 GET 接口 `/api/article/published_list`，按 `site_id` 查 `status=已发布` 的文章，
> 每篇把基础行+翻译行合并成 `translations[]` 数组返回，支持分页和 `x-token` 鉴权。
> 纯读取，不动任何写入逻辑。

接口做好后，把 **路径、是否需要额外参数、返回示例** 回给我，我会据此完成发版同步脚本。
