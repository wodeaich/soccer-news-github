<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('news.title') }}</h1>

      <!-- 不做分类：图片缩略图 + 文章标题的简单列表 -->
      <section class="section">
        <InfiniteScrollList1
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
    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <BackTop />
  </div>
</template>

<script>
export default {
  asyncData({ payload }) {
    return payload || { featured: [], allNews: [] }
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
