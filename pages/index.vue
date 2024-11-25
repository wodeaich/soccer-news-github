<template>
  <div class="bg">
    <div class="page-afs home-page">
      <Afs-Header />
      <main class="main">
        <section class="news-style-1">
          <afs-news-item-1 v-for="(item, i) in recNews.list" :key="i" :item="item" :index="i">
          </afs-news-item-1
        ></section>
        <h2 class="title-h2-afs">Trending</h2>
        <section class="news-box-1">
          <afs-news-item-5 v-for="(item, i) in trendingNews.list" :key="i" :item="item">
          </afs-news-item-5>
        </section>

        <h2 class="title-h2-afs">All Articles</h2>
        <!-- <section class="news-box-2">
        <afs-news-item-2 v-for="(item, i) in allNews.list" :key="i" :item="item"> </afs-news-item-2>
      </section> -->

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
      <AdLoading />
    </div>
  </div>
</template>

<script>
import { simulateAFSSearch } from "~/utils/utils";

export default {
  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [recNewsResponse, trendingNewsResponse, allNewsResponse] = await Promise.all([
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
        })
      ]);

      // 返回多个接口的数据
      return {
        recNews: recNewsResponse,
        trendingNews: trendingNewsResponse,
        allNews: allNewsResponse
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  data() {
    return {
      swiperOption: {
        slidesPerView: "auto",
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
<style lang="scss">
.main {
  padding-bottom: 32px;
  border-bottom: 1px solid #ececee;
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
@media screen and (max-width: 1100px) {
  .news-box-2 {
    display: flex;
    flex-wrap: wrap;
  }
}
@media screen and (max-width: 750px) {
  .main {
    padding-bottom: vw(32);
    border-bottom: none;
  }

  .news-style-1 {
    display: flex;
    gap: vw(32);
    flex-wrap: wrap;
    justify-content: center;
  }
  .news-box-1 {
    display: flex;
    gap: vw(32);
    flex-wrap: wrap;
    justify-content: center;
  }
  .news-box-2 {
    gap: vw(32);
    color: #333;

    :nth-child(5n + 1) {
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
}
</style>
