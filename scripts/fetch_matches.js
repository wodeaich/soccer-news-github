/**
 * 赛程采集脚本 - 从 API-Football 抓取世界杯2026赛程并写入后端
 * 用法: node scripts/fetch_matches.js
 */

require("dotenv").config();
const axios = require("axios");

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = process.env.API_FOOTBALL_BASE || "https://v3.football.api-sports.io";
const LEAGUE_ID = process.env.WORLD_CUP_LEAGUE_ID || 1;
const SEASON = process.env.WORLD_CUP_SEASON || 2026;
const BACKEND_URL = process.env.PROD_API_URL || "https://api.tapmygame.com";
const SITE_ID = process.env.SITE_ID || "soccerins";

const apif = axios.create({
  baseURL: API_BASE,
  headers: { "x-apisports-key": API_KEY },
  timeout: 15000,
});

// 将 API-Football 原始数据转成后端期望格式
function transformFixtures(fixtures) {
  const byDate = {};
  for (const f of fixtures) {
    const date = f.fixture.date.slice(0, 10); // YYYY-MM-DD
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({
      id: f.fixture.id,
      date: f.fixture.date,
      timestamp: f.fixture.timestamp,
      venue: f.fixture.venue?.name || "",
      city: f.fixture.venue?.city || "",
      status: f.fixture.status?.short || "NS",
      stage: f.league.round || "",
      home: {
        id: f.teams.home.id,
        name: f.teams.home.name,
        logo: f.teams.home.logo,
      },
      away: {
        id: f.teams.away.id,
        name: f.teams.away.name,
        logo: f.teams.away.logo,
      },
      score: {
        home: f.goals.home,
        away: f.goals.away,
      },
      slug: `${f.teams.home.name.toLowerCase().replace(/\s+/g, "-")}-vs-${f.teams.away.name.toLowerCase().replace(/\s+/g, "-")}-${f.fixture.id}`,
    });
  }
  return byDate;
}

async function fetchAndStore() {
  console.log(`[fetch_matches] 开始抓取 League=${LEAGUE_ID} Season=${SEASON}`);

  // 1. 抓取全部赛程
  const { data } = await apif.get("/fixtures", {
    params: { league: LEAGUE_ID, season: SEASON },
  });

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("[fetch_matches] API 报错:", data.errors);
    process.exit(1);
  }

  const fixtures = data.response || [];
  console.log(`[fetch_matches] 获取到 ${fixtures.length} 场比赛`);

  const byDate = transformFixtures(fixtures);
  const allFixtures = fixtures.map((f) => ({
    id: f.fixture.id,
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    venue: f.fixture.venue?.name || "",
    city: f.fixture.venue?.city || "",
    status: f.fixture.status?.short || "NS",
    stage: f.league.round || "",
    home: { id: f.teams.home.id, name: f.teams.home.name, logo: f.teams.home.logo },
    away: { id: f.teams.away.id, name: f.teams.away.name, logo: f.teams.away.logo },
    score: { home: f.goals.home, away: f.goals.away },
    slug: `${f.teams.home.name.toLowerCase().replace(/\s+/g, "-")}-vs-${f.teams.away.name.toLowerCase().replace(/\s+/g, "-")}-${f.fixture.id}`,
  }));

  // 2. 推送到后端
  await axios.post(`${BACKEND_URL}/api/match/schedule/sync`, {
    site_id: SITE_ID,
    fixtures: allFixtures,
    by_date: byDate,
    updated_at: new Date().toISOString(),
  });

  console.log(`[fetch_matches] 已同步 ${allFixtures.length} 场赛程到后端`);
}

fetchAndStore().catch((err) => {
  console.error("[fetch_matches] 失败:", err.message);
  process.exit(1);
});
