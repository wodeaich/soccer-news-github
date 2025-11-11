<template>
  <div class="bg">
    <div class="page-afs">
      <Afs-Header />
      <main class="main">
        <h3 class="title-h3-afs">Web Results</h3>
        <section class="news-box-3">
          <afs-news-item-3 v-for="(item, i) in news" :key="i" :item="item"> </afs-news-item-3>
        </section>
      </main>
      <Afs-Footer />
      <Dotlottie />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      news: [], // 新闻列表
      input: "", // 搜索输入
      channelId: ""
    };
  },
  mounted() {
    this.input = this.$route.query.query || "";
    this.input && this.searchNews();
  },
  methods: {
    async searchNews() {
      try {
        const response = await this.$axios.$post("/api/article/search", {
          site_id: process.env.SITE_AFS,
          key: this.input
        });

        this.news = response.list;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.main {
  padding-bottom: 32px;
  border-bottom: 1px solid #ececee;
}
.title-h3-afs {
  color: $font1 !important;
}

@media screen and (max-width: 750px) {
  .main {
    padding-bottom: vw(32);
    border-bottom: vw(2) solid #ececee;
  }
}
</style>
