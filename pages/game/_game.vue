<template>
  <div class="page">
    <Header current-path="app" />
    <main class="main">
      <Breadcrumb :name="currentGame.name" />
      <section class="application-info">
        <NuxtImg
          format="auto"
          fit="cover"
          width="156"
          height="156"
          :src="currentGame.icon"
          :alt="currentGame.name"
          loading="lazy"
          class="icon"
        ></NuxtImg>
        <div class="info">
          <div class="name">{{ currentGame.name }}</div>
          <div class="rating">
            <div class="rating-star">
              <p :style="{ width: (((currentGame.score || 4.6) / 5) * 100).toFixed(0) + '%' }"></p>
            </div>
            {{
              currentGame.score.length == 1 ? currentGame.score + ".0" : currentGame.score || 4.6
            }}
          </div>
        </div>
        <div
          class="get-it-now"
          @click="
            $refs.targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          "
        >
          <i class="icon-get-it-now"></i>Get Game
        </div>
      </section>
      <!-- detail-1: Google Ad 占位 1 -->
      <GoogleAd ad-slot="7045171250" />

      <section class="table-content">
        <div class="table-info">
          <div class="table-row">
            <div class="table-cell"><i class="icon-os"></i>OS</div>
            <div class="table-cell"
              ><i v-if="currentGame.android" class="icon-android"></i
              ><i v-if="currentGame.ios" class="icon-ios"></i
            ></div>
          </div>
          <div class="table-row">
            <div class="table-cell"><i class="icon-size"></i>Size</div>
            <div class="table-cell">{{ currentGame.apk_size }}</div>
          </div>
          <div class="table-row">
            <div class="table-cell"><i class="icon-version"></i>Version</div>
            <div class="table-cell">{{ currentGame.version }}</div>
          </div>
          <div class="table-row">
            <div class="table-cell"><i class="icon-updated"></i>Updated</div>
            <div class="table-cell">{{ currentGame.updated_time }}</div>
          </div>
        </div>
      </section>

      <section class="application-desc">
        <div v-if="currentGame.banner_list.length > 0" class="swiper-bg">
          <div v-swiper:mySwiper="swiperOption" class="swiper-box">
            <div class="swiper-wrapper">
              <div v-for="(banner, i) in currentGame.banner_list" :key="i" class="swiper-slide">
                <NuxtImg
                  format="auto"
                  fit="cover"
                  height="288"
                  :src="banner"
                  :alt="currentGame.name"
                  loading="lazy"
                  class="img"
                />
              </div>
            </div>
            <div class="swiper-tool">
              <div class="swiper-button-prev"></div>
              <div class="swiper-pagination"></div>
              <div class="swiper-button-next"></div>
            </div>
          </div>
        </div>
        <ExpandableText class="expand" :text="currentGame.desc" />
      </section>

      <!-- detail-2: Google Ad 占位 2 -->
      <div ref="targetElement">
        <GoogleAd ad-slot="8358252927" />
      </div>

      <section class="get-the-game">
        <CustomLink class="download" :to="`/download/${currentGame.path}/`"
          ><i class="icon-download"></i>Download
        </CustomLink>
        <div class="tip">
          * For reference, The {{ currentGame.name }} game websites are all approved, there are no
          viruses and malware.
        </div>
      </section>

      <!-- <h2 class="title-h2"><i class="icon-related"></i>Related Apps</h2>

      <section class="box-small-bg">
        <ContentItemRow1
          v-for="(item, index) in relatedApps"
          :key="index"
          :index="index"
          :item="item"
          :to="`/app/${item.path}/`"
        />
      </section> -->

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
        <!-- detail-r1: Google Ad 占位 2 -->
        <GoogleAd ad-slot="7793230426" />
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
import { directive } from "vue-awesome-swiper";
import { shuffleArray } from "~/utils/utils";
import "swiper/css/swiper.min.css";

export default {
  directives: {
    swiper: directive
  },
  async asyncData({ $axios, params, env }) {
    try {
      const path = params.game;
      const lastDashIndex = path.lastIndexOf("-");
      const id = path.substring(lastDashIndex + 1, path.length);

      const [currentGameResponse, hotGameResponse, allGameResponse] = await Promise.all([
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
        hotGames: shuffleArray(hotGameResponse.list),
        allGames: allGameResponse.list
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
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev"
        }
      }
    };
  },
  head() {
    return {
      title: `SoccerIns － dedicated to the dreams and wonders of the young crowd, play with your own colors in the ${
        this.currentGame.name || "game"
      }!`
    };
  }
};
</script>
<style lang="scss" scoped>
@import "~/assets/css/game.scss";
</style>
