<template>
  <Nuxt />
</template>

<script>
export default {
  // @nuxtjs/i18n v7：注入 hreflang alternate、og:locale、html lang，
  // 并统一补充 dir（阿拉伯语 rtl），页面自身的 htmlAttrs 可覆盖。
  // 文章详情页例外：各语言文章相互独立（后台按语言独立录入），其它语言
  // 并不存在“同一篇”，跨语言 alternate 会指向 404，因此剔除。
  head() {
    const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true })
    i18nHead.htmlAttrs = {
      ...i18nHead.htmlAttrs,
      dir: this.$i18n.locale === 'ar' ? 'rtl' : 'ltr'
    }
    const isArticlePage = (this.$route.name || '').startsWith('news-slug')
    if (isArticlePage) {
      i18nHead.link = (i18nHead.link || []).filter((l) => l.rel !== 'alternate')
      i18nHead.meta = (i18nHead.meta || []).filter(
        (m) => m.property !== 'og:locale:alternate'
      )
    }
    return i18nHead
  }
}
</script>
