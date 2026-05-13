<template>
  <a id="link-outside" :href="item.target_url" class="head-bg">
    <NuxtImg
      format="auto"
      fit="cover"
      width="1280"
      height="440"
      :src="item.pc_img"
      :alt="item.name"
      preloader
      class="pc-hidden"
    />
    <NuxtImg
      format="auto"
      fit="cover"
      width="750"
      height="358"
      :src="item.mobile_img"
      :alt="item.name"
      preloader
      class="m-hidden"
    />
    <div class="play-now">PLAY NOW<i /></div>
  </a>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.head-bg {
  display: block;
  position: relative;
  transform: translateX(-8.3%);
  width: 120%;
  height: 488px;
  img {
    width: 100%;
    height: 100%;
  }
}
.play-now {
  width: 180px;
  height: 40px;
  border-radius: 70px;
  outline: 4px solid rgba(255, 255, 255, 0.6);
  background: $btn-bg;
  position: absolute;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  font-family: seb;
  font-size: 20px;
  color: #ffffff;
  line-height: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    @include icon(40px, 40px, "icon-foot.png");
    margin-left: 4px;
  }
}
.m-hidden {
  display: none;
}
.pc-hidden {
  display: block;
}
@media screen and (min-width: 879px) and (max-width: 1445px) {
  .head-bg {
    transform: translateX(0);
    height: 408px;
    width: 100%;
  }
}
@media screen and (min-width: 879px) and (max-width: 1275px) {
  .head-bg {
    height: vw2(408);
  }
}

@media screen and (max-width: 879px) {
  .head-bg {
    transform: translateX(0);
    width: 100%;
    height: vw(350);
  }
  .play-now {
    width: vw(210);
    height: vw(48);
    border-radius: vw(140);
    outline: 2px solid rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.4);
    left: unset;
    right: vw(46);
    bottom: vw(16);
    transform: translateX(0);
    font-size: vw(24);
    color: #41414c;
    line-height: vw(32);
    i {
      @include icon(vw(32), vw(32), "icon-seemore.png");
      margin-left: vw(4);
    }
  }
  .pc-hidden {
    display: none;
  }
  .m-hidden {
    display: block;
  }
}
</style>
