<template>
  <!-- 广告位已按需求临时停用：组件保留 props 接口，渲染为空，不加载任何广告脚本。
       产品定稿后由后续需求重新规划广告位时恢复实现即可。 -->
  <span v-if="false"></span>
</template>

<script>
export default {
  name: "GoogleAd",
  props: {
    adSlot: { type: String, default: "" }
  }
};
</script>
