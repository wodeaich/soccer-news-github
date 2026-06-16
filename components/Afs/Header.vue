<template>
  <header class="header">
    <!-- 第一行：LOGO + 语言切换 -->
    <div class="header-top">
      <Afs-CustomLink to="/" class="logo">CompSoccer</Afs-CustomLink>

      <!-- 语言切换器：点击展开，再次点击语言即切换 -->
      <div ref="langSwitcher" class="lang-switcher" :class="{ open: langOpen }">
        <span class="lang-current" @click.stop="toggleLang">
          {{ currentLocaleName }}
          <i class="caret"></i>
        </span>
        <ul v-show="langOpen" class="lang-dropdown">
          <li
            v-for="locale in availableLocales"
            :key="locale.code"
            :class="{ active: locale.code === $i18n.locale }"
          >
            <span @click="switchLang(locale.code)">{{ locale.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- 第二行：导航菜单（完整展示，不截断） -->
    <nav class="nav-menu">
      <nuxt-link :to="localePath('/news/')" class="nav-item">{{ $t('nav.news') }}</nuxt-link>
      <nuxt-link :to="localePath('/schedule/')" class="nav-item">{{ $t('nav.schedule') }}</nuxt-link>
      <nuxt-link :to="localePath('/results/')" class="nav-item">{{ $t('nav.results') }}</nuxt-link>
      <nuxt-link :to="localePath('/standings/')" class="nav-item">{{ $t('nav.standings') }}</nuxt-link>
      <nuxt-link :to="localePath('/live-tv/')" class="nav-item">{{ $t('nav.liveTV') }}</nuxt-link>
    </nav>
  </header>
</template>

<script>
export default {
  props: {
    lang: {
      type: String,
      default: "en"
    }
  },
  data() {
    return {
      langOpen: false
    };
  },
  computed: {
    availableLocales() {
      return this.$i18n.locales;
    },
    currentLocaleName() {
      const current = this.$i18n.locales.find((l) => l.code === this.$i18n.locale);
      return current ? current.name : "EN";
    }
  },
  mounted() {
    document.addEventListener("click", this.onDocClick);
  },
  beforeDestroy() {
    document.removeEventListener("click", this.onDocClick);
  },
  methods: {
    toggleLang() {
      this.langOpen = !this.langOpen;
    },
    onDocClick(e) {
      const el = this.$refs.langSwitcher;
      if (el && !el.contains(e.target)) {
        this.langOpen = false;
      }
    },
    switchLang(code) {
      this.langOpen = false;
      if (code === this.$i18n.locale) return;
      document.cookie = `preferred_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
      this.$router.push(this.switchLocalePath(code));
    }
  }
};
</script>

<style lang="scss" scoped>
// 两行布局：第一行 LOGO + 语言，第二行完整导航
.header {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 24px;
  padding: 0 24px;
  box-sizing: border-box;
  // 底部阴影延伸到全宽（视觉分隔线）
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 100%;
    box-shadow: 0px 5px 4px 0px rgba(131, 169, 196, 0.3);
    z-index: -1;
  }
}

// 第一行
.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}

.logo {
  font-family: "rssb";
  font-size: 22px;
  font-weight: bold;
  color: $color1;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

// 第二行：导航
.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 40px;
  border-top: 1px solid rgba($color1, 0.15);
}

.nav-item {
  font-family: "rssb";
  font-size: 14px;
  color: $font1;
  white-space: nowrap;
  &:hover,
  &.nuxt-link-active {
    color: $color1;
  }
}

// 语言切换
.lang-switcher {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  z-index: 10;
}
.lang-current {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: "rssb";
  font-size: 14px;
  color: $font1;
  padding: 5px 12px;
  border: 1px solid $color1;
  border-radius: 20px;
  user-select: none;
  &:hover {
    color: $color1;
  }
}
.caret {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  transition: transform 0.2s;
}
.lang-switcher.open .caret {
  transform: rotate(180deg);
}
.lang-dropdown {
  position: absolute;
  top: 38px;
  right: 0;
  background: #fff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  overflow: hidden;
  min-width: 130px;
  max-height: 60vh;
  overflow-y: auto;
  li {
    &.active span {
      color: $color1;
      font-weight: bold;
    }
    span {
      display: block;
      padding: 8px 16px;
      font-size: 14px;
      font-family: "rssb";
      color: $font1;
      white-space: nowrap;
      cursor: pointer;
      &:hover {
        background: rgba($color1, 0.1);
        color: $color1;
      }
    }
  }
}

// 移动端
@media screen and (max-width: 750px) {
  .header {
    max-width: 100vw;
    margin-bottom: vw(24);
    padding: 0 vw(24);
  }
  .header-top {
    height: vw(80);
  }
  .logo {
    font-size: vw(36);
  }
  .nav-menu {
    height: vw(60);
    gap: vw(36);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .nav-item {
    flex-shrink: 0;
    font-size: vw(26);
  }
  .lang-current {
    font-size: vw(24);
    padding: vw(8) vw(18);
    border-radius: vw(28);
  }
  .lang-dropdown {
    top: vw(56);
    min-width: vw(190);
    li span {
      font-size: vw(26);
      padding: vw(16) vw(24);
    }
  }
}
</style>
