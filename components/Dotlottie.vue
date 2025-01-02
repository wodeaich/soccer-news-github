<template>
  <CustomLink to="/landing/" class="btn-landing">
    <dotlottie-player
      autoplay
      loop
      mode="normal"
      src="/landing.lottie"
      class="lottie"
      data-bm-renderer="svg"
    ></dotlottie-player>
  </CustomLink>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.btn-landing {
  display: none;
}
@media screen and (max-width: 750px) {
  .btn-landing {
    display: block;
    position: fixed;
    z-index: 500;
    bottom: vw(280);
    right: vw(-46);
    cursor: pointer;
  }
  .lottie {
    width: vw(260);
    height: vw(260);
  }
}
</style>
