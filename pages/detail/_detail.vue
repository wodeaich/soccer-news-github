<template>
  <div class="bg">
    <div class="page-afs">
      <Afs-Header :lang="newInfo.language" />
      <article class="article">
        <h1 class="article-title">{{ newInfo.name }}</h1>
        <div class="news-detail">{{ newInfo.first_paragraph }}</div>
        <!-- <div id="relatedsearchesDivfeed1"> </div> -->
        <GoogleAd ad-slot="1437640172" class="ad-1" />
        <!-- <div class="read-more" :class="{ hide: readMore }" @click="readMore = true">
        {{ readMoreText[newInfo.language] }}
      </div> -->
        <NuxtImg
          format="auto"
          fit="cover"
          width="900"
          :src="newInfo.cover"
          :alt="newInfo.name"
          class="article-img"
          :class="{ show: readMore }"
          preload
        />
        <!-- eslint-disable vue/no-v-html -->
        <div class="news-detail" :class="{ show: readMore }" v-html="newInfo.content"></div>
        <!--eslint-enable-->
      </article>
      <Afs-Footer :lang="newInfo.language" />
      <AdLoading />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, params, env }) {
    const path = params.detail;
    const lastDashIndex = path.lastIndexOf("-");
    const id = path.substring(lastDashIndex + 1, path.length);

    const data = await $axios.$get("/api/article/detail", {
      params: {
        site_id: env.SITE_AFS,
        article_id: id
      }
    });
    data.content = data.content.replace(/<\/h4><p><br><br>|<br><br><\/p><h4>/g, (match) => {
      return match.includes("</h4><p>") ? "</h4><p>" : "</p><h4>";
    });
    return { newInfo: data };
  },
  data() {
    return {
      channelId: "",
      readMore: true,
      readMoreText: {
        en: "Read More>>",
        ja: "続きを読む>>",
        ko: "더 읽기>>",
        zh_TW: "閱讀更多>>",
        de: "Weiterlesen>>",
        pt: "Leia Mais>>", // 葡萄牙语
        es: "Leer Más>>", // 西班牙语
        fr: "Lire la suite>>", // 法语
        th: "อ่านเพิ่มเติม>>", // 泰语
        id: "Baca Selengkapnya>>" // 印度尼西亚语
      }
    };
  },
  head() {
    return {
      htmlAttrs: {
        lang: this.newInfo.language
      },
      title: this.newInfo.name + " - SoccerGameSelect",
      meta: [
        {
          hid: "description",
          name: "description",
          content: this.newInfo.first_paragraph
        },
        {
          hid: "keywords",
          name: "keywords",
          content: this.newInfo.terms
        },
        {
          hid: "og:title",
          property: "og:title",
          content: this.newInfo.name
        },
        {
          hid: "og:description",
          property: "og:description",
          content: this.newInfo.first_paragraph
        },
        {
          hid: "og:url",
          property: "og:url",
          content: `https://soccergameselect.com/detail/${this.newInfo.path}/`
        },
        {
          hid: "og:locale",
          property: "og:locale",
          content: this.newInfo.language
        },
        {
          hid: "og:image",
          property: "og:image",
          content: this.newInfo.cover
        },
        {
          hid: "og:type",
          property: "og:type",
          content: "article"
        }
      ]
    };
  },

  mounted: function () {
    // 获取 URL 查询参数
    const searchParams = new URLSearchParams(window.location.search);
    // AdSense 配置参数
    if (searchParams.has("channel")) {
      this.channelId = searchParams.get("channel");
    } else {
      this.channelId = this.newInfo.channel || "";
      console.log("channelId", this.channelId, this.newInfo);
      if (this.channelId !== "") {
        searchParams.set("channel", this.channelId);
        const newUrl = `${window.location.origin}${
          window.location.pathname
        }?${searchParams.toString()}`;
        window.history.replaceState({}, "", newUrl);
      }
    }
    let lastScrollTop = 0;
    let scrolledUpFromBottom = false;
    let flag1 = false;
    let flag2 = false;
    let flag3 = false;

    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // 判断用户是否向下滚动
      if (scrollTop > lastScrollTop) {
        scrolledUpFromBottom = false; // 如果用户向下滚动，重置标志
        if (flag1 === false) {
          // eslint-disable-next-line no-undef
          dataLayer.push({ event: "SCROLL_D" });
          flag1 = true;
        }
      }
      // 判断用户是否向上滚动
      else {
        if (scrollTop + windowHeight >= docHeight - 5) {
          // 加入小缓冲区以检测页面底部
          scrolledUpFromBottom = true;
        }

        if (scrolledUpFromBottom) {
          if (flag2 === false) {
            // eslint-disable-next-line no-undef
            dataLayer.push({ event: "SCROLL_BU" });
            flag2 = true;
          }
        } else if (flag3 === false) {
          // eslint-disable-next-line no-undef
          dataLayer.push({ event: "SCROLL_U" });
          flag3 = true;
        }
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // 处理移动设备或负滚动
    });
  }
};
</script>

<style lang="scss" scoped>
.article-img {
  width: 100%;
  margin-bottom: 1em;
}
.article {
  padding-bottom: 32px;
  border-bottom: 1px solid #ececee;
  min-height: calc(100vh - 72px - 56px - 64px);
}
.article-title {
  font-size: 26px;
  font-family: "rssb";
  font-weight: bold;
  line-height: 30px;
  margin-bottom: 24px;
}
.read-more {
  line-height: 4;
}
.hide {
  display: none;
  &.show {
    display: block;
  }
}
.ad-1 {
  margin: 32px 0 32px 0;
}
@media screen and (max-width: 750px) {
  .article {
    line-height: vw(38);
    padding-bottom: vw(32);
    border-bottom: vw(2) solid #ececee;
    min-height: calc(100vh - vw(304));
  }
  .article-title {
    font-size: vw(40);
    line-height: vw(56);
    margin-bottom: vw(32);
  }
  .article-desc {
    margin-bottom: vw(48);
  }
  .ad-1 {
    margin: vw(48) 0 vw(48) 0;
  }
}
</style>
