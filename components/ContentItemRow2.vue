<template>
  <CustomLink :to="to" class="item">
    <NuxtImg
      format="auto"
      fit="cover"
      width="230"
      height="230"
      :src="item.icon"
      :alt="item.name"
      class="icon"
      :loading="index < eager ? 'eager' : 'lazy'"
    />
    <div class="info">
      <div class="name">{{ item.name }}</div>
      <div class="rating">
        <div class="rating-star"> </div>
        {{ item.score.length == 1 ? item.score + ".0" : item.score || 4.6 }}
      </div>
    </div>
    <div class="arrow-right"></div>
  </CustomLink>
</template>

<script>
import { getStarListStyle } from "~/utils/utils";
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    eager: {
      type: Number,
      default: 0
    },
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    getStarListStyle
  }
};
</script>

<style lang="scss" scoped>
.item {
  height: 120px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 24px;
  box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd,
    inset 0 0 0 rgba(131, 169, 196, 0.3), inset 0 0 0 #f8fdfd;
  transition: 0.1s;
}
.info {
  width: calc(100% - 10px - 100px - 46px);
  height: 100%;
}
.icon {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  margin-right: 10px;
}
.name {
  margin-top: 32px;
  width: 100%;
  overflow: hidden;
  font-size: 18px;
  word-break: break-all;
  color: $item-name;
  font-family: "seb";
  line-height: 21px;
  transition: color 0.2s;
  @include ellipsis(1);
}
.rating {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: $transparency-color;
  margin-top: 16px;
}
.rating-star {
  margin-right: 2px;
  width: 16px;
  height: 16px;
  @include bg("icon-star.png");
}
.arrow-right {
  @include icon(24px, 24px, "icon-arrow-right.png");
  margin-left: 16px;
}
.item:hover {
  box-shadow: 0 0 0 rgba(131, 169, 196, 0.3), 0 0 0 #f8fdfd, inset -5px -5px 4px #f8fdfd,
    inset 5px 5px 4px rgba(131, 169, 196, 0.3);
  .arrow-right {
    @include icon(24px, 24px, "icon-arrow-right-hover.png");
  }
}
@media screen and (max-width: 879px) {
  .item {
    flex-direction: column;
    height: vw(394);
    padding-left: vw(16);
    padding-right: vw(16);
    border-radius: vw(32);
  }
  .info {
    padding: 0 vw(2);
    margin-top: vw(16);
    width: 100%;
    height: 100%;
  }
  .icon {
    width: vw(248);
    height: vw(248);
    border-radius: vw(24);
    // border: vw(2) solid rgba(255, 255, 255, 0.1);
    margin-right: 0;
    margin-top: vw(32);
  }
  .name {
    text-align: center;
    width: 100%;
    font-size: vw(28);
    height: vw(38);
    line-height: vw(38);
    margin-top: vw(0);
  }
  .rating {
    width: 100%;
    font-size: vw(24);
    height: vw(36);
    line-height: vw(36);
    margin-top: vw(6);
    justify-content: center;
  }
  .rating-star {
    margin-right: vw(4);
    width: vw(32);
    height: vw(32);
  }
  .arrow-right {
    display: none;
  }
  .item:hover {
    .arrow-right {
      display: none;
    }
  }
}
</style>
