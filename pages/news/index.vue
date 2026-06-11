<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('news.title') }}</h1>

      <!-- 广告位顶部 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="news-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 置顶精选 -->
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

      <!-- 文章列表无限滚动 -->
      <section class="section">
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
            <!-- 广告穿插：每10条插一个广告 -->
            <adm-slot
              v-if="items.length >= 10"
              class="ad-inline"
              adm-id="news-inline"
              adm-unit="/23197833490/soccerins/soccerins_home_3"
              ads-slot="6028318341"
            />
          </template>
        </InfiniteScrollList1>
      </section>
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
      const [featuredRes, allRes] = await Promise.all([
        $axios.$get('/api/article/menu', { params: { site_id: siteAfs, mod_id: 'rec', size: 3 } }),
        $axios.$get('/api/article/menu', { params: { site_id: siteAfs, mod_id: 'all', size: 10 } })
      ])
      return {
        featured: featuredRes.list || [],
        allNews: allRes.list || []
      }
    } catch (e) {
      return { featured: [], allNews: [] }
    }
  },
  head() {
    const locale = this.$i18n.locale
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `https://compsoccer.com/${locale}/` },
        { '@type': 'ListItem', position: 2, name: this.$t('news.title'), item: `https://compsoccer.com/${locale}/news/` }
      ]
    }
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.$t('news.title')} - CompSoccer`,
      meta: [
        { hid: 'description', name: 'description', content: 'Latest World Cup 2026 news, transfer updates and team news.' },
        { hid: 'og:title', property: 'og:title', content: `${this.$t('news.title')} - CompSoccer` },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [{ hid: 'ld-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) }]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px 48px; }

.page-title {
  font-family: "rssb";
  font-size: 28px;
  color: $font1;
  margin: 32px 0 24px;
  padding-left: 12px;
  border-left: 4px solid $color1;
}

.section-featured { margin-bottom: 40px; }
.featured-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  height: 380px;
}
.featured-main { height: 100%; }
.featured-side { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.featured-side-item { flex: 1; min-height: 0; }

.section { margin-top: 8px; }
.news-list { display: flex; flex-direction: column; gap: 20px; }
.ad-block { margin: 24px 0; }
.ad-inline { margin: 12px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .page-title { font-size: vw(42); margin: vw(32) 0 vw(24); padding-left: vw(16); }
  .featured-grid { grid-template-columns: 1fr; height: auto; gap: vw(24); }
  .featured-main { height: vw(360); }
  .featured-side { flex-direction: row; height: vw(200); }
  .news-list { gap: vw(28); }
}
</style>
