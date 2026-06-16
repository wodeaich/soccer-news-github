/**
 * 前端发版：上传 ZIP → 解析响应 → 触发 release（与管理后台真实接口对齐）。
 *
 * API（抹浏览器真实请求得到）：
 *   ① POST {BASE}/fileUploadAndDownload/uploadFrontEndZip?siteId=<id>&env=<env>
 *        Header: x-token
 *        FormData: file=<zip>（MIME application/zip）
 *        响应 data: { filePath, fileFolder, fileName, fileSize:"825.87 KB", md5, ... }
 *   ② POST {BASE}/releaseWebpack/release
 *        Header: x-token, Content-Type: application/json
 *        Body: { env, siteId, fileFolder, fileName, filePath, fileSize:<number>, fileMd5 }
 *        响应 data: <release_id>
 *
 * 要点：env 用 "prod"/"test"（不是 production）；fileSize 是数字；fileMd5 取上传响应 md5。
 *
 * 用法：node scripts/release_frontend.js --zip <path> [--site_id <id>] [--env test]
 * 环境：ADMIN_BACKEND_URL（含 /api）/ ADMIN_JWT_TOKEN / RELEASE_SITE_ID / RELEASE_ENV
 */

const fs = require("fs");
const path = require("path");

const BASE = (process.env.ADMIN_BACKEND_URL || "").replace(/\/$/, "");
const TOKEN = process.env.ADMIN_JWT_TOKEN || "";

function arg(name, dflt) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? process.argv[i + 1] : dflt;
}

async function main() {
  const zipPath = arg("--zip");
  const siteId = arg("--site_id", process.env.RELEASE_SITE_ID || "");
  const env = arg("--env", process.env.RELEASE_ENV || "test");

  if (!BASE) throw new Error("缺少 ADMIN_BACKEND_URL");
  if (!TOKEN) throw new Error("缺少 ADMIN_JWT_TOKEN");
  if (!zipPath) throw new Error("缺少 --zip <路径>");
  if (!siteId) throw new Error("缺少 siteId（--site_id 或 RELEASE_SITE_ID）");
  if (!fs.existsSync(zipPath)) throw new Error(`ZIP 不存在：${zipPath}`);

  const buf = fs.readFileSync(zipPath);
  const fileName = path.basename(zipPath);
  console.log(`[release] 上传 ${fileName} (${(buf.length / 1048576).toFixed(2)}MB) → site=${siteId} env=${env}`);

  // ① 上传：siteId/env 走 query，file 走 multipart
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: "application/zip" }), fileName);
  const upUrl = `${BASE}/fileUploadAndDownload/uploadFrontEndZip`
    + `?siteId=${encodeURIComponent(siteId)}&env=${encodeURIComponent(env)}`;
  const upRes = await fetch(upUrl, {
    method: "POST",
    headers: { "x-token": TOKEN },
    body: fd,
  });
  const upJson = await upRes.json().catch(() => ({}));
  console.log("[release] 上传响应:", JSON.stringify(upJson));
  if (upJson.code !== 0) {
    throw new Error(`上传失败 (HTTP ${upRes.status})：${upJson.msg || JSON.stringify(upJson)}`);
  }
  const d = upJson.data || {};

  // fileSize "825.87 KB" → 825.87（只取数值，与后台示例一致）
  const fileSize = parseFloat(String(d.fileSize || "0")) || 0;

  // ② 发版：body 带上传响应的全部字段
  const body = {
    env,
    siteId,
    fileFolder: d.fileFolder,
    fileName: d.fileName,
    filePath: d.filePath,
    fileSize,
    fileMd5: d.md5,
  };
  const relUrl = `${BASE}/releaseWebpack/release`;
  const relRes = await fetch(relUrl, {
    method: "POST",
    headers: { "x-token": TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const relJson = await relRes.json().catch(() => ({}));
  console.log("[release] 发版响应:", JSON.stringify(relJson));
  if (relJson.code !== 0) {
    throw new Error(`发版失败 (HTTP ${relRes.status})：${relJson.msg || JSON.stringify(relJson)}`);
  }

  console.log(`✅ 发版成功 release_id=${relJson.data} env=${env} site=${siteId}`);
}

main().catch((e) => {
  console.error("[release] 失败:", e.message);
  process.exit(1);
});
