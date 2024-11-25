<template>
  <div class="bg">
    <div class="page-afs">
      <Afs-Header />
      <main class="main">
        <h2 class="title-h2-afs">{{ capitalizeFirstLetter(categoryInfo.category.name) }}</h2>
        <section class="news-box-4">
          <afs-news-item-4
            v-for="(item, index) in categoryInfo.list"
            :key="index"
            :index="index"
            :item="item"
          />
        </section>
      </main>
      <Afs-Footer />
      <AdLoading />
    </div>
  </div>
</template>

<script>
import { capitalizeFirstLetter } from "~/utils/utils";

export default {
  async asyncData({ $axios, params, env }) {
    try {
      const path = params.category;
      const lastDashIndex = path.lastIndexOf("-");
      const id = path.substring(lastDashIndex + 1, path.length);
      const categoryInfoResponse = await $axios.$get("/api/article/get_category_article", {
        params: {
          site_id: env.SITE_AFS,
          category_id: id,
          size: 10
        }
      });
      return {
        categoryInfo: categoryInfoResponse
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  methods: {
    capitalizeFirstLetter
  }
};
</script>

<style lang="scss" scoped>
.title-h2-afs {
  margin-top: 0 !important;
}
.news-box-4 {
  display: flex;
  flex-wrap: wrap;
}
</style>
