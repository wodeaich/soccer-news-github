<template>
  <nuxt-link :to="localePath(`/news/${item.path}/`)" class="card-featured">
    <img :src="item.cover" :alt="item.name" class="img" loading="eager" @error="e => e.target.src='/img-fallback.svg'" />
    <div class="overlay">
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
.card-featured {
  display: block;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
  min-height: 320px;
}
.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 48px 24px 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 55%, transparent 100%);
  box-sizing: border-box;
}
.title {
  font-family: "rssb";
  font-size: 20px;
  line-height: 30px;
  color: #fff;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}
.date {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  display: block;
}
@media screen and (max-width: 750px) {
  .card-featured { min-height: vw(360); border-radius: vw(16); }
  .title { font-size: vw(32); line-height: vw(44); }
  .date { font-size: vw(22); }
}
</style>
