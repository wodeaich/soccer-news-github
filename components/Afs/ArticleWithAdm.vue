<template>
  <div class="news-detail">
    <template v-for="(item, index) in contentItems">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-if="item.type === 'content'" :key="`content-${index}`" v-html="item.content" />
      <AdmSlot v-else :key="`ad-${index}`" :adm-id="item.id" :adm-unit="item.slot" />
    </template>
  </div>
</template>
<script>
export default {
  name: "ArticleWithAdm",
  props: {
    content: {
      type: String,
      required: true
    },
    charInterval: {
      type: Number,
      default: 800
    },
    adConfigs: {
      type: Array,
      default: () => [
        {
          id: "detail-1",
          slot: "/23197833490/soccerins/soccerins_detail_afs1"
        }
        // {
        //   id: "detail-2",
        //   slot: "/23197833490/soccerins/soccerins_detail_afs2"
        // },
        // {
        //   id: "detail-3",
        //   slot: "/23197833490/soccerins/soccerins_detail_afs3"
        // },
        // {
        //   id: "detail-4",
        //   slot: "/23197833490/soccerins/soccerins_detail_afs4"
        // },
        // {
        //   id: "detail-5",
        //   slot: "/23197833490/soccerins/soccerins_detail_afs5"
        // }
      ]
    }
  },
  computed: {
    contentItems() {
      const parts = this.content.split(/(<p[^>]*>.*?<\/p>)/gs);
      let charCount = 0;
      let adIndex = 0;
      let lastAdCharCount = 0;
      const items = [];
      const maxAds = this.adConfigs.length;

      parts.forEach((part) => {
        if (!part.trim()) return; // 跳过空字符串

        // 添加内容
        items.push({
          type: "content",
          content: part
        });

        // 如果不是p标签，不计算字符数和插入广告
        if (!part.startsWith("<p")) return;
        if (adIndex >= maxAds) return;

        // 计算纯文本长度
        const textContent = part.replace(/<[^>]+>/g, "");
        charCount += textContent.length;

        // 检查是否需要插入广告
        if (
          charCount >= this.charInterval &&
          (charCount - lastAdCharCount >= this.charInterval || lastAdCharCount === 0)
        ) {
          items.push({
            type: "ad",
            id: this.adConfigs[adIndex].id,
            slot: this.adConfigs[adIndex].slot
          });
          lastAdCharCount = charCount;
          adIndex++;
        }
      });

      return items;
    }
  }
};
</script>
