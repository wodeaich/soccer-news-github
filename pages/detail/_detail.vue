<template>
  <div class="bg">
    <div class="page-afs">
      <Afs-Header :lang="newInfo.language" />
      <article class="article">
        <h1 class="article-title">{{ newInfo.name }}</h1>
        <adm-slot-preload
          class="ad-box"
          adm-id="detail-afs-1"
          adm-unit="/23197833490/soccerins/soccerins_detail_afs0"
          ads-slot="5287911342"
        />
        <NuxtImg
          format="auto"
          fit="cover"
          width="900"
          :src="newInfo.cover"
          :alt="newInfo.name"
          class="article-img"
          preload
        />
        <div class="news-detail">{{ newInfo.first_paragraph }}</div>

        <adm-slot-full
          class="ad-box"
          adm-id="detail-full"
          adm-unit="/23197833490/soccerins/soccerins_detail_full"
          ads-slot="2677786806"
        />

        <Afs-ArticleWithAdm :class="{ show: readMore }" :content="newInfo.content" />
        <!--eslint-enable-->
      </article>
      <Afs-Footer :lang="newInfo.language" />
    </div>
    <Dotlottie />
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
      readMore: true
    };
  },
  head() {
    return {
      htmlAttrs: {
        lang: this.newInfo.language
      },
      title: this.newInfo.name + " - SoccerIns",
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
          content: `https://compsoccer.com/detail/${this.newInfo.path}/`
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
::v-deep .ad-box {
  margin-bottom: 32px;
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
  ::v-deep .ad-box {
    width: 100vw;
    margin-bottom: vw(48);
    margin-left: vw(-46);
  }
}
</style>
