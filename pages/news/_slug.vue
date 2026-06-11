<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <article class="article">
        <h1 class="article-title">{{ newInfo.name }}</h1>

        <adm-slot-preload
          class="ad-box"
          adm-id="detail-afs-1"
          adm-unit="/23197833490/soccerins/soccerins_detail_afs0"
          ads-slot="5287911342"
        />

        <img
          :src="newInfo.cover"
          :alt="newInfo.name"
          class="article-img"
          loading="eager"
        />

        <div class="news-intro">{{ newInfo.first_paragraph }}</div>

        <adm-slot-full
          class="ad-box"
          adm-id="detail-full"
          adm-unit="/23197833490/soccerins/soccerins_detail_full"
          ads-slot="2677786806"
        />

        <Afs-ArticleWithAdm :content="newInfo.content" />
      </article>
    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <AdLoading />
    <BackTop />
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, params, env, error }) {
    try {
      const slug = params.slug
      const lastDash = slug.lastIndexOf('-')
      const id = slug.substring(lastDash + 1)

      const data = await $axios.$get('/api/article/detail', {
        params: { site_id: env.SITE_AFS, article_id: id }
      })

      data.content = data.content.replace(
        /<\/h4><p><br><br>|<br><br><\/p><h4>/g,
        (match) => (match.includes('</h4><p>') ? '</h4><p>' : '</p><h4>')
      )

      return { newInfo: data }
    } catch (e) {
      error({ statusCode: 404, message: 'Article not found' })
    }
  },
  data() {
    return {
      newInfo: {}
    }
  },
  head() {
    const locale = this.$i18n.locale
    const localeMap = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', ar: 'ar_SA', ja: 'ja_JP', ko: 'ko_KR' }
    const canonicalUrl = `https://compsoccer.com/${locale}/news/${this.newInfo.path}/`
    const pubDate = this.newInfo.published_at || this.newInfo.created_at || new Date().toISOString()

    const newsArticleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: this.newInfo.name,
      image: [this.newInfo.cover].filter(Boolean),
      datePublished: pubDate,
      dateModified: this.newInfo.updated_at || pubDate,
      author: [{ '@type': 'Organization', name: 'CompSoccer', url: 'https://compsoccer.com' }],
      publisher: {
        '@type': 'Organization',
        name: 'CompSoccer',
        logo: { '@type': 'ImageObject', url: 'https://compsoccer.com/icons/192.png' }
      },
      description: this.newInfo.first_paragraph,
      url: canonicalUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      inLanguage: locale
    }

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `https://compsoccer.com/${locale}/` },
        { '@type': 'ListItem', position: 2, name: 'News', item: `https://compsoccer.com/${locale}/news/` },
        { '@type': 'ListItem', position: 3, name: this.newInfo.name, item: canonicalUrl }
      ]
    }

    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.newInfo.name} - CompSoccer`,
      meta: [
        { hid: 'description', name: 'description', content: this.newInfo.first_paragraph },
        { hid: 'keywords', name: 'keywords', content: this.newInfo.terms || '' },
        { hid: 'og:title', property: 'og:title', content: this.newInfo.name },
        { hid: 'og:description', property: 'og:description', content: this.newInfo.first_paragraph },
        { hid: 'og:url', property: 'og:url', content: canonicalUrl },
        { hid: 'og:locale', property: 'og:locale', content: localeMap[locale] || locale },
        { hid: 'og:image', property: 'og:image', content: this.newInfo.cover },
        { hid: 'og:type', property: 'og:type', content: 'article' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        { hid: 'ld-news-article', type: 'application/ld+json', innerHTML: JSON.stringify(newsArticleSchema) },
        { hid: 'ld-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }
.container { max-width: 860px; margin: 0 auto; padding: 0 24px 64px; }

.article {
  padding-top: 32px;
  padding-bottom: 48px;
  border-bottom: 1px solid #ececee;
}

.article-title {
  font-family: "rssb";
  font-size: 28px;
  font-weight: bold;
  line-height: 1.35;
  color: $font1;
  margin-bottom: 24px;
}

.article-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 20px;
  object-fit: cover;
  max-height: 480px;
}

.news-intro {
  font-size: 16px;
  line-height: 1.7;
  color: $font1;
  margin-bottom: 24px;
}

::v-deep .ad-box { margin-bottom: 32px; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .article { padding-top: vw(32); padding-bottom: vw(48); }
  .article-title { font-size: vw(40); line-height: vw(56); margin-bottom: vw(32); }
  .article-img { border-radius: vw(12); margin-bottom: vw(24); max-height: vw(400); }
  .news-intro { font-size: vw(30); }
  ::v-deep .ad-box {
    width: 100vw;
    margin-left: vw(-46);
    margin-bottom: vw(48);
  }
}
</style>
