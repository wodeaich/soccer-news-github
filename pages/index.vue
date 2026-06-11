<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="main container">

      <!-- 顶部精选新闻 -->
      <section v-if="featured.length" class="section-featured">
        <div class="featured-grid">
          <Soccer-NewsCardFeatured :item="featured[0]" class="featured-main" />
          <div class="featured-side">
            <Soccer-NewsCardFeatured
              v-for="(item, i) in featured.slice(1, 3)"
              :key="i"
              :item="item"
              class="featured-side-item"
            />
          </div>
        </div>
      </section>

      <!-- 广告位 1 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="home-1"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 趋势新闻 -->
      <section class="section">
        <h2 class="section-title">{{ $t('home.trending') }}</h2>
        <div class="grid-3">
          <Soccer-NewsCardGrid
            v-for="(item, i) in trending"
            :key="i"
            :item="item"
          />
        </div>
      </section>

      <!-- 广告位 2（通栏） -->
      <adm-slot-full
        class="ad-block"
        adm-id="home-full"
        adm-unit="/23197833490/soccerins/soccerins_home_full"
        ads-slot="4080715115"
      />

      <!-- 全部文章（无限滚动） -->
      <section class="section">
        <h2 class="section-title">{{ $t('home.allArticles') }}</h2>
        <InfiniteScrollList1
          api-endpoint="/api/article/menu"
          :initial-page="3"
          :page-size="10"
          mod-id="all"
          :initial-items="allNews"
          class="news-list"
        >
          <template #default="{ items }">
            <Soccer-NewsCardRow
              v-for="(item, i) in items"
              :key="i"
              :item="item"
            />
          </template>
        </InfiniteScrollList1>
      </section>

      <!-- 广告位 3 -->
      <adm-slot
        class="ad-block"
        adm-id="home-3"
        adm-unit="/23197833490/soccerins/soccerins_home_3"
        ads-slot="6028318341"
      />

    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <AdLoading />
    <BackTop />
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, env }) {
    try {
      const siteAfs = env.SITE_AFS
      const [featuredRes, trendingRes, allRes] = await Promise.all([
        $axios.$get('/api/article/menu', { params: { site_id: siteAfs, mod_id: 'rec', size: 3 } }),
        $axios.$get('/api/article/menu', { params: { site_id: siteAfs, mod_id: 'trending', size: 6 } }),
        $axios.$get('/api/article/menu', { params: { site_id: siteAfs, mod_id: 'all', size: 10 } })
      ])
      return {
        featured: featuredRes.list || [],
        trending: trendingRes.list || [],
        allNews: allRes.list || []
      }
    } catch (e) {
      return { featured: [], trending: [], allNews: [] }
    }
  },
  head() {
    return {
      title: `CompSoccer - ${this.$t('home.latestNews')}`,
      meta: [
        { hid: 'description', name: 'description', content: 'World Cup 2026 news, schedules, results and live TV guide in 6 languages.' },
        { hid: 'og:title', property: 'og:title', content: `CompSoccer - ${this.$t('home.latestNews')}` },
        { hid: 'og:description', property: 'og:description', content: 'World Cup 2026 news, schedules, results and live TV guide.' },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.section { margin-top: 40px; }

.section-title {
  font-family: "rssb";
  font-size: 22px;
  color: $font1;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid $color1;
  display: inline-block;
}

.section-featured { margin-top: 24px; }
.featured-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  height: 400px;
}
.featured-main { height: 100%; }
.featured-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.featured-side-item { flex: 1; min-height: 0; }

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ad-block { margin: 32px 0; }

@media screen and (max-width: 900px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .section { margin-top: vw(48); }
  .section-title { font-size: vw(36); margin-bottom: vw(24); }
  .featured-grid {
    grid-template-columns: 1fr;
    height: auto;
    gap: vw(24);
  }
  .featured-main { height: vw(360); }
  .featured-side { flex-direction: row; height: vw(200); }
  .grid-3 { grid-template-columns: 1fr; }
  .news-list { gap: vw(28); }
  .ad-block { margin: vw(32) 0; }
}
</style>
