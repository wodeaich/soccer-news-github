<template>
  <CustomLink :to="to" class="item">
    <NuxtImg
      format="auto"
      fit="cover"
      width="148"
      height="148"
      :src="item.icon"
      :alt="item.name"
      class="icon"
      :loading="index < eager ? 'eager' : 'lazy'"
    />
    <div class="info">
      <div class="title">
        <div class="name">{{ item.name }}</div>
        <div class="rating">{{ item.score || 4.6 }}<i class="icon-rating"></i></div>
      </div>
    </div>
  </CustomLink>
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
    },
    eager: {
      type: Number,
      default: 0
    },
    to: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  height: 80px;
  display: flex;
  align-items: center;
  padding-left: 6px;
  padding-right: 10px;
  border-radius: 12px;
  transition: background 0.2s;
}
.info {
  width: calc(100% - 6px - 10px - 68px - 6px);
  height: 100%;
}
.icon {
  width: 68px;
  height: 68px;
  border-radius: 14px;
  // border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px;
  margin-right: 6px;
}
.title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}
.name {
  width: calc(100% - 30px);
  max-width: 220px;
  overflow: hidden;
  font-size: 14px;
  word-break: break-all;
  color: $item-name;
  font-family: "seb";
  height: 20px;
  line-height: 20px;
  transition: color 0.2s;
  @include ellipsis(1);
}
.desc {
  width: 100%;
  height: 36px;
  font-size: 12px;
  line-height: 16px;
  color: rgba($item-name, 0.6);
  @include ellipsis(2);
}
.rating {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: rgba($item-name, 0.6);
  margin-left: 10px;
}

.item:hover {
  background: #242424;
  .name {
    color: $font2;
  }
}
@media screen and (max-width: 879px) {
  .item {
    height: vw(148);
    padding-left: vw(18);
    padding-right: vw(18);
    border-radius: vw(16);
  }
  .info {
    width: calc(100% - vw(18) - vw(112));
    height: 100%;
  }
  .icon {
    width: vw(112);
    height: vw(112);
    border-radius: vw(18);
    // border: vw(2) solid rgba(65, 65, 76, 0.1);
    padding: vw(2);
    margin-right: vw(18);
  }
  .title {
    width: 100%;
    margin-top: vw(16);
  }
  .name {
    width: calc(100% - vw(58));
    font-size: vw(24);
    height: vw(36);
    line-height: vw(36);
  }
  .desc {
    width: 100%;
    height: vw(64);
    font-size: 12px;
    line-height: 16px;
    color: rgba($item-name, 0.6);
  }
  .rating {
    font-size: vw(24);
    height: vw(36);
    line-height: vw(36);
  }
}
</style>
