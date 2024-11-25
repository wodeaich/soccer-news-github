<template>
  <div class="fixed-bottom" id="fixed-bottom" v-if="loading"></div>
</template>

<script>
export default {
  data() {
    return {
      loading: true
    };
  },
  mounted() {
    setTimeout(() => {
      this.loading = false;
    }, 2600);

    const _this = this;
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          if (
            mutation.target.matches("ins.adsbygoogle") &&
            mutation.attributeName === "data-vignette-loaded"
          ) {
            const value = mutation.target.getAttribute("data-vignette-loaded");
            if (value === "true") {
              _this.loading = false;
              mutationObserver.disconnect();
            }
          }
        }
      });
    });

    mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-vignette-loaded"]
    });
  }
};
</script>

<style>
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background-color: transparent;
}
</style>
