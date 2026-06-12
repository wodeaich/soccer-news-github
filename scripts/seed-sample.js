/**
 * 样本数据种子（仅用于本地验证 / 离线 yarn generate）
 *
 *   node scripts/seed-sample.js
 *
 * 写入的「原始结构」与 fetch_* / pipeline 真实产出完全一致，
 * 上线时由 cron 跑真实脚本覆盖。可安全删除本文件。
 */

const store = require("./lib/store");

const TEAMS = [
  ["Brazil", "BRA"], ["Argentina", "ARG"], ["France", "FRA"], ["England", "ENG"],
  ["Spain", "ESP"], ["Germany", "GER"], ["Portugal", "POR"], ["Netherlands", "NED"],
  ["USA", "USA"], ["Mexico", "MEX"], ["Japan", "JPN"], ["Korea", "KOR"],
  ["Croatia", "CRO"], ["Morocco", "MAR"], ["Belgium", "BEL"], ["Uruguay", "URU"],
];
const logo = (code) => `https://media.api-sports.io/football/teams/${code}.png`;
const VENUES = ["MetLife Stadium", "SoFi Stadium", "Estadio Azteca", "AT&T Stadium"];
const BASE_TS = Math.floor(Date.UTC(2026, 5, 11, 19, 0, 0) / 1000); // 2026-06-11 19:00 UTC

function team(i) {
  const [name] = TEAMS[i % TEAMS.length];
  return { id: 100 + i, name, logo: logo(TEAMS[i % TEAMS.length][1]) };
}
function slug(h, a, id) {
  return `${h.name.toLowerCase().replace(/\s+/g, "-")}-vs-${a.name.toLowerCase().replace(/\s+/g, "-")}-${id}`;
}

function fixture(i, finished) {
  const h = team(i * 2);
  const a = team(i * 2 + 1);
  const id = 900000 + i;
  const ts = BASE_TS + i * 86400;
  return {
    id, timestamp: ts,
    date: new Date(ts * 1000).toISOString(),
    venue: VENUES[i % VENUES.length], city: "",
    status: finished ? "FT" : "NS",
    stage: i < 4 ? "Group Stage - 1" : i < 6 ? "Round of 16" : "Quarter-finals",
    home: h, away: a,
    score: { home: finished ? (i % 4) : null, away: finished ? ((i + 1) % 3) : null },
    slug: slug(h, a, id),
  };
}

// 1) 赛程：8 场未来比赛
const fixtures = Array.from({ length: 8 }, (_, i) => fixture(i, false));
store.writeSchedule(fixtures, {});

// 2) 赛果：4 场已结束
const results = Array.from({ length: 4 }, (_, i) => fixture(i, true));
store.mergeResults(results);

// 3) 积分榜：4 个小组
const groups = ["A", "B", "C", "D"].map((name, gi) => ({
  name,
  table: Array.from({ length: 4 }, (_, i) => {
    const t = team(gi * 4 + i);
    const won = 3 - i;
    const gf = 8 - i * 2;
    const ga = 2 + i * 2;
    return {
      rank: i + 1, team: t,
      played: 3, won, drawn: 0, lost: i,
      goals_for: gf, goals_against: ga, goal_diff: gf - ga,
      points: won * 3, form: "",
    };
  }),
}));
store.writeStandings(groups);

// 4) 文章：独立语言模式——3 篇英文 + 2 篇西语，各自独立（与后台镜像格式一致）
const flatArticles = [
  {
    id: 900100, language: "en", article_type: "review",
    slug: "argentina-edge-brazil-world-cup-classic",
    title: "Argentina edge Brazil in a World Cup 2026 classic",
    summary: "Argentina produced a commanding display to defeat Brazil in a World Cup 2026 classic.",
    content:
      "<p>Argentina produced a commanding display to defeat Brazil in one of the standout fixtures of the 2026 FIFA World Cup group stage.</p>" +
      "<p>Driven by relentless pressing and clinical finishing, La Albiceleste controlled the tempo from the opening whistle.</p>",
  },
  {
    id: 900101, language: "en", article_type: "preview",
    slug: "france-vs-england-tactical-preview",
    title: "France vs England: tactical preview of a heavyweight clash",
    summary: "Two of Europe's most talented squads meet in a blockbuster World Cup 2026 fixture.",
    content:
      "<p>Two of Europe's most talented squads meet in a blockbuster World Cup 2026 fixture that could shape the knockout bracket.</p>" +
      "<p>France's pace on the counter will test an England side determined to control possession.</p>",
  },
  {
    id: 900102, language: "en", article_type: "review",
    slug: "spain-midfield-masterclass-sinks-germany",
    title: "Spain's midfield masterclass sinks Germany",
    summary: "Spain delivered a midfield masterclass to overcome a resilient Germany.",
    content:
      "<p>Spain delivered a midfield masterclass to overcome a resilient Germany at the 2026 FIFA World Cup.</p>" +
      "<p>Their patient build-up play unlocked a disciplined German defence after a goalless first half.</p>",
  },
  {
    id: 900110, language: "es", article_type: "review",
    slug: "argentina-supera-brasil-clasico-mundial",
    title: "Argentina supera a Brasil en un clásico del Mundial 2026",
    summary: "Argentina ofreció una actuación dominante para vencer a Brasil en un clásico del Mundial 2026.",
    content:
      "<p>Argentina ofreció una actuación dominante para vencer a Brasil en uno de los partidos más destacados de la fase de grupos del Mundial 2026.</p>",
  },
  {
    id: 900111, language: "es", article_type: "preview",
    slug: "francia-inglaterra-previa-tactica",
    title: "Francia vs Inglaterra: previa táctica de un duelo de pesos pesados",
    summary: "Dos de las selecciones más talentosas de Europa se enfrentan en un partidazo del Mundial 2026.",
    content:
      "<p>Dos de las selecciones más talentosas de Europa se enfrentan en un partidazo del Mundial 2026 que puede definir el cuadro eliminatorio.</p>",
  },
];

flatArticles.forEach((a, i) => {
  store.writeArticleFlat({
    ...a,
    cover: logo("BRA"),
    keywords: "world-cup-2026",
    published_at: new Date(Date.now() - i * 3600_000).toISOString(),
  });
});

console.log("✅ 样本数据已写入 content/（8 场赛程 / 4 场赛果 / 4 组积分 / 5 篇独立语言文章）");
