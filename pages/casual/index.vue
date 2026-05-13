<template>
  <div class="page">
    <Header current-path="best" />
    <main>
      <div class="title-h2">
        <div class="title-button"> <i class="icon-casual" /> Casual Football Games</div>
      </div>
      <!-- Best游戏列表 -->
      <section>
        <InfiniteScrollList
          api-endpoint="/api/game/menu"
          :initial-page="2"
          :page-size="24"
          :initial-items="casualGames"
          mod-id="casual"
          class="app-box-row"
        >
          <template #default="{ items }">
            <ContentItemRow2
              v-for="(item, index) in items"
              :key="index"
              :item="item"
              :index="index"
              :to="`/game/${item.path}/`"
            >
            </ContentItemRow2>
            <adm-slot
              class="ad1"
              adm-id="best-1"
              adm-unit="/23197833490/soccerins/soccerins_module_1"
              ads-slot="2858514230"
            />

            <adm-slot
              class="ad2"
              adm-id="best-2"
              adm-unit="/23197833490/soccerins/soccerins_module_2"
              ads-slot="8110840910"
            />
          </template>
        </InfiniteScrollList>
      </section>
    </main>
    <Footer />
    <BackTop />
    <Dotlottie />
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [casualGamesResponse, allGamesResponse] = await Promise.all([
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "casual",
            size: 24
          }
        }),

        $axios.$get("/api/game/all_game", {
          params: {
            site_id: env.SITE_ID,
            page: 1,
            size: 24
          }
        })
      ]);

      // 返回多个接口的数据
      return {
        casualGames: casualGamesResponse.list,
        allGames: allGamesResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
};
</script>

<style lang="scss" scoped>
// @import "@/assets/css/module.scss";

.app-box-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(384px, 1fr));
  gap: 24px;
  justify-content: center;
}
.ad1 {
  width: 100%;
  grid-row-end: 4;
  grid-column: 1 / -1;
  margin-bottom: 26px;
}
.ad2 {
  width: 100%;
  grid-row-end: 8;
  grid-column: 1 / -1;
  margin-bottom: 26px;
}
@media screen and (max-width: 879px) {
  .app-box-row {
    grid-template-columns: repeat(2, vw(312));
    gap: vw(32);
    padding: 0 vw(46);
  }
  .ad1 {
    margin-bottom: vw(32);
  }
  .ad2 {
    grid-row-end: 11;
    margin-bottom: vw(32);
  }
}
</style>
