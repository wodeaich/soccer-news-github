<template>
  <Afs-CustomLink class="news-style-2" :to="`/detail/${item.path}/`">
    <NuxtImg
      format="auto"
      fit="cover"
      width="658"
      height="440"
      :src="item.cover"
      :alt="item.name"
      loading="lazy"
      class="img m-hidden"
    />
    <NuxtImg
      format="auto"
      fit="cover"
      :width="index % 5 === 0 ? '658' : '240'"
      :height="index % 5 === 0 ? '440' : '240'"
      :src="item.cover"
      :alt="item.name"
      loading="lazy"
      class="img pc-hidden"
    />
    <div class="title-box">
      <p class="title">{{ item.name }}</p>
    </div>
    <p class="desc">{{ item.first_paragraph }}</p>
  </Afs-CustomLink>
</template>

<script>
import { capitalizeFirstLetter } from "~/utils/utils";
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
  },
  methods: {
    capitalizeFirstLetter
  }
};
</script>

<style lang="scss">
.news-style-2 {
  padding-right: 16px;
  .img {
    width: 240px;
    height: 160px;
    border-radius: 8px 8px 8px 8px;
    float: left;
    margin-right: 16px;
  }

  .title-box {
    margin-top: 10px;
  }
  .title {
    font-size: 26px;
    font-family: "rssb";
    line-height: 36px;
    @include ellipsis(2);
  }

  .desc {
    font-family: "rs";
    margin-top: 8px;
    font-size: 14px;
    color: rgba(65, 65, 76, 0.6);
    line-height: 20px;
    @include ellipsis(3);
  }

  .pc-hidden {
    display: none;
  }

  .m-hidden {
    display: block;
  }
}
@media screen and (max-width: 1100px) {
  .news-style-2 {
    width: 100%;
  }
}
@media screen and (max-width: 750px) {
  .news-style-2 {
    display: flex;
    padding-right: 0;
    // padding-bottom: vw(32);

    .img {
      width: vw(196);
      height: vw(196);
      border-radius: vw(16);
      float: unset;
      margin-right: 0;
    }

    .title-box {
      margin: vw(20) 0 0 vw(32);
      height: vw(208);
      border-bottom: vw(2) solid rgba($font1, 0.1);
    }

    .title {
      font-size: vw(36);
      line-height: vw(50);
      height: fit-content;
      @include ellipsis(3);
    }
    .desc {
      display: none;
    }

    .pc-hidden {
      display: block;
    }

    .m-hidden {
      display: none;
    }
  }
}
</style>
