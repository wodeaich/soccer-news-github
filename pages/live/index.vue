<template>
  <div class="page">
    <Header current-path="new" />
    <main>
      <div class="title-h2">
        <div class="title-button"> <i class="icon-live" /> Live Football Games</div></div
      >

      <!-- Latest游戏列表 -->
      <section>
        <InfiniteScrollList
          api-endpoint="/api/game/menu"
          :initial-page="2"
          :page-size="24"
          :initial-items="liveGames"
          mod-id="live"
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
            <!-- new-1: Google Ad 占位 1 -->
            <!-- <GoogleAd ad-slot="4363167594" class="ad1" /> -->
            <adm-slot
              class="ad1"
              adm-id="live-1"
              adm-unit="/23197833490/compsoccer/compsoccer_module_1"
            />

            <!-- new-2: Google Ad 占位 2 -->
            <!-- <GoogleAd ad-slot="5676249263" class="ad2" /> -->
            <adm-slot
              class="ad2"
              adm-id="live-2"
              adm-unit="/23197833490/compsoccer/compsoccer_module_2"
            />
          </template>
        </InfiniteScrollList>
      </section>

      <!-- 推荐游戏列表 -->
      <!-- <div class="title-h2">
        <div class="title-button"> <i class="icon-rec" /> Recommend Games</div></div
      >

      <InfiniteScrollList
        api-endpoint="/api/game/all_game"
        :initial-page="2"
        :page-size="24"
        :initial-items="allGames"
        class="box-common"
      >
        <template #default="{ items }">
          <ContentItemCommon1
            v-for="(item, index) in items"
            :key="index"
            :index="index"
            :item="item"
            :to="`/game/${item.path}/`"
          />
        </template>
      </InfiniteScrollList> -->
    </main>
    <Footer />
    <BackTop />
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [liveGamesResponse, allGamesResponse] = await Promise.all([
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "live",
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
        liveGames: liveGamesResponse.list,
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
