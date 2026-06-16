<template>
  <header class="header">
    <!-- 文字 LOGO（品牌 CompSoccer），与 Afs/Header 保持一致；移除旧站 SoccerIns 图标与搜索框 -->
    <CustomLink to="/" class="logo">CompSoccer</CustomLink>
  </header>
</template>

<script>
export default {
  props: {
    currentPath: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  height: 72px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  background: $bg;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 100%;
    box-shadow: 0px 5px 4px 0px rgba(131, 169, 196, 0.3);
    background: $bg;
    z-index: -1;
  }
}
.logo {
  flex-shrink: 0;
  font-family: "rssb";
  font-size: 20px;
  font-weight: bold;
  color: $color1;
  white-space: nowrap;
  letter-spacing: 0.5px;
}
@media screen and (max-width: 879px) {
  .header {
    position: fixed;
    top: 0;
    height: vw(96);
    padding: 0 vw(46);
    z-index: 10;
    box-shadow:
      5px 5px 4px 0px rgba(131, 169, 196, 0.3),
      -5px -5px 4px 0px #f8fdfd;
    &:before {
      display: none;
    }
  }
  .logo {
    font-size: vw(32);
  }
}
</style>
