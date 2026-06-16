<template>
  <!-- 广告位已按需求临时停用：正文不再穿插广告，仅渲染文章内容。
       产品定稿后由后续需求重新规划正文广告位时恢复穿插逻辑即可。 -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="news-detail" v-html="content" />
</template>
<script>
export default {
  name: "ArticleWithAdm",
  props: {
    content: {
      type: String,
      required: true
    }
  }
};
</script>
