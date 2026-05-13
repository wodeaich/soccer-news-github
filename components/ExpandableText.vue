<template>
  <div class="expandable-text" :class="{ 'is-expanded': expanded }">
    <div class="text-content">
      {{ text }}
    </div>
    <button class="toggle-button" @click="toggleExpand">
      {{ expanded ? "Show Less" : "Show More" }}<i class="icon-more"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      expanded: false
    };
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    }
  }
};
</script>

<style lang="scss" scoped>
.expandable-text {
  position: relative;
  text-align: center;
}

.text-content {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  box-orient: vertical;
  height: 2.5em;
  transition: height 0.3s ease;
  line-height: 1.2;
  color: rgba($item-name, 0.6);
  text-align: left;
}

.toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: rgba($item-name, 0.6);
  font-family: "sesb";
  margin-top: 1em;
}
.icon-more {
  @include icon(14px, 14px, "icon-more.png");
  margin-left: 8px;
  transform: translateY(2px);
}
.is-expanded {
  .text-content {
    height: auto;
    -webkit-line-clamp: unset;
    line-clamp: unset;
    box-orient: unset;
  }
  .icon-more {
    transform: translateY(3px) rotate(180deg);
  }
}
@media screen and (max-width: 879px) {
  .expandable-text {
    padding: vw(32);
    border-radius: vw(32);
    font-size: vw(24);
    box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
  }
  .toggle-button {
    font-size: vw(24);
  }
  .icon-more {
    width: vw(28);
    height: vw(28);
    transform: translateY(vw(4));
  }
  .is-expanded {
    .icon-more {
      transform: translateY(vw(6)) rotate(180deg);
    }
  }
}
</style>
