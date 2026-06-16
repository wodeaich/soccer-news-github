<template>
  <!-- 广告加载遮罩已随广告位一并停用：无广告时不再需要等待遮罩，渲染为空。
       产品定稿后由后续需求重新规划广告位时恢复实现即可。 -->
  <span v-if="false"></span>
</template>

<script>
export default {
  name: "AdLoading"
};
</script>
