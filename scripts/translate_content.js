/**
 * 【已弃用】6语言翻译脚本
 *
 * 自动化流程改为「后台为唯一数据源」后，翻译已并入 pipeline.js 一气呵成：
 *   生成英文 → 录入后台上架 → 翻译 5 语言 → 各语言独立录入后台上架
 *
 * 如需补翻历史文章，请使用：
 *   node scripts/pipeline.js --fixture <fixture_id>
 *
 * 本文件保留为占位，避免旧的调用方报「文件不存在」。
 */

console.log("[translate_content] 已弃用：翻译已并入 pipeline.js（生成→录入→上架 一气呵成）。");
console.log("[translate_content] 补翻历史文章请用: node scripts/pipeline.js --fixture <id>");
process.exit(0);
