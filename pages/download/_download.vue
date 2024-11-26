<template>
  <div class="page">
    <Header current-path="download" />
    <main class="main">
      <Breadcrumb :name="currentGame.name" />

      <!-- download-1: Google Ad 占位 1 -->
      <GoogleAd ad-slot="3297497936" class="ad-1" />

      <section class="download-info">
        <div class="base-info">
          <NuxtImg
            format="auto"
            fit="cover"
            width="210"
            height="210"
            class="icon"
            :src="currentGame.icon"
            :alt="currentGame.name"
          />
          <div class="base-info-content">
            <div class="name">
              {{ currentGame.name }}
            </div>
            <div class="version">
              <p><b>Version:</b> {{ currentGame.version }}</p>
              <p><b>Size:</b> {{ currentGame.apk_size }}</p>
            </div>
            <div class="update"><b>Updated:</b> {{ currentGame.updated_time }}</div>
            <div class="platform">
              <div v-if="currentGame.android" class="android">
                <i class="icon-android"></i>Android
                <div class="qrcode">
                  Android
                  <img :src="qrCodeGoogle" alt="qrcode" />
                </div>
                <a :href="currentGame.android_web_url"></a>
              </div>

              <div v-if="currentGame.ios" class="ios">
                <i class="icon-ios"></i>iOS
                <div class="qrcode">
                  iOS
                  <img :src="qrCodeIos" alt="qrcode" />
                </div>
                <a :href="currentGame.ios_web_url"></a>
              </div>
            </div>
          </div>
        </div>

        <ExpandableText2 :text="currentGame.desc" />
      </section>

      <!-- <h2 class="title-h2"><i class="icon-related"></i>RelatedApps</h2>
      <section class="box-small-bg">
        <ContentItemRow1
          v-for="(item, index) in relatedApps"
          :key="index"
          :index="index"
          :item="item"
          :to="`/app/${item.path}/`"
        />
      </section> -->

      <!-- download-2: Google Ad 占位 2 -->
      <GoogleAd ad-slot="2955836717" class="ad-2" />

      <div class="title-h2">
        <div class="title-button"> <i class="icon-rec" /> Recommend Games</div></div
      >
      <section>
        <InfiniteScrollList
          api-endpoint="/api/game/all_game"
          :initial-page="2"
          :page-size="20"
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
        </InfiniteScrollList>
      </section>

      <aside class="box-aside">
        <!-- download-r1: Google Ad 占位 r1 -->
        <GoogleAd ad-slot="3489069628" />
        <div class="title-h2">
          <div class="title-button"> <i class="icon-hot" /> Hot Games</div></div
        >
        <ContentItemRow1
          v-for="(item, index) in hotGames"
          :key="index"
          :item="item"
          :index="index"
          :to="`/game/${item.path}/`"
        />
      </aside>
    </main>
    <Footer />
    <BackTop />
    <!-- <AdLoading /> -->
  </div>
</template>

<script>
import QRCode from "qrcode";
import { shuffleArray } from "~/utils/utils";

export default {
  async asyncData({ $axios, params, env }) {
    try {
      const path = params.download;
      const lastDashIndex = path.lastIndexOf("-");
      const id = path.substring(lastDashIndex + 1, path.length);

      const [currentGameResponse, hotGamesResponse, allGamesResponse] = await Promise.all([
        $axios.$get("/api/game/detail", {
          params: {
            site_id: env.SITE_ID,
            game_id: id
          }
        }),
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "hot",
            size: 10,
            page: 1
          }
        }),
        $axios.$get("/api/game/all_game", {
          params: {
            site_id: env.SITE_ID,
            page: 1,
            size: 20
          }
        })
      ]);
      return {
        currentGame: currentGameResponse,
        hotGames: shuffleArray(hotGamesResponse.list),
        allGames: allGamesResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  data() {
    return {
      qrCodeGoogle: "",
      qrCodeIos: ""
    };
  },
  mounted() {
    if (this.currentGame.ios_web_url) {
      this.generateQRCode(this.currentGame.ios_web_url).then((data) => {
        this.qrCodeIos = data;
      });
    }
    if (this.currentGame.android_web_url) {
      this.generateQRCode(this.currentGame.android_web_url).then((data) => {
        this.qrCodeGoogle = data;
      });
    }
  },
  methods: {
    async generateQRCode(url) {
      try {
        const qrCodeDataURL = await QRCode.toDataURL(url);
        return qrCodeDataURL;
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/css/download.scss";
.ad-1 {
  margin-bottom: 32px;
}

.ad-2 {
  margin-top: 36px;
}
@media screen and (max-width: 879px) {
  .expandable-text {
    box-shadow: none;
    border: none;
    &::before {
      display: none;
    }
  }
  .box-small-bg {
    margin-bottom: vw(36);
  }
}
</style>
