<template>
  <div class="bg">
    <div class="page-afs">
      <Afs-Header />
      <main class="main">
        <!-- <div id="afscontainerDivfeed1"> </div>
      <div id="relatedsearchesDivfeed1"> </div> -->
        <h3 class="title-h3-afs">Web Results</h3>
        <section class="news-box-3">
          <afs-news-item-3 v-for="(item, i) in news" :key="i" :item="item"> </afs-news-item-3>
        </section>
      </main>
      <Afs-Footer />
      <!-- <AdLoading /> -->
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
    // this.input && this.addAdSense();
    this.input && this.searchNews();
  },
  methods: {
    // addAdSense() {
    //   setTimeout(() => {
    //     this.addAdSenseScript();
    //     this.addAdSenseScript2();
    //   }, 0);
    // },
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
    // addAdSenseScript: function () {
    //   const searchParams = new URLSearchParams(window.location.search);
    //   const channelId = searchParams.has("channel") ? searchParams.get("channel") : "";
    //   this.channelId = channelId;
    //   const queryString = this.input;

    //   // 配置 AdSense 参数
    //   const adSenseConfig = {
    //     channel: channelId,
    //     pubId: "partner-pub-3887371527059481",
    //     query: `${this.input}`,
    //     styleId: "5402771445",
    //     adsafe: "low",
    //     adpage: 1,
    //     ivt: false,
    //     adtest: "off"
    //   };

    //   // 初始化 _googCsa 并加载广告
    //   // eslint-disable-next-line no-undef
    //   _googCsa("ads", adSenseConfig, {
    //     container: "afscontainerDivfeed1", // 第一个广告容器 ID
    //     number: 8, // 第一个广告容器中的广告数量
    //     adLoadedCallback: function (loaded, e, n, r) {
    //       console.log("adLoadedCallback", loaded, e, n, r);
    //       if (e) {
    //         // eslint-disable-next-line no-undef
    //         dataLayer.push({ event: "C_AR" }); // 推送事件到 dataLayer
    //         try {
    //           const element = document.getElementById("master-1");
    //           const height = parseFloat(element.style.height);
    //           const result = Math.round(height / 456);
    //           // eslint-disable-next-line no-undef
    //           dataLayer.push({ event: "C_AR_IN", num: result, query: queryString }); // 事件推送到 dataLayer
    //         } catch (e) {
    //           console.log(e);
    //         }
    //       } else {
    //         // eslint-disable-next-line no-undef
    //         dataLayer.push({ event: "FF_AR", query: queryString }); // 推送事件到 dataLayer
    //       }
    //     }
    //   });
    // },
    // addAdSenseScript2() {
    //   console.log("addAdSenseScript");
    //   // 获取 URL 查询参数
    //   const searchParams = new URLSearchParams(window.location.search);
    //   // const ttclid = searchParams.has("ttclid") ? searchParams.get("ttclid") : "";
    //   // const click_id = searchParams.has("click_id") ? searchParams.get("click_id") : "";
    //   const paramKeys = [];
    //   const queryString = this.input;
    //   // 遍历查询参数并将其添加到 paramKeys 数组中
    //   for (const param of searchParams) {
    //     paramKeys.push(param[0]);
    //   }
    //   const ignoredPageParams = paramKeys.join(",");

    //   const adSenseConfig = {
    //     channel: this.channelId,
    //     pubId: "partner-pub-3887371527059481",
    //     styleId: "7495644912",
    //     adsafe: "low",
    //     ignoredPageParams,
    //     relatedSearchTargeting: "query",
    //     resultsPageBaseUrl: `${window.location.origin}/search/?afs&channel=${this.channelId}`,
    //     resultsPageQueryParam: "query",
    //     query: `${this.input}`,
    //     ivt: false,
    //     adtest: "off"
    //   };
    //   // 初始化 _googCsa 并加载相关搜索广告
    //   // eslint-disable-next-line no-undef
    //   _googCsa("relatedsearch", adSenseConfig, {
    //     container: "relatedsearchesDivfeed1", // 广告容器 ID
    //     relatedSearches: 8, // 相关搜索广告数量
    //     adLoadedCallback: function (loaded, response, isExperimentVariant, callbackOptions) {
    //       console.log("adLoadedCallback", loaded, response, isExperimentVariant, callbackOptions);
    //       if (response) {
    //         // eslint-disable-next-line no-undef
    //         dataLayer.push({ event: "C_AC" }); // 事件推送到 dataLayer
    //         // eslint-disable-next-line no-undef
    //         dataLayer.push({ event: "C_AC_IN", query: queryString }); // 事件推送到 dataLayer
    //       }
    //     }
    //   });
    // }
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
