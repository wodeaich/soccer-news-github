<template>
  <div v-show="showBackToTop" ref="backToTopElement" class="btn-back-top" @click="scrollToTop">
    <i class="icon-back-top"></i
  ></div>
</template>

<script>
export default {
  data() {
    return {
      showBackToTop: false,
      lastButtonRect: null // 保存按钮的最新边界矩形数据
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const adsElements = document.querySelectorAll(".adsbygoogle");
      const backToTopElement = this.$refs.backToTopElement;

      if (backToTopElement && backToTopElement.getBoundingClientRect().height !== 0) {
        this.lastButtonRect = backToTopElement.getBoundingClientRect();
      }

      if (!this.lastButtonRect || !adsElements) {
        this.showBackToTop = window.scrollY > 300;
        return;
      }

      // 检查按钮是否与任何广告元素重叠
      let isOverlappingAnyAd = false;
      for (const adsElement of adsElements) {
        const adsRect = adsElement.getBoundingClientRect();
        // 有交集且广告元素高度不为0
        if (this.isOverlapping(this.lastButtonRect, adsRect) && adsRect.height !== 0) {
          isOverlappingAnyAd = true;
          break;
        }
      }

      this.showBackToTop = window.pageYOffset > 300 && !isOverlappingAnyAd;
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    /* 判断按钮是否与ads重叠 */
    isOverlapping(rect1, rect2) {
      return (
        rect1.bottom > rect2.top &&
        rect1.top < rect2.bottom &&
        rect1.left < rect2.right &&
        rect1.right > rect2.left
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-back-top {
  width: 50px;
  height: 50px;
  background: linear-gradient(180deg, #68dfc3 0%, #68addf 100%);
  border-radius: 50%;
  position: fixed;
  z-index: 500;
  bottom: 120px;
  right: 158px;
  cursor: pointer;
  @include center;
}
.icon-back-top {
  @include icon(24px, 24px, "icon-back-top.png");
}

@media screen and (max-width: 879px) {
  .btn-back-top {
    width: vw(100);
    height: vw(100);
    right: vw(50);
    bottom: vw(160);
  }
  .icon-back-top {
    width: vw(48);
    height: vw(48);
  }
}
.overlapping-ad {
  display: none !important;
}
</style>
