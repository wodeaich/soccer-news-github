import TerserPlugin from "terser-webpack-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";

export default {
  target: "static",
  server: {
    host: "0.0.0.0"
  },
  env: {
    SITE_ID: process.env.SITE_ID,
    SITE_AFS: process.env.SITE_AFS
  },
  generate: {
    crawler: false,
    concurrency: 10,
    interval: 100,
    async routes() {
      const postsData = await fetch(
        `${process.env.PROD_API_URL}/api/game/get_all_path_v2?site_id=${process.env.SITE_ID}`
      );
      const afsData = await fetch(
        `${process.env.PROD_API_URL}/api/article/get_all_path?site_id=${process.env.SITE_AFS}`
      );
      const posts = await postsData.json();
      const afs = await afsData.json();
      // const gameCategoryPaths = posts.data.game_category.map((item) => `/category/${item}`);
      // const appCategoryPaths = posts.data.app_category.map((item) => `/category/${item}`);
      const gameDetailPaths = posts.data.game_detail.map((item) => `/game/${item}`);
      const appDetailPaths = posts.data.app_detail.map((item) => `/game/${item}`);
      const gameDownloadPaths = posts.data.game_detail.map((item) => `/download/${item}`);
      // const appDownloadPaths = posts.data.app_detail.map((item) => `/download/${item}`);

      const categoryPaths = afs.data.category.map((item) => `/category/${item}`);
      const detailPaths = afs.data.detail.map((item) => `/detail/${item}`);
      const urls = [
        // ...gameCategoryPaths,
        // ...appCategoryPaths,
        ...gameDetailPaths,
        ...appDetailPaths,
        ...gameDownloadPaths,
        // ...appDownloadPaths

        ...categoryPaths,
        ...detailPaths
      ];
      return urls;
    }
  },
  axios: {
    baseURL:
      process.env.NODE_ENV === "production" ? process.env.PROD_API_URL : process.env.TEST_API_URL
  },
  router: {
    trailingSlash: true
  },
  head: {
    title: "SoccerIns - Global News at Your Fingertips!",
    meta: [
      // {
      //   name: "version",
      //   content: process.env.APP_VERSION || "1.0"
      // },
      // {
      //   name: "viewport",
      //   content: "width=device-width, initial-scale=1"
      // },
      // {
      //   hid: "description",
      //   name: "description",
      //   content:
      //     "SoccerIns is a platform that gathers countless young gamers with the best free online games. All of our games are designed to provide young people with a better way to relax and have fun, ≈ and a wide range of styles waiting for your selection. When you are looking for fun through games, SoccerIns will be your faithful choice, offering you a more comprehensive range of games, the most diverse selection and as many new surprises as possible!"
      // },
      // {
      //   hid: "keywords",
      //   name: "keywords",
      //   content:
      //     "Role-playing games, entertainment games, puzzle games, strategy games, cute games, pet games, parkour games, synthesis games, dress up games, princess games, adventure games, casual games, healing games, horror games, music games, cooking games"
      // }
      {
        name: "version",
        content: process.env.APP_VERSION || "1.0"
      },
      {
        name: "viewport",
        content:
          "width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,minimal-ui"
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes"
      },
      {
        name: "mobile-web-app-capable",
        content: "yes"
      },
      {
        hid: "description",
        name: "description",
        content:
          "We are committed to delivering you the latest developments in various fields, including politics, economy, technology, culture, sports, and more.!"
      },
      {
        hid: "keywords",
        name: "keywords",
        content:
          "news, Frontier news, latest news, IT news, sports news, fashion news, car news, healthy news"
      },
      {
        hid: "og:site_name",
        property: "og:site_name",
        content: "SoccerIns"
      }
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }
      // {
      //   rel: "preload",
      //   href: "/images/app.webp",
      //   as: "image"
      // },
      // {
      //   rel: "preload",
      //   href: "/images/game.webp",
      //   as: "image"
      // }
    ]
  },
  image: {
    provider: "cloudflare",
    cloudflare: {
      baseURL: "https://bunchthings.com"
    }
  },
  plugins: [
    { src: "~/plugins/vue-infinite-scroll", ssr: false },
    { src: "~/plugins/lang-redirect", ssr: false },
    "~/plugins/axios",
    "~/plugins/global-data",
    "~/plugins/report",
    "~/plugins/nav-data"
  ],
  components: true,
  buildModules: [
    "@nuxtjs/style-resources",
    "@nuxt/image",
    "@nuxtjs/pwa",
    "@nuxtjs/sitemap",
    "nuxt-purgecss"
  ],
  i18n: {
    strategy: "prefix",
    defaultLocale: "en",
    baseUrl: "https://soccerins.com",
    locales: [
      { code: "en", iso: "en-US", file: "en.js", name: "English" },
      { code: "es", iso: "es-ES", file: "es.js", name: "Español" },
      { code: "pt", iso: "pt-BR", file: "pt.js", name: "Português" },
      { code: "ar", iso: "ar-SA", file: "ar.js", name: "العربية", dir: "rtl" },
      { code: "ja", iso: "ja-JP", file: "ja.js", name: "日本語" },
      { code: "ko", iso: "ko-KR", file: "ko.js", name: "한국어" }
    ],
    langDir: "locales/",
    seo: true,
    lazy: true,
    vueI18n: {
      fallbackLocale: "en"
    }
  },
  css: ["@/assets/css/fonts.css", "@/assets/css/reset.css", "@/assets/css/common.scss"],
  styleResources: {
    scss: ["~/assets/css/_mixins.scss"]
  },
  modules: ["@nuxtjs/axios", "@nuxtjs/i18n"],
  sitemap: {
    hostname: "https://soccerins.com/",
    gzip: true,
    i18n: true,
    defaults: {
      changefreq: "daily",
      priority: 0.7,
      lastmod: new Date().toISOString(),
    },
    routes: [
      // 首页
      { url: "/en/", changefreq: "hourly", priority: 1.0 },
      { url: "/es/", changefreq: "hourly", priority: 1.0 },
      { url: "/pt/", changefreq: "hourly", priority: 1.0 },
      { url: "/ar/", changefreq: "hourly", priority: 1.0 },
      { url: "/ja/", changefreq: "hourly", priority: 1.0 },
      { url: "/ko/", changefreq: "hourly", priority: 1.0 },
      // 比赛结果（高频更新）
      { url: "/en/results/", changefreq: "daily", priority: 0.9 },
      { url: "/es/results/", changefreq: "daily", priority: 0.9 },
      { url: "/pt/results/", changefreq: "daily", priority: 0.9 },
      { url: "/ar/results/", changefreq: "daily", priority: 0.9 },
      { url: "/ja/results/", changefreq: "daily", priority: 0.9 },
      { url: "/ko/results/", changefreq: "daily", priority: 0.9 },
      // 积分榜
      { url: "/en/standings/", changefreq: "daily", priority: 0.9 },
      { url: "/es/standings/", changefreq: "daily", priority: 0.9 },
      { url: "/pt/standings/", changefreq: "daily", priority: 0.9 },
      { url: "/ar/standings/", changefreq: "daily", priority: 0.9 },
      { url: "/ja/standings/", changefreq: "daily", priority: 0.9 },
      { url: "/ko/standings/", changefreq: "daily", priority: 0.9 },
      // 新闻列表
      { url: "/en/news/", changefreq: "daily", priority: 0.8 },
      { url: "/es/news/", changefreq: "daily", priority: 0.8 },
      { url: "/pt/news/", changefreq: "daily", priority: 0.8 },
      { url: "/ar/news/", changefreq: "daily", priority: 0.8 },
      { url: "/ja/news/", changefreq: "daily", priority: 0.8 },
      { url: "/ko/news/", changefreq: "daily", priority: 0.8 },
      // 赛程
      { url: "/en/schedule/", changefreq: "daily", priority: 0.8 },
      { url: "/es/schedule/", changefreq: "daily", priority: 0.8 },
      { url: "/pt/schedule/", changefreq: "daily", priority: 0.8 },
      { url: "/ar/schedule/", changefreq: "daily", priority: 0.8 },
      { url: "/ja/schedule/", changefreq: "daily", priority: 0.8 },
      { url: "/ko/schedule/", changefreq: "daily", priority: 0.8 },
      // 直播推荐
      { url: "/en/live-tv/", changefreq: "weekly", priority: 0.7 },
      { url: "/es/live-tv/", changefreq: "weekly", priority: 0.7 },
      { url: "/pt/live-tv/", changefreq: "weekly", priority: 0.7 },
      { url: "/ar/live-tv/", changefreq: "weekly", priority: 0.7 },
      { url: "/ja/live-tv/", changefreq: "weekly", priority: 0.7 },
      { url: "/ko/live-tv/", changefreq: "weekly", priority: 0.7 },
    ],
  },
  pwa: {
    manifest: {
      name: "SoccerIns",
      short_name: "SoccerIns",
      description:
        "SoccerIns is a platform that gathers countless young gamers with the best free online games. All of our games are designed to provide young people with a better way to relax and have fun, with healthy gameplay and a wide range of styles waiting for your selection. When you are looking for fun through games, SoccerIns will be your faithful choice, offering you a more comprehensive range of games, the most diverse selection and as many new surprises as possible!",
      icons: [
        {
          src: "/icons/32.png",
          sizes: "32x32",
          type: "image/png"
        },
        {
          src: "/icons/48.png",
          sizes: "48x48",
          type: "image/png"
        },
        {
          src: "/icons/72.png",
          sizes: "72x72",
          type: "image/png"
        },
        {
          src: "/icons/96.png",
          sizes: "96x96",
          type: "image/png"
        },
        {
          src: "/icons/144.png",
          sizes: "144x144",
          type: "image/png"
        },
        {
          src: "/icons/192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icons/256.png",
          sizes: "256x256",
          type: "image/png"
        },
        {
          src: "/icons/512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ]
    }
  },
  build: {
    html: {
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    },
    extractCSS: {
      ignoreOrder: true
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        automaticNameDelimiter: ".",
        name: true,
        minSize: 10000,
        maxSize: 244000,
        cacheGroups: {
          vendor: {
            name: "vendors",
            test: /[\\/]node_modules[\\/]/,
            chunks: "all",
            maxSize: 244000,
            priority: -10
          },
          styles: {
            name: "styles",
            test: /\.(css|vue)$/,
            chunks: "all",
            enforce: true
          }
        }
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              // drop_console: true
            },
            output: {
              comments: false
            }
          }
        }),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: { inline: false },
            discardComments: { removeAll: true }
          }
        })
      ]
    }
  },
  purgeCSS: {
    whitelistPatterns: [/^swiper-pagination-bullet/] // 忽略swiper样式
  }
};
