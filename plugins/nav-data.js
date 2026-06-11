// plugins/nav-data.js
// 纯静态方案：不再请求后台。侧栏分类列表如需数据，后续可改为读 content/。
export default function (_ctx, inject) {
  inject("navData", { list: [] });
}
