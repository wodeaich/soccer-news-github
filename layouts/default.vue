<template>
  <Nuxt />
</template>

<script>
export default {
  // @nuxtjs/i18n v7：注入 hreflang alternate、og:locale、html lang，
  // 并统一补充 dir（阿拉伯语 rtl），页面自身的 htmlAttrs 可覆盖。
  head() {
    const i18nHead = this.$nuxtI18nHead({ addSeoAttributes: true })
    i18nHead.htmlAttrs = {
      ...i18nHead.htmlAttrs,
      dir: this.$i18n.locale === 'ar' ? 'rtl' : 'ltr'
    }
    return i18nHead
  }
}
</script>
