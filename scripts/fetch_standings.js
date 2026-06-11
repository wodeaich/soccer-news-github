/**
 * 积分榜采集脚本 - 从 API-Football 抓取世界杯积分榜并写入后端
 * 用法: node scripts/fetch_standings.js
 */

require("dotenv").config();
const axios = require("axios");
const store = require("./lib/store");

const API_KEY = process.env.API_FOOTBALL_KEY;
const API_BASE = process.env.API_FOOTBALL_BASE || "https://v3.football.api-sports.io";
const LEAGUE_ID = process.env.WORLD_CUP_LEAGUE_ID || 1;
const SEASON = process.env.WORLD_CUP_SEASON || 2026;

const apif = axios.create({
  baseURL: API_BASE,
  headers: { "x-apisports-key": API_KEY },
  timeout: 15000,
});

// 转换积分榜为 standings 页面期望的格式：{ groups: [{ name, table: [...] }] }
function transformStandings(rawStandings) {
  // API 返回二维数组：每个元素是一个小组的队伍列表
  const groups = rawStandings.map((group) => {
    const groupName = group[0]?.group || "Group";
    const table = group.map((team) => ({
      rank: team.rank,
      team: {
        id: team.team.id,
        name: team.team.name,
        logo: team.team.logo,
      },
      played: team.all.played,
      won: team.all.win,
      drawn: team.all.draw,
      lost: team.all.lose,
      goals_for: team.all.goals.for,
      goals_against: team.all.goals.against,
      goal_diff: team.goalsDiff,
      points: team.points,
      form: team.form || "",
    }));
    return { name: groupName, table };
  });
  return { groups };
}

async function fetchAndStore() {
  console.log(`[fetch_standings] 开始抓取 League=${LEAGUE_ID} Season=${SEASON}`);

  const { data } = await apif.get("/standings", {
    params: { league: LEAGUE_ID, season: SEASON },
  });

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error("[fetch_standings] API 报错:", data.errors);
    process.exit(1);
  }

  const rawStandings = data.response?.[0]?.league?.standings;
  if (!rawStandings || rawStandings.length === 0) {
    console.log("[fetch_standings] 暂无积分榜数据（赛事尚未开始）");
    return;
  }

  console.log(`[fetch_standings] 获取到 ${rawStandings.length} 个小组`);
  const standings = transformStandings(rawStandings);

  // 写入 content/matches/standings.json（整体覆盖）
  store.writeStandings(standings.groups);

  console.log(`[fetch_standings] 已写入 ${standings.groups.length} 个小组积分榜到 content/matches/standings.json`);
}

fetchAndStore().catch((err) => {
  console.error("[fetch_standings] 失败:", err.message);
  process.exit(1);
});
