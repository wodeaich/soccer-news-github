<template>
  <div class="bg">
    <div class="page-afs home-page">
      <Afs-Header />
      <main class="main">
        <section v-swiper:mySwiper="swiperOption" class="swiper-box pc-hidden">
          <div class="swiper-wrapper">
            <afs-news-item-1
              v-for="(item, i) in recNews.list"
              :key="i"
              :item="item"
              :index="i"
              class="swiper-slide"
            >
            </afs-news-item-1>
          </div>
        </section>

        <section class="news-style-1 m-hidden">
          <afs-news-item-1 v-for="(item, i) in recNews.list" :key="i" :item="item" :index="i">
          </afs-news-item-1
        ></section>

        <adm-slot-preload
          class="ad-1"
          adm-id="home-1"
          adm-unit="/23197833490/soccerins/soccerins_home_1"
          ads-slot="6667048681"
        />

        <h2 class="title-h2-afs">Trending</h2>
        <section class="news-box-1">
          <div class="afs-games">
            <CustomLink
              v-for="(item, i) in afsGames"
              :key="i"
              class="afs-game"
              :to="`/game/${item.path}/`"
            >
              <NuxtImg
                format="auto"
                fit="cover"
                width="280"
                height="280"
                :src="item.icon"
                :alt="item.name"
                style="width: 100%; height: 100%"
              />
            </CustomLink>
          </div>
          <adm-slot-full
            class="ad-2"
            adm-id="home-2"
            adm-unit="/23197833490/soccerins/soccerins_home_full"
            ads-slot="4080715115"
          />
          <afs-news-item-5 v-for="(item, i) in trendingNews.list" :key="i" :item="item">
          </afs-news-item-5>
        </section>

        <adm-slot
          class="ad-3"
          adm-id="home-3"
          adm-unit="/23197833490/soccerins/soccerins_home_3"
          ads-slot="6028318341"
        />

        <h2 class="title-h2-afs">All Articles</h2>
        <InfiniteScrollList1
          api-endpoint="/api/article/menu"
          :initial-page="3"
          :page-size="5"
          mod-id="all"
          :initial-items="allNews.list"
          class="news-box-2"
        >
          <template #default="{ items }">
            <afs-news-item-2 v-for="(item, i) in items" :key="i" :item="item" :index="i">
            </afs-news-item-2>
          </template>
        </InfiniteScrollList1>
      </main>
      <Afs-Footer />
    </div>
    <Dotlottie />
  </div>
</template>

<script>
import { directive } from "vue-awesome-swiper";
import "swiper/css/swiper.min.css";
import { simulateAFSSearch } from "~/utils/utils";

export default {
  directives: {
    swiper: directive
  },
  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [recNewsResponse, trendingNewsResponse, allNewsResponse, afsGameResponse] =
        await Promise.all([
          $axios.$get("/api/article/menu", {
            params: {
              site_id: env.SITE_AFS,
              mod_id: "rec",
              size: 3
            }
          }),
          $axios.$get("/api/article/menu", {
            params: {
              site_id: env.SITE_AFS,
              mod_id: "trending",
              size: 6
            }
          }),
          $axios.$get("/api/article/menu", {
            params: {
              site_id: env.SITE_AFS,
              mod_id: "all",
              size: 10
            }
          }),
          $axios.$get("/api/game/menu", {
            params: {
              site_id: env.SITE_ID,
              mod_id: "doings",
              size: 4
            }
          })
        ]);

      // 返回多个接口的数据
      return {
        recNews: recNewsResponse,
        trendingNews: trendingNewsResponse,
        allNews: allNewsResponse,
        afsGames: afsGameResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  data() {
    return {
      swiperOption: {
        autoplay: {
          delay: 3000
        }
      },
      input: ""
    };
  },

  methods: {
    search() {
      if (this.input.length < 1) {
        this.$globalMethod.showNotification({
          message: "Please enter at least 1 characters",
          type: "warning"
        });
        return;
      }

      simulateAFSSearch(this.input);
    },
    clear() {
      this.input = "";
    }
  }
};
</script>
<style lang="scss" scoped>
.main {
  padding-bottom: 32px;
  border-bottom: 1px solid #ececee;
}
.pc-hidden {
  display: none !important;
}
.m-hidden {
  display: grid !important;
}
.swiper-box {
  position: relative;
  overflow: hidden;
  border-radius: vw(16);

  .swiper-slide {
    width: 100%;
    overflow: hidden;
  }
}
.afs-games {
  display: none;
}
.news-style-1 {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(3, 1fr);

  :nth-child(1) {
    grid-column: 1 / 3;
    grid-row: 1 / 3;
  }
}
.news-box-1 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.news-box-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.ad-1,
.ad-3 {
  margin-top: 24px;
}
.ad-2 {
  grid-row: 2 / 3;
  grid-column: 1 / -1;
}
@media screen and (max-width: 1100px) {
  .news-box-2 {
    display: flex;
    flex-wrap: wrap;
  }
}
@media screen and (max-width: 750px) {
  .pc-hidden {
    display: block !important;
  }

  .m-hidden {
    display: none !important;
  }
  .main {
    padding-bottom: vw(32);
    border-bottom: none;
  }
  .afs-games {
    grid-row: 2 / 3;
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    .afs-game {
      width: vw(140);
      height: vw(140);
      border-radius: vw(8);
      overflow: hidden;
    }
  }

  .news-style-1 {
    display: flex;
    gap: vw(32);
    flex-wrap: wrap;
    justify-content: center;
  }
  .news-box-1 {
    grid-template-columns: vw(658);
    gap: vw(32);
  }
  .news-box-2 {
    gap: vw(32);
    color: #333;

    ::v-deep :nth-child(5n + 1) {
      flex-direction: column;
      .img {
        width: vw(658);
        height: vw(440);
      }
      .title-box {
        border-bottom: unset;
        height: unset;
        margin: vw(12) 0 vw(10);
      }
      .title {
        font-size: vw(36);
        line-height: vw(52);
      }
    }
  }
  .ad-2 {
    grid-row: 4 / 5;
    grid-column: 1 / -1;
  }
  .ad-1,
  .ad-2,
  .ad-3 {
    width: 100vw;
    margin-left: vw(-46);
  }
}
</style>
