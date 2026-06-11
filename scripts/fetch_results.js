/**
 * 赛果采集脚本 - 只抓已结束比赛，带本地缓存防止超出100次/天额度
 * 用法: node scripts/fetch_results.js
 *   每次只请求"今日已完成"比赛（LIVE→FT），大幅节省额度
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const store = require("./lib/store");

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = process.env.API_FOOTBALL_BASE || "https://v3.football.api-sports.io";
const LEAGUE_ID = process.env.WORLD_CUP_LEAGUE_ID || 1;
const SEASON = process.env.WORLD_CUP_SEASON || 2026;

// 本地缓存：记录已同步过的 fixture_id，避免重复请求
const CACHE_FILE = path.join(__dirname, ".results_cache.json");

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return { synced_ids: [], last_run: null };
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

const apif = axios.create({
  baseURL: API_BASE,
  headers: { "x-apisports-key": API_KEY },
  timeout: 15000,
});

function formatResult(f) {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    venue: f.fixture.venue?.name || "",
    status: f.fixture.status?.short || "FT",
    stage: f.league.round || "",
    home: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
      winner: f.teams.home.winner,
    },
    away: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
      winner: f.teams.away.winner,
    },
    score: {
      home: f.goals.home,
      away: f.goals.away,
      halftime_home: f.score.halftime?.home ?? null,
      halftime_away: f.score.halftime?.away ?? null,
      extratime_home: f.score.extratime?.home ?? null,
      extratime_away: f.score.extratime?.away ?? null,
      penalty_home: f.score.penalty?.home ?? null,
      penalty_away: f.score.penalty?.away ?? null,
    },
    slug: `${f.teams.home.name.toLowerCase().replace(/\s+/g, "-")}-vs-${f.teams.away.name.toLowerCase().replace(/\s+/g, "-")}-${f.fixture.id}`,
  };
}

async function fetchAndStore() {
  const cache = loadCache();
  console.log(`[fetch_results] 已缓存 ${cache.synced_ids.length} 场结果`);

  // 策略：只拉今天已完成的比赛（节省额度）
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[fetch_results] 查询 ${today} 的已完成比赛`);

  const { data } = await apif.get("/fixtures", {
    params: {
      league: LEAGUE_ID,
      season: SEASON,
      date: today,
      status: "FT-AET-PEN", // Full Time / After Extra Time / Penalties
    },
  });

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("[fetch_results] API 报错:", data.errors);
    process.exit(1);
  }

  const fixtures = (data.response || []).filter(
    (f) => !cache.synced_ids.includes(f.fixture.id)
  );
  console.log(`[fetch_results] 新增 ${fixtures.length} 场未同步结果`);

  if (fixtures.length === 0) {
    console.log("[fetch_results] 无新结果，退出");
    return;
  }

  const results = fixtures.map(formatResult);

  // 写入 content/matches/results.json（按 id 累积合并）
  const total = store.mergeResults(results);

  // 更新缓存
  cache.synced_ids.push(...results.map((r) => r.id));
  cache.last_run = new Date().toISOString();
  saveCache(cache);

  console.log(`[fetch_results] 已写入 ${results.length} 场新结果，content 累计 ${total} 场`);
}

fetchAndStore().catch((err) => {
  console.error("[fetch_results] 失败:", err.message);
  process.exit(1);
});
