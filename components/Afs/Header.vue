<template>
  <header class="header">
    <div class="pc-hidden">
      <div class="icon-sidebar" @click="toggleSidebar"> </div>
      <Afs-Sidebar
        :is-open="isSidebarOpen"
        :nav-data="navData"
        :lang="lang"
        @close="closeSidebar"
      />
    </div>

    <Afs-CustomLink to="/" class="logo"></Afs-CustomLink>

    <div v-if="showInstallButton" class="pwa-download" @click="installPWA">
      <i class="icon-pwa"></i>
    </div>

    <div class="search-box">
      <input
        v-model="input"
        :placeholder="searchText[lang] || searchText[en]"
        class="search"
        name="search"
        ref="searchInput"
        @keyup.enter="search"
      />

      <i v-show="input != ''" class="icon-clear" @click="clear"></i>
      <i class="icon-search" @click="search"></i>
    </div>

    <div class="category"
      >{{ categoryText[lang] || categoryText[en] }}
      <ul class="dropdown">
        <li v-for="(item, i) in navData.list" :key="i">
          <Afs-CustomLink :to="`/category/${item.path}/`"
            >{{ i === 0 ? "Soccer Game Tips" : "Soccer Updates" }}
          </Afs-CustomLink>
        </li>
        <li>
          <Afs-CustomLink to="/games/" class="entrance"> Soccer Games </Afs-CustomLink>
        </li>
      </ul>
    </div>
  </header>
</template>

<script>
import { directive } from "vue-awesome-swiper";
import "swiper/css/swiper.min.css";
import { simulateAFSSearch, capitalizeFirstLetter } from "~/utils/utils";

export default {
  directives: {
    swiper: directive
  },
  props: {
    lang: {
      type: String,
      default: "en"
    }
  },
  data() {
    return {
      input: "",
      deferredPrompt: null,
      showInstallButton: false,
      isSidebarOpen: false,
      navData: this.$root.$options.navData || this.$navData,
      searchText: {
        en: "Search...",
        ja: "検索けんさく..."
      },
      swiperData: [],
      isShowSwiper: false,
      categoryText: {
        en: "Category",
        ja: "カテゴリ"
      }
    };
  },

  watch: {
    isSidebarOpen(newVal, oldVal) {
      if (newVal === true) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }
  },

  mounted() {
    this.input = this.$route.query.query || "";
    // 判断是否支持 PWA
    if ("serviceWorker" in navigator && "PushManager" in window) {
      if (window.deferredPrompt) {
        this.deferredPrompt = window.deferredPrompt;
        this.showInstallButton = true;
      } else {
        window.addEventListener("beforeinstallprompt", (e) => {
          e.preventDefault();
          this.deferredPrompt = e;
          this.showInstallButton = true;
        });
      }
    }
  },
  methods: {
    capitalizeFirstLetter,
    search() {
      if (this.input.length < 1) {
        this.$globalMethod.showNotification({
          message: "Please enter at least 1 characters",
          type: "warning"
        });
        return;
      }
      simulateAFSSearch(this.input);
    },
    installPWA() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(() => {
          this.deferredPrompt = null;
        });
      }
    },
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    closeSidebar() {
      this.isSidebarOpen = false;
    },
    clear() {
      this.input = "";
    }
  }
};
</script>
<style lang="scss">
// .home-page {
//   .header {
//     margin-bottom: 0 !important;
//   }
//   .search-box {
//     visibility: hidden;
//   }
// }
// @media screen and (max-width: 750px) {
//   .home-page {
//     .logo {
//       width: vw(226) !important;
//       background-image: url("~/assets/images/Afs/logo.png") !important;
//       position: absolute;
//       left: 50%;
//       top: 50%;
//       transform: translate(-50%, -50%);
//     }
//   }
// }
</style>
<style lang="scss" scoped>
.header {
  position: relative;
  @include center;
  max-width: 1200px;
  height: 72px;
  margin-bottom: 32px;
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
  width: 198px;
  height: 56px;
  @include bg("Afs/logo.png");
}
.pwa-download {
  position: absolute;
  width: 32px;
  height: 32px;
  background: rgba(104, 223, 195, 0.2);
  border-radius: 50%;
  right: 145px;
  @include center;
  color: $font2;
}
.icon-pwa {
  @include icon(20px, 20px, "Afs/icon-pwa.png");
}
.search-box {
  position: relative;
  flex: 1;
  height: 48px;
  // box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
  border: 1px solid $color1;
  border-radius: 88px 88px 88px 88px;
  margin: 0 169px;
  padding-left: 16px;
  padding-right: 120px;
}
.search {
  width: 100%;
  height: 100%;
  font-size: 14px;
  font-family: "rs";
  &::placeholder {
    font-family: "rs";
    color: rgba($font1, 0.4);
  }
}

.swiper-box {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  width: calc(100% - 120px);
  height: 100%;
  cursor: text;
}

.swiper-slide {
  width: 100%;
  height: 48px;
  line-height: 48px;
  padding-left: 16px;
  color: rgba($font1, 0.4);
  font-size: 14px;
  @include ellipsis;
}

.icon-clear {
  position: absolute;
  right: 80px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  background-image: url("~/assets/images/Afs/icon-clear.png");
  width: 16px;
  height: 16px;
  background-size: cover;
}
.icon-search {
  position: absolute;
  right: -1px;
  top: -1px;
  display: block;
  background: $color1;
  border-radius: 0 80px 80px 0;
  @include btn-img(64px, 48px, "Afs/icon-search-white.png");
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 32px 32px;
  margin: 0;
  // &::before {
  //   content: "";
  //   display: inline-block;
  //   width: 1px;
  //   height: 24px;
  //   background: rgba(#000, 0.1);
  //   position: absolute;
  //   left: 0;
  //   top: 50%;
  //   transform: translateY(-50%);
  // }
}

.category {
  height: 72px;
  line-height: 72px;
  font-family: "rssb";
  cursor: pointer;
  position: relative;
  z-index: 2;
  color: $font1;
}

.category:hover .dropdown,
.dropdown:hover {
  display: block;
}

.dropdown {
  display: none;
  position: absolute;
  top: 54px;
  right: 34px;
  transform: translateX(50%);
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.12);
  border-radius: 8px 8px 8px 8px;
  background: #fff;
  overflow: hidden;
  color: $font1;
}

.dropdown li {
  font-size: 16px;
  font-family: "rssb";
  line-height: 40px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  a {
    display: block;
    width: 100%;
    height: 100%;
    padding: 0 16px;
  }
}

.dropdown li:hover {
  background: rgba($color1, 0.2);
  color: $color1;
}

.entrance {
  margin: 0;
}

@media screen and (max-width: 1100px) {
  .search-box {
    margin: 0 50px 0 80px;
  }
  .category {
    width: auto;
    .dropdown {
      top: 64px;
      right: 0;
      transform: none;
    }
  }
}
@media screen and (max-width: 750px) {
  .header {
    width: 100%;
    padding: 0;
    max-width: 100vw;
    height: vw(96);
    margin-bottom: vw(48);
    justify-content: flex-start;
  }
  .category {
    display: none;
  }
  .logo {
    width: vw(86);
    height: vw(86);
    @include bg("Afs/logo2.png");
    margin-right: vw(48);
  }
  .pwa-download {
    display: none;
  }

  .icon-sidebar {
    @include icon(vw(48), vw(48), "icon-sidebar.png");
    cursor: pointer;
  }
  .pc-hidden {
    margin-right: vw(48);
  }
  .search-box {
    max-width: vw(450);
    height: vw(64);
    // box-shadow: inset 5px 5px 4px 0px rgba(131, 169, 196, 0.3), inset -5px -5px 4px 0px #f8fdfd;
    border-radius: vw(32);
    margin: 0;
    padding-left: vw(32);
    padding-right: vw(130);
  }
  .search {
    height: 100%;
    font-size: vw(28);
    font-family: "rssb";
    &::placeholder {
      font-family: "rs";
      color: rgba($font1, 0.4);
    }
  }
  .swiper-box {
    width: calc(100% - vw(130));
  }

  .swiper-slide {
    height: vw(64);
    line-height: vw(64);
    padding-left: vw(32);
    font-size: vw(28);
  }
  .icon-clear {
    position: absolute;
    right: vw(100);
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    background-image: url("~/assets/images/Afs/icon-clear.png");
    width: vw(28);
    height: vw(28);
    background-size: cover;
  }
  .icon-search {
    position: absolute;
    right: vw(-2);
    top: vw(-2);
    display: block;
    border-radius: 0 vw(32) vw(32) 0;
    @include btn-img(vw(80), vw(64), "Afs/icon-search-white.png");
    background-size: vw(48) vw(48);
    &::before {
      width: vw(2);
      height: vw(32);
    }
  }
}
</style>
