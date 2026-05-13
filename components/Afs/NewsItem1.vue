<template>
  <Afs-CustomLink class="item" :to="`/detail/${item.path}/`">
    <NuxtImg
      format="auto"
      fit="cover"
      :width="index === 0 ? '658' : '480'"
      :height="index === 0 ? '400' : '304'"
      :src="item.cover"
      :alt="item.name"
      loading="lazy"
      class="img"
    />
    <p class="title">{{ item.name }}</p>
  </Afs-CustomLink>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  position: relative;
}

.img {
  width: 100%;
  height: 100%;
  border-radius: 8px 8px 8px 8px;
}
.title {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 16px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
  border-radius: 0 0 8px 8px;

  font-size: 26px;
  font-family: "rssb";
  line-height: 30px;
  height: 60px;
  color: #fff;
  @include ellipsis;
}
@media screen and (max-width: 750px) {
  .item {
    height: vw(400);
  }
  .img {
    width: 100%;
    height: 100%;
    border-radius: vw(16);
  }
  .title {
    border-radius: 0 0 vw(16) vw(16);

    font-size: vw(36);
    line-height: vw(52);
    width: 100%;
    height: vw(120);
    @include ellipsis(2);
    white-space: unset;
    padding: vw(8) vw(16);
  }
}
</style>
