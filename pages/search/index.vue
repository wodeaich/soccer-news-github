<template>
  <div class="page">
    <Header current-path="search" />
    <main>
      <Breadcrumb name="Search" />

      <!-- 移动端独占 -->
      <section class="m-search-box">
        <input
          v-model="input"
          class="text"
          type="text"
          placeholder="Search"
          @keyup.enter="searchGame"
        />
        <p class="m-search" @click="searchGame"><i class="icon-search"></i></p>
      </section>

      <!-- 搜索中 -->
      <section v-if="searchLoading" class="searching">
        <Loading />
      </section>

      <!-- 搜索无结果 -->
      <section v-if="!searchLoading && matchGameData.count == 0" class="search-null">
        Sorry, No <span>&nbsp;"{{ matchGameData.name }}"&nbsp;</span> found
      </section>

      <section v-if="!searchLoading && matchGameData.count > 0" class="search-result">
        <div class="number">
          <span>"{{ matchGameData.name }}"</span>, {{ matchGameData.count }} results found
        </div>
        <ContentItemCommon2
          v-for="(item, index) in matchGameData.list"
          :key="index"
          :index="index"
          :item="item"
          :to="`/game/${item.path}/`"
        />
      </section>

      <!-- search-1: Google Ad 占位 1 -->
      <!-- <GoogleAd ad-slot="1454551777" class="ad" /> -->
      <adm-slot
        class="ad"
        adm-id="search-1"
        adm-unit="/23197833490/compsoccer/compsoccer_search_1"
      />

      <div class="title-h2">
        <div class="title-button"> <i class="icon-rec" /> Recommend Games</div></div
      >
      <InfiniteScrollList
        class="box-common"
        api-endpoint="/api/game/all_game"
        :initial-page="2"
        :page-size="24"
        :initial-items="moreGames"
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
      </InfiniteScrollList>
    </main>
    <Footer />
    <BackTop />
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, env }) {
    try {
      const [moreGamesResponse] = await Promise.all([
        $axios.$get("/api/game/all_game", {
          params: {
            site_id: env.SITE_ID,
            page: 1,
            size: 24
          }
        })
      ]);
      return {
        moreGames: moreGamesResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  data() {
    return {
      searchLoading: false,
      collapsed: true,
      matchGameData: {},
      input: ""
    };
  },
  mounted() {
    this.input = this.$route.query.text || "";
    this.input && this.searchGame();
  },
  methods: {
    async searchGame() {
      if (this.input.length < 2) {
        this.$globalMethod.showNotification({
          message: "Please enter at least 2 characters",
          type: "warning"
        });
        return;
      }
      this.searchLoading = true;

      const matchGamesResponse = await this.$axios.$post("/api/game/search", {
        site_id: process.env.SITE_ID,
        name: this.input
      });

      this.searchLoading = false;
      this.matchGameData = matchGamesResponse;
    }
  }
};
</script>

<style lang="scss" scoped>
.m-search-box {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 68%;
  margin: 32px auto;
  height: 48px;
  border-radius: 30px;
  // box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd;
  // border: 2px solid #ffffff;
  .text {
    width: 100%;
    height: 48px;
    font-size: 16px;
    color: $item-name;
    padding-left: 16px;
    border-radius: 30px;
    box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
    &::placeholder {
      color: rgba($item-name, 0.4);
    }
  }
  .m-search {
    position: absolute;
    top: 4px;
    right: 3px;
    width: 138px;
    height: 40px;
    background: $btn-bg;
    border-radius: 60px;
    @include center;
  }
  .icon-search {
    @include icon(24px, 24px, "icon-search.png");
    margin: 0;
  }
}
.searching,
.search-null {
  width: 100%;
  height: 120px;
  box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
  border-radius: 24px;
  @include center;
}
.search-null,
.search-result .number {
  font-size: 16px;
  line-height: 22px;
  font-family: "sesb";
  color: rgba($item-name, 0.6);
  span {
    color: #68dfc3;
  }
}
.search-result {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(172px, 1fr));
  grid-gap: 20px;
  padding: 32px 0;
  margin: 0 auto;
  border-radius: 24px;
  padding: 20px 20px 32px;
  box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
  .number {
    grid-column: 1 / -1;
    text-align: center;
  }
}

.ad {
  margin-top: 32px;
}

@media screen and (max-width: 879px) {
  .m-search-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: vw(48) auto;
    height: vw(94);
    border-radius: vw(60);
    .text {
      width: 100%;
      height: 100%;
      padding-left: vw(32);
      font-size: vw(32);
      color: $item-name;
      border-radius: vw(60);
      &::placeholder {
        color: rgba($item-name, 0.6);
      }
    }
    .m-search {
      top: vw(7);
      right: vw(7);
      width: vw(156);
      height: vw(80);
      background: $btn-bg2;
      border-radius: vw(120);
      @include center;
    }
    .icon-search {
      @include icon(vw(48), vw(48), "icon-search.png");
      margin: 0;
    }
  }
  .title-h3 {
    color: #eee;
    font-size: vw(36);
    display: flex;
    align-items: center;
    height: 24px;
    margin-top: vw(54);
    margin-bottom: vw(38);
    padding: 0 vw(46);
    font-family: "seb";
  }
  .searching,
  .search-null {
    width: auto;
    height: vw(240);
    border-radius: vw(32);
    margin: 0 vw(46);
  }
  .search-null,
  .search-result .number {
    font-size: vw(28);
    border-radius: vw(32);
  }
  .search-result {
    grid-template-columns: repeat(3, vw(198));
    gap: vw(32);
    padding: vw(32) 0 vw(32);
    box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
    border-radius: vw(32);
    margin: 0 vw(46);
    h3 {
      font-size: vw(36);
      padding-left: vw(32);
      &:last-of-type {
        margin-top: vw(22);
      }
    }
  }
}
</style>
