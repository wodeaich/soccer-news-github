<template>
  <header class="header">
    <!-- logo -->
    <CustomLink to="/" class="logo"></CustomLink>

    <div class="pc-menu">
      <!-- 下载到桌面 -->
      <div class="pc-pwa" v-if="showInstallButton" @click="installPWA">
        <i class="icon-pc-pwa"></i>TO DESKTOP
      </div>

      <!-- pc 搜索 -->
      <CustomLink class="pc-search" to="/search/">
        <i class="icon-search" @click="search"></i>Search</CustomLink
      >
    </div>

    <!-- 下载到桌面 -->
    <div class="pwa-download" v-if="showInstallButton" @click="installPWA">
      <i class="icon-pwa"></i>
    </div>

    <!-- 移动 搜索 -->
    <CustomLink class="m-search" to="/search/"></CustomLink>
  </header>
</template>

<script>
import { simulateSearch } from "~/utils/utils";

export default {
  data() {
    return {
      input: "",
      deferredPrompt: null,
      showInstallButton: false
    };
  },
  props: {
    currentPath: {
      type: String,
      required: true
    }
  },
  mounted() {
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
    search() {
      if (this.input.length < 2) {
        this.$globalMethod.showNotification({
          message: "Please enter at least 2 characters",
          type: "warning"
        });
        return;
      }
      simulateSearch(this.input);
    },
    installPWA() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(() => {
          this.deferredPrompt = null;
        });
      }
    },
    randomGame() {
      const links = document.querySelectorAll('a[href*="/game"]');
      const randomIndex = Math.floor(Math.random() * links.length);
      const randomLink = links[randomIndex];
      randomLink.click();
    }
  }
};
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  position: relative;
  z-index: 1;
  background: $bg;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 99.2vw;
    height: 100%;
    box-shadow: 0px 5px 4px 0px rgba(131, 169, 196, 0.3);
    background: $bg;
    z-index: -1;
  }
}
.logo {
  @include btn-img(220px, 56px, "logo.png");
}
.pc-menu {
  width: 338px;
  display: flex;
  justify-content: end;
}
.pc-pwa {
  display: flex;
  background: $bg;
  width: 152px;
  height: 40px;
  border-radius: 50px;
  align-items: center;
  justify-content: center;
  box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
  border: 1px solid #68dfc3;
  font-family: seb;
  font-size: 14px;
  line-height: 16px;
  color: #68dfc3;
  cursor: pointer;
}
.pwa-download {
  display: none;
}

.pc-search {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  line-height: 16px;
  width: 152px;
  height: 40px;
  background: #68dfc3;
  border-radius: 50px;
  font-family: seb;
  color: #ffffff;
  box-shadow: 3px 3px 3px 0px rgba(131, 169, 196, 0.3), -3px -3px 3px 0px #f8fdfd;
  margin-left: 32px;
  cursor: pointer;
}

.m-search {
  display: none;
}
@media screen and (max-width: 879px) {
  .header {
    width: 100%;
    position: fixed;
    justify-content: space-between;
    top: 0;
    height: vw(96);
    padding: 0 vw(46);
    z-index: 10;
    box-shadow: 5px 5px 4px 0px rgba(131, 169, 196, 0.3), -5px -5px 4px 0px #f8fdfd;
    &:before {
      display: none;
    }
  }
  .pc-menu {
    display: none;
  }
  .logo {
    @include btn-img(vw(312), vw(80), "logo-text.png");
    background-size: 100% 100%;
  }
  .icon-logo {
    width: vw(55);
    height: vw(55);
    margin-right: auto;
  }

  .pwa-download {
    @include center;
    background: $font2;
    border-radius: 50%;
    cursor: pointer;
    width: vw(48);
    height: vw(48);
    background: unset;
    margin-left: auto;
    span {
      display: none;
    }
  }

  .icon-pwa {
    @include icon(vw(48), vw(48), "icon-download.png");
    background-repeat: no-repeat;
    background-position: center;
    margin-right: 0;
    border-radius: 50%;
  }
  .pc-search {
    display: none;
  }
  .m-search {
    display: block;
    @include icon(vw(48), vw(48), "icon-search2.png");
    margin-left: vw(52);
  }
}
</style>
