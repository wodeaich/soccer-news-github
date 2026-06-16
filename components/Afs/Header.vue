<template>
  <header class="header">
    <!-- 文字 LOGO（品牌 CompSoccer） -->
    <Afs-CustomLink to="/" class="logo">CompSoccer</Afs-CustomLink>

    <!-- 导航菜单 -->
    <nav class="nav-menu">
      <nuxt-link :to="localePath('/news/')" class="nav-item">{{ $t('nav.news') }}</nuxt-link>
      <nuxt-link :to="localePath('/schedule/')" class="nav-item">{{ $t('nav.schedule') }}</nuxt-link>
      <nuxt-link :to="localePath('/results/')" class="nav-item">{{ $t('nav.results') }}</nuxt-link>
      <nuxt-link :to="localePath('/standings/')" class="nav-item">{{ $t('nav.standings') }}</nuxt-link>
      <nuxt-link :to="localePath('/live-tv/')" class="nav-item">{{ $t('nav.liveTV') }}</nuxt-link>
    </nav>

    <!-- 语言切换器 -->
    <div class="lang-switcher">
      <span class="lang-current">{{ currentLocaleName }}</span>
      <ul class="lang-dropdown">
        <li v-for="locale in availableLocales" :key="locale.code">
          <span @click="switchLang(locale.code)">{{ locale.name }}</span>
        </li>
      </ul>
    </div>
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
  computed: {
    availableLocales() {
      return this.$i18n.locales
    },
    currentLocaleName() {
      const current = this.$i18n.locales.find(l => l.code === this.$i18n.locale)
      return current ? current.name : 'EN'
    }
  },
  methods: {
    switchLang(code) {
      document.cookie = `preferred_lang=${code}; path=/; max-age=${60 * 60 * 24 * 365}`
      this.$router.push(this.switchLocalePath(code))
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  height: 72px;
  // 与下方 .container（max-width:1200 + padding:0 24）对齐：水平居中并留出同样内边距
  margin: 0 auto 32px;
  padding: 0 24px;
  box-sizing: border-box;
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: -1;
    width: 100vw;
    height: 100%;
    box-shadow: 0px 5px 4px 0px rgba(131, 169, 196, 0.3);
    transform: translateX(-50%);
    left: 50%;
  }
}
.logo {
  flex-shrink: 0;
  font-family: "rssb";
  font-size: 26px;
  font-weight: bold;
  color: $color1;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  margin: 0 32px;
}
.nav-item {
  font-family: "rssb";
  font-size: 14px;
  color: $font1;
  white-space: nowrap;
  &:hover, &.nuxt-link-active {
    color: $color1;
  }
}
.lang-switcher {
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  z-index: 10;
}
.lang-current {
  font-family: "rssb";
  font-size: 14px;
  color: $font1;
  padding: 6px 12px;
  border: 1px solid $color1;
  border-radius: 20px;
  &:hover { color: $color1; }
}
.lang-switcher:hover .lang-dropdown,
.lang-dropdown:hover {
  display: block;
}
.lang-dropdown {
  display: none;
  position: absolute;
  top: 36px;
  right: 0;
  background: #fff;
  box-shadow: 0px 4px 12px 0px rgba(0,0,0,0.12);
  border-radius: 8px;
  overflow: hidden;
  min-width: 120px;
  li {
    span {
      display: block;
      padding: 8px 16px;
      font-size: 14px;
      font-family: "rssb";
      color: $font1;
      white-space: nowrap;
      cursor: pointer;
      &:hover { background: rgba($color1, 0.1); color: $color1; }
    }
  }
}

@media screen and (max-width: 1100px) {
  .nav-menu {
    margin: 0 20px;
    gap: 16px;
  }
}

@media screen and (max-width: 750px) {
  .header {
    width: 100%;
    max-width: 100vw;
    height: vw(96);
    margin-bottom: vw(48);
    padding: 0 vw(24);
    justify-content: flex-start;
    gap: vw(24);
  }
  .logo {
    font-size: vw(40);
  }
  // 导航横向滚动、左对齐、缩小字号，保证语言按钮始终可见
  .nav-menu {
    flex: 1;
    min-width: 0;
    gap: vw(28);
    margin: 0;
    justify-content: flex-start;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar { display: none; }
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
    min-width: vw(180);
    li span {
      font-size: vw(26);
      padding: vw(16) vw(24);
    }
  }
}
</style>
