<template>
  <nuxt-link :to="localePath(`/news/${item.path}/`)" class="card-row">
    <img :src="item.cover" :alt="item.name" class="img" loading="lazy" @error="e => e.target.src='/img-fallback.svg'" />
    <div class="info">
      <p class="title">{{ item.name }}</p>
      <span class="date">{{ formatDate(item.published_at) }}</span>
    </div>
  </nuxt-link>
</template>

<script>
export default {
  props: {
    item: { type: Object, required: true }
  },
  methods: {
    formatDate(ts) {
      if (!ts) return ''
      return new Date(ts * 1000).toLocaleDateString(this.$i18n.locale, {
        month: 'short', day: 'numeric'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
.info { flex: 1; }
.title {
  font-family: "rssb";
  font-size: 15px;
  line-height: 22px;
  color: $font1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}
.date { font-size: 12px; color: rgba($font1, 0.5); }

@media screen and (max-width: 750px) {
  .img { width: vw(160); height: vw(110); border-radius: vw(8); }
  .title { font-size: vw(28); line-height: vw(40); }
  .date { font-size: vw(22); }
}
</style>
