<template>
  <nuxt-link :to="localePath(`/news/${item.path}/`)" class="card-row">
    <!-- 左侧封面图 -->
    <img
      :src="item.cover"
      :alt="item.name"
      class="img"
      loading="lazy"
      @error="e => e.target.src='/img-fallback.svg'"
    />

    <!-- 右侧：分类标签 + 标题 + 摘要 + 日期 -->
    <div class="info">
      <span v-if="item.article_type" class="tag">{{ item.article_type }}</span>
      <p class="title">{{ item.name }}</p>
      <p v-if="item.first_paragraph" class="summary">{{ item.first_paragraph }}</p>
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
.card-row {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 24px 0;
  border-bottom: 1px solid rgba($font1, 0.1);
  &:first-child { padding-top: 0; }
  &:last-child { border-bottom: none; }
  &:hover .title { color: $color1; }
}

.img {
  flex-shrink: 0;
  width: 260px;
  height: 164px;
  object-fit: cover;
  border-radius: 8px;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 2px 10px;
  background: rgba($color1, 0.12);
  color: $color1;
  font-family: "rssb";
  font-size: 12px;
  border-radius: 4px;
  text-transform: capitalize;
  align-self: flex-start;
}

.title {
  font-family: "rssb";
  font-size: 20px;
  font-weight: bold;
  line-height: 28px;
  color: $font1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.summary {
  font-size: 14px;
  line-height: 22px;
  color: rgba($font1, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.date {
  font-size: 12px;
  color: rgba($font1, 0.4);
  margin-top: auto;
}

@media screen and (max-width: 900px) {
  .img { width: 200px; height: 126px; }
  .title { font-size: 17px; line-height: 24px; }
}

@media screen and (max-width: 750px) {
  .card-row { gap: vw(24); padding: vw(32) 0; }
  .img { width: vw(240); height: vw(152); border-radius: vw(8); }
  .tag { font-size: vw(22); padding: vw(4) vw(12); }
  .title { font-size: vw(28); line-height: vw(40); }
  .summary { font-size: vw(24); line-height: vw(36); -webkit-line-clamp: 2; }
  .date { font-size: vw(22); }
}
</style>
