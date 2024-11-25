<template>
  <nav class="breadcrumb">
    <i class="icon-breadcrumb"></i>
    <CustomLink to="/">Home</CustomLink>
    <span>></span>
    <b class="active">{{ name }}</b>
  </nav>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
      default: "Page"
    }
  }
};
</script>

<style lang="scss" scoped>
.icon-breadcrumb {
  @include icon(24px, 24px, "icon-breadcrumb.png");
  margin-right: 8px;
}
.breadcrumb {
  width: fit-content;
  height: 40px;
  display: flex;
  align-items: center;
  color: rgba($item-name, 0.6);
  box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd;
  border-radius: 20px;
  margin: 32px 0 32px 0;
  padding: 0 16px;
  span {
    margin-left: 8px;
    margin-right: 8px;
  }
  .active {
    color: $item-name;
    font-family: "sesb";
  }
}
@media screen and (max-width: 879px) {
  .breadcrumb {
    display: none;
  }
}
</style>
