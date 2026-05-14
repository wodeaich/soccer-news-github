<template>
  <nuxt-link :to="localePath(`/news/${item.path}/`)" class="card-grid">
    <img :src="item.cover" :alt="item.name" class="img" loading="lazy" />
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
        month: 'short', day: 'numeric', year: 'numeric'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-grid {
  display: block;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.14); }
}
.img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.info { padding: 12px; }
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
  .img { height: vw(280); }
  .info { padding: vw(16); }
  .title { font-size: vw(28); line-height: vw(40); }
  .date { font-size: vw(22); }
}
</style>
