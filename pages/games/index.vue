<template>
  <div class="page">
    <!-- <Header current-path="home" /> -->
    <main class="main">
      <section>
        <!-- <link-outside :item="linkOutside" /> -->
        <!-- if取消导流代码使用部分 -->
        <CustomLink
          v-for="(item, index) in recGames"
          :key="index"
          :item="item"
          :index="index"
          :to="`/game/${item.path}/`"
          class="head-bg"
        >
          <NuxtImg
            format="auto"
            fit="cover"
            width="1280"
            height="440"
            :src="item.pc_img"
            :alt="item.name"
            :preloader="index === 0"
            class="pc-hidden"
          />
          <NuxtImg
            format="auto"
            fit="cover"
            width="750"
            height="358"
            :src="item.mobile_img"
            :alt="item.name"
            :preloader="index === 0"
            class="m-hidden"
          />
          <div class="play-now">PLAY NOW<i /></div>
        </CustomLink>
        <CustomLink to="/" class="back-afs"><i class="back-afs-icon" /></CustomLink>
        <div class="recommend-content">
          <div class="content">
            <div class="menu">
              <div class="download" v-if="showInstallButton" @click="installPWA"
                ><i class="icon-pc-pwa" />TO DESKTOP</div
              >
              <CustomLink to="/search/" class="search"><i class="icon-search" />SEARCH </CustomLink>
              <CustomLink to="/search/" class="m-search"><i class="icon-search" /></CustomLink>
            </div>
            <div class="category">
              <CustomLink
                to="/live/"
                class="module1"
                :class="{ module1active: this.imageIndex === 0 }"
                ><i class="icon-cate-live" />Live Games</CustomLink
              >
              <CustomLink
                to="/casual/"
                class="module2"
                :class="{ module2active: this.imageIndex === 1 }"
                ><i class="icon-cate-casual" />Casual Games</CustomLink
              >
            </div>
            <CustomLink :to="this.imageIndex === 0 ? '/live/' : '/casual/'">
              <div v-once v-swiper:mySwiper="swiperOption" class="background-image">
                <div class="swiper-wrapper">
                  <div v-for="(item, i) in liveGames" :key="i" class="swiper-slide">
                    <NuxtImg
                      format="auto"
                      fit="cover"
                      width="1152"
                      height="360"
                      :src="item.pc_img"
                      :alt="item.name"
                      :loading="i === 0 ? 'eager' : 'lazy'"
                      :preloader="i === 0"
                      class="rec-img pc-hidden"
                    />
                    <NuxtImg
                      format="auto"
                      fit="cover"
                      width="975"
                      height="411"
                      :src="item.mobile_img"
                      :alt="item.name"
                      :loading="i === 0 ? 'eager' : 'lazy'"
                      :preloader="i === 0"
                      class="rec-img m-hidden"
                    />
                  </div>
                </div>
              </div>
              <div class="play-now">SEE MORE<i /></div>
            </CustomLink>
          </div>
        </div>
      </section>
      <!-- page-1: Google Ad 占位 1 -->
      <!-- <GoogleAd ad-slot="6667048681" class="ad" /> -->

      <div class="title-h2">
        <CustomLink to="/hot/" class="title-button button-hot">
          <i class="icon-hot" /> Hot Games</CustomLink
        >
        <CustomLink to="/hot/"> <i class="icon-arrow" /></CustomLink>
      </div>
      <section class="box-row-scroll">
        <!-- <link-outside :item="hotGames[0]" /> -->
        <ContentItemRow
          v-for="(item, index) in hotGames.slice(1)"
          :key="index"
          :item="item"
          :index="index"
          :to="`/game/${item.path}/`"
        />
      </section>
      <div class="title-h2 rec-title">
        <div class="title-button"> <i class="icon-rec" /> Recommend Games</div>
      </div>

      <section>
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
        </InfiniteScrollList>
      </section>
    </main>
    <Footer />
    <BackTop />
    <AdLoading />
  </div>
</template>
<script>
import { directive } from "vue-awesome-swiper";
import "swiper/css/swiper.min.css";

export default {
  directives: {
    swiper: directive
  },

  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [
        recommendGamesResponse,
        liveGamesResponse,
        casualGamesResponse,
        hotGamesResponse,
        allGamesResponse
      ] = await Promise.all([
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "rec推荐模块",
            size: 1
          }
        }),
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "live",
            size: 1
          }
        }),
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "casual",
            size: 1
          }
        }),
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "hot",
            size: 11
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
      liveGamesResponse.list.push(casualGamesResponse.list[0]);

      // console.log(linkOutsideDataResponse);
      // 返回多个接口的数据
      return {
        recGames: recommendGamesResponse.list,
        liveGames: liveGamesResponse.list,
        casualGames: casualGamesResponse.list,
        hotGames: hotGamesResponse.list,
        allGames: allGamesResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  data() {
    return {
      deferredPrompt: null,
      showInstallButton: false,
      imageIndex: 0,
      swiperOption: {
        slidesPerView: "auto",
        loop: true,
        // effect: "coverflow",
        speed: 600,
        grabCursor: true,
        direction: "horizontal",
        autoplay: {
          delay: 2000,
          disableOnInteraction: false
        },
        on: {
          slideChange: this.onSlideChange
        }
      }
    };
  },
  mounted() {
    // 判断是否支持 PWA
    if ("serviceWorker" in navigator && "PushManager" in window) {
      if (window.deferredPrompt) {
        this.deferredPrompt = window.deferredPrompt;
        this.showInstallButton = true;
      } else {
        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault();
          this.deferredPrompt = e;
          this.showInstallButton = true;
        });
      }
    }
  },

  methods: {
    installPWA() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(() => {
          this.deferredPrompt = null;
        });
      }
    },
    onSlideChange() {
      this.imageIndex = (this.mySwiper && this.mySwiper.realIndex) || 0;
    }
  }
};
</script>
<style lang="scss" scoped>
.m-hidden {
  display: none;
}
.pc-hidden {
  display: block;
}

.main {
  max-width: 1202px;
  margin: 0 auto;
}

.head-bg {
  display: block;
  position: relative;
  transform: translateX(-8.3%);
  width: 120%;
  height: 488px;
  img {
    width: 100%;
    height: 100%;
  }
}
.play-now {
  width: 180px;
  height: 40px;
  border-radius: 70px;
  outline: 4px solid rgba(255, 255, 255, 0.6);
  background: $btn-bg;
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  font-family: seb;
  font-size: 20px;
  color: #ffffff;
  line-height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    @include icon(40px, 40px, "icon-foot.png");
    margin-left: 4px;
  }
}

.back-afs {
  position: absolute;
  top: 32px;
  left: 46px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  @include center;
  width: 46px;
  height: 46px;
}

.back-afs-icon {
  @include icon(38px, 38px, "back-afs.png");
}

.recommend-content {
  margin-top: 10px;
  padding: 24px;
  width: 100%;
  // height: 432px;
  box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
  border-radius: 40px 40px 40px 40px;
  position: relative;
  .content {
    border-radius: 24px;
    box-shadow: 5px 5px 4px 0px rgba(#83a9c4, 0.3), -5px -5px 4px 0px #f8fdfd;
  }
  .category {
    display: flex;
    justify-content: space-between;
    width: 754px;
  }
  .play-now {
    left: unset;
    right: 48px;
    bottom: 48px;
    transform: translateX(0);
    z-index: 1;
  }
  .module1 {
    width: 376px;
    height: 80px;
    // box-shadow: inset 3px 3px 3px 0px rgba(131, 169, 196, 0.3),
    //   inset -3px -3px 3px 0px rgba(248, 253, 253, 0.5);
    border-radius: 24px 0px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 21px;
    color: rgba(65, 65, 76, 0.4);
    line-height: 25px;
    text-shadow: inset 1px 1px 1px rgba(43, 57, 67, 0.2);
  }
  .module1active {
    color: #ffffff;
    background: $btn-bg;
    border: 4px solid #f0f2f5;
    box-shadow: inset 3px 3px 3px 0px rgba(131, 169, 196, 0.3),
      inset -3px -3px 3px 0px rgba(248, 253, 253, 0.5);
    .icon-cate-live {
      @include icon(40px, 40px, "icon-cate-live2.png");
    }
  }

  .module2 {
    width: 376px;
    height: 80px;
    // box-shadow: inset 3px 3px 3px 0px rgba(131, 169, 196, 0.3),
    //   inset -3px -3px 3px 0px rgba(248, 253, 253, 0.5);
    border-radius: 0px 24px 0px 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 21px;
    color: rgba(65, 65, 76, 0.4);
    line-height: 25px;
    text-shadow: inset 1px 1px 1px rgba(43, 57, 67, 0.2);
    z-index: 1;
  }
  .module2active {
    color: #ffffff;
    background: $btn-bg;
    box-shadow: inset 3px 3px 3px 0px rgba(131, 169, 196, 0.3),
      inset -3px -3px 3px 0px rgba(248, 253, 253, 0.5);
    border: 4px solid #f0f2f5;
    .icon-cate-casual {
      @include icon(40px, 40px, "icon-cate-casual2.png");
    }
  }
  .menu {
    // width: 338px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 14px;
    right: 25px;
  }
  .download {
    width: 152px;
    height: 40px;
    box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
    border-radius: 50px 50px 50px 50px;
    border: 1px solid #68dfc3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: seb;
    font-size: 14px;
    line-height: 18px;
    color: #68dfc3;
  }
  .search {
    width: 152px;
    height: 40px;
    box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
    border-radius: 50px 50px 50px 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $btn-bg;
    margin-left: 32px;
    font-family: seb;
    font-size: 14px;
    line-height: 18px;
    color: #ffffff;
  }
  .m-search {
    display: none;
  }
  .rec-img {
    width: 100%;
    height: 100%;
  }
  .background-image {
    width: 1152px;
    height: 360px;
    border-radius: 0px 0px 24px 24px;
    margin-top: 20px;
    overflow: hidden;
  }
  .swiper-slide {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  &::before {
    content: "";
    width: 448px;
    height: 150px;
    position: absolute;
    right: 0px;
    top: -10px;
    @include bg("icon-corner.png");
  }
}

.ad {
  margin-top: 40px;
}
.button-hot {
  box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd,
    inset 0 0 0 rgba(131, 169, 196, 0.3), inset 0 0 0 #f8fdfd;
  transition: 0.1s;
  &:hover {
    box-shadow: 0 0 0 rgba(131, 169, 196, 0.3), 0 0 0 #f8fdfd, inset -5px -5px 4px #f8fdfd,
      inset 5px 5px 4px rgba(131, 169, 196, 0.3);
  }
}
.box-row-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(384px, 1fr));
  margin-bottom: -16px;
  gap: 16px;
  .item {
    &:nth-child(n + 7) {
      display: none;
    }
  }
}
.rec-title {
  margin-top: 48px;
}
@media screen and (min-width: 879px) and (max-width: 1445px) {
  .head-bg {
    transform: translateX(0);
    height: 408px;
    width: 100%;
  }
}
@media screen and (min-width: 879px) and (max-width: 1275px) {
  .head-bg {
    height: vw2(408);
  }
  .recommend-content {
    padding: vw2(24);
    .category {
      width: vw2(766);
    }
    .module1 {
      width: vw2(382);
      height: vw2(80);
      border-radius: vw2(24) 0px 0px 0px;
      font-size: vw2(21);
      line-height: vw2(25);
    }
    .module1active {
      .icon-cate-live {
        width: vw2(40);
        height: vw2(40);
      }
    }
    .module2 {
      width: vw2(382);
      height: vw2(80);
      border-radius: 0px vw2(24) 0px 0px;
      font-size: vw2(21);
      line-height: vw2(25);
    }
    .module2active {
      .icon-cate-casual {
        width: vw2(40);
        height: vw2(40);
      }
    }
    .menu {
      top: vw2(14);
      right: vw2(0);
    }
    .download {
      width: vw2(152);
      height: vw2(40);
      border-radius: vw2(50);
      font-size: vw2(14);
      line-height: vw2(18);
    }
    .search {
      width: vw2(152);
      height: vw2(40);
      margin-left: vw2(32);
      font-size: vw2(14);
      line-height: vw2(18);
    }
    .background-image {
      width: vw2(1152);
      height: vw2(360);
      border-radius: vw2(24);
      margin-top: vw2(20);
    }
    &::before {
      width: vw2(448);
      height: vw2(150);
      position: absolute;
      right: vw2(0);
      top: vw2(-10);
    }
  }
}
@media screen and (max-width: 879px) {
  .pc-hidden {
    display: none;
  }
  .m-hidden {
    display: block;
  }
  .page {
    padding: 0;
  }
  .head-bg {
    transform: translateX(0);
    width: 100%;
    height: vw(350);
  }
  .play-now {
    width: vw(210);
    height: vw(48);
    border-radius: vw(140);
    outline: 2px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.4);
    left: unset;
    right: vw(46);
    bottom: vw(16);
    transform: translateX(0);
    font-size: vw(24);
    color: #41414c;
    line-height: vw(32);
    i {
      @include icon(vw(32), vw(32), "icon-seemore.png");
      margin-left: vw(4);
    }
  }

  .back-afs {
    top: vw(20);
    left: vw(46);
    width: vw(64);
    height: vw(64);
  }

  .back-afs-icon {
    width: vw(48);
    height: vw(48);
  }
  .recommend-content {
    margin-top: vw(20);
    padding: 0;
    height: vw(448);
    box-shadow: none;
    .content {
      box-shadow: 0px 5px 4px 0px rgba(131, 169, 196, 0.3), 0 -5px 4px 0px #f8fdfd;
      border-radius: 0;
    }
    .category {
      width: fit-content;
      align-items: center;
      justify-content: center;
      height: vw(136);
      padding-left: vw(46);
    }
    .play-now {
      color: #41414c;
      right: vw(46);
      bottom: vw(16);
      i {
        @include icon(vw(32), vw(32), "icon-seemore.png");
        margin-top: vw(2);
      }
    }
    .module1 {
      width: vw(198);
      height: vw(64);
      border-radius: vw(76);
      box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
      font-size: vw(28);
      line-height: vw(36);
    }
    .module1active {
      background: $btn-bg2;
      border: none;
      box-shadow: inset 2px 2px 3px 0px rgba(131, 169, 196, 0.3),
        inset -2px -2px 3px 0px rgba(#f8fdfd, 0.4);
      .icon-cate-live {
        display: none;
      }
    }
    .module2 {
      width: vw(232);
      height: vw(64);
      border-radius: vw(76);
      box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
      margin-left: vw(32);
      font-size: vw(28);
      line-height: vw(36);
    }
    .module2active {
      background: $btn-bg2;
      border: none;
      box-shadow: inset 2px 2px 3px 0px rgba(131, 169, 196, 0.3),
        inset -2px -2px 3px 0px rgba(#f8fdfd, 0.4);
      .icon-cate-casual {
        display: none;
      }
    }
    .menu {
      top: vw(34);
      right: vw(31);
    }
    .download {
      display: none;
    }
    .search {
      display: none;
    }
    .m-search {
      display: block;
      width: vw(112);
      height: vw(64);
      border-radius: vw(76);
      background: $btn-bg2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-search {
      width: vw(48);
      height: vw(48);
      margin: 0;
    }
    .background-image {
      width: 100%;
      height: vw(316);
      margin-top: vw(0);
      border-radius: 0;
    }
    &::before {
      width: vw(244);
      height: vw(140);
      right: 0;
      top: vw(-20);
      @include bg("icon-m-corner.png");
    }
  }
  .box-row-scroll {
    padding: vw(12) vw(46);
    grid-template-columns: repeat(4, vw(258));
    gap: vw(32);
    .item {
      &:nth-child(n + 7) {
        display: flex;
      }
    }
    @include scroll;
  }
}
</style>
