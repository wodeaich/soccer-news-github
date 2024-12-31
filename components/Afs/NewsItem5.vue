<template>
  <Afs-CustomLink class="item" :to="`/detail/${item.path}/`">
    <NuxtImg
      format="auto"
      fit="cover"
      width="658"
      height="400"
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
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.img {
  width: 100%;
  height: 76%;
  border-radius: 8px 8px 8px 8px;
}
.title {
  width: 100%;
  font-size: 26px;
  font-family: "rssb";
  line-height: 36px;
  height: 72px;
  color: $font1;
  text-align: left;
  margin-top: 8px;
  @include ellipsis(2);
}
@media screen and (max-width: 750px) {
  .item {
    position: relative;
    border-bottom: vw(2) solid rgba($font1, 0.1);
  }
  .img {
    width: 100%;
    height: vw(400);
    border-radius: vw(16);
  }
  .title {
    position: absolute;
    bottom: 0;
    @include center;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%);
    font-size: vw(36);
    line-height: vw(52);
    width: 100%;
    height: vw(120);
    color: #fff;
    border-radius: 0 0 vw(16) vw(16);
    padding: vw(8) vw(16);
    // margin: vw(16) 0 vw(32);
    @include ellipsis(2);
  }
}
</style>
