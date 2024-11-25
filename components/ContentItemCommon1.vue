<template>
  <CustomLink :to="to" class="item">
    <NuxtImg
      format="auto"
      fit="cover"
      width="218"
      height="218"
      :src="item.icon"
      :alt="item.name"
      class="icon"
      :loading="index < eager ? 'eager' : 'lazy'"
    />
    <div class="info">
      <p class="name">{{ item.name }}</p>
      <div class="rating">
        <div class="rating-star"> </div>
        {{ item.score.length == 1 ? item.score + ".0" : item.score || 4.6 }}
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
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 166px;
  border-radius: 16px;
  box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd,
    inset 0 0 0 rgba(131, 169, 196, 0.3), inset 0 0 0 #f8fdfd;
  transition: 0.1s;
}
.icon {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  margin: 16px 0 8px;
}
.info {
  width: calc(100% - 26px);
}
.name {
  width: 100%;
  color: $item-name;
  font-family: "sesb";
  height: 18px;
  line-height: 18px;
  @include ellipsis;
  text-align: center;
  transition: color 0.2s;
  margin-bottom: 2px;
}
.rating {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: $transparency-color;
  margin-top: 3px;
}
.rating-star {
  margin-right: 2px;
  width: 16px;
  height: 16px;
  @include bg("icon-star.png");
}
.item:hover {
  box-shadow: 0 0 0 rgba(131, 169, 196, 0.3), 0 0 0 #f8fdfd, inset -5px -5px 4px #f8fdfd,
    inset 5px 5px 4px rgba(131, 169, 196, 0.3);
}
.pc-hidden {
  display: none;
}
.m-hidden {
  display: flex;
}
@media screen and (max-width: 879px) {
  .item {
    display: flex;
    align-items: center;
    width: 100%;
    height: vw(282);
    border-radius: vw(32);
    border: unset;
  }
  .icon {
    width: vw(174);
    height: vw(174);
    border-radius: vw(24);
    margin: vw(12) 0 0 vw(0);
  }
  .info {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0 0 0 vw(16);
  }
  .name {
    width: 94%;
    font-size: vw(28);
    height: vw(38);
    line-height: vw(38);
    padding: 0;
    text-align: center;
    margin: vw(12) 0 0 0;
  }

  .rating {
    margin-top: vw(0);
    width: 98%;
    height: vw(34);
  }
  .rating-star {
    margin-right: vw(4);
    width: vw(32);
    height: vw(32);
  }
  .item:hover {
  }
  .m-hidden {
    display: none;
  }
  .pc-hidden {
    display: flex;
  }
}
</style>
