<template>
  <div v-show="loading" id="ad-loading" class="mask-loading">
    <Loading />
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      timer: null,
      mutationObserver: null
    };
  },
  mounted() {
    this.startLoadingTimeout();
    this.observeMutations();
  },
  methods: {
    startLoadingTimeout() {
      this.timer = setTimeout(() => {
        this.loading = false;
        this.cleanUp();
      }, 2600);
    },
    observeMutations() {
      const existingInsNodes = document.querySelectorAll("ins.adsbygoogle");
      if (existingInsNodes.length > 0) {
        this.loading = false;
        this.cleanUp();
      } else {
        this.mutationObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.target.matches("ins.adsbygoogle")) {
              this.loading = false;
              this.cleanUp();
            }
          });
        });

        this.mutationObserver.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
    },
    cleanUp() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.mutationObserver) {
        this.mutationObserver.disconnect();
        this.mutationObserver = null;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.mask-loading {
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100001;
}
</style>
