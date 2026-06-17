/**
 * RSS 多源聚合模块
 *
 * 从多个足球新闻 RSS 源抓取文章，过滤出世界杯相关内容，
 * 返回标准化的文章条目供 pipeline.js 调用 MiniMax 改写。
 */

const Parser = require("rss-parser");

const parser = new Parser({ timeout: 20000 });

const DEFAULT_FEEDS = [
  {
    name: "BBC Sport Football",
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
  },
  {
    name: "ESPN FC",
    url: "https://www.espn.com/espn/rss/soccer/news",
  },
  {
    name: "Goal.com",
    url: "https://www.goal.com/feeds/en/news",
  },
];

const WC_KEYWORDS = [
  "world cup",
  "world cup 2026",
  "fifa 2026",
  "usa 2026",
  "mexico 2026",
  "canada 2026",
  "copa del mundo",
  "coupe du monde",
];

function isWorldCupRelated(item) {
  const text = [item.title, item.contentSnippet, item.content, ...(item.categories || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return WC_KEYWORDS.some((kw) => text.includes(kw));
}

/**
 * 从所有配置的 RSS 源获取世界杯相关文章
 * @param {Object} options
 * @param {Array} options.feeds - 自定义 RSS 源列表 [{name, url}]
 * @param {number} options.maxPerFeed - 每个源最多取几篇 (default: 5)
 * @param {Array} options.skipTitles - 已处理过的标题列表（去重用）
 * @returns {Array<{source, title, link, snippet, pubDate}>}
 */
async function fetchWorldCupNews({ feeds, maxPerFeed = 5, skipTitles = [] } = {}) {
  const sources = feeds || DEFAULT_FEEDS;
  const skipSet = new Set(skipTitles.map((t) => t.toLowerCase().trim()));
  const articles = [];

  for (const source of sources) {
    try {
      console.log(`  [RSS] 抓取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || [])
        .filter(isWorldCupRelated)
        .filter((item) => !skipSet.has((item.title || "").toLowerCase().trim()))
        .slice(0, maxPerFeed);

      for (const item of items) {
        articles.push({
          source: source.name,
          title: (item.title || "").trim(),
          link: item.link || "",
          snippet: (item.contentSnippet || item.content || "").slice(0, 500).trim(),
          pubDate: item.pubDate || item.isoDate || null,
        });
      }
      console.log(`  [RSS] ${source.name}: ${items.length} 篇世界杯相关`);
    } catch (err) {
      console.warn(`  [RSS] ${source.name} 抓取失败: ${err.message}`);
    }
  }

  return articles;
}

module.exports = { fetchWorldCupNews, DEFAULT_FEEDS };
