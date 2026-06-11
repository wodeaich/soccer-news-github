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
    // 排除遗留的游戏站页面（非世界杯产品，且依赖旧后台）。
    // 后续可直接删除这些 pages/ 源文件。
    exclude: [/\/(games|casual|hot|live|landing|search|afsearch|game|download|category|detail)(\/|$)/],
    // 纯静态：在构建期(纯 Node)从本地 content/ 算好每个路由的数据，
    // 通过 payload 注入页面 asyncData，页面不直接读文件，避免打包 fs。
    routes() {
      const content = require("./utils/content");
      const langs = content.LOCALES;
      const fixParagraphs = (html) =>
        (html || "").replace(/<\/h4><p><br><br>|<br><br><\/p><h4>/g, (m) =>
          m.includes("</h4><p>") ? "</h4><p>" : "</p><h4>"
        );

      const routes = [];
      for (const l of langs) {
        routes.push({
          route: `/${l}/`,
          payload: {
            featured: content.getMenu(l, "rec", 3),
            trending: content.getMenu(l, "trending", 6),
            allNews: content.getMenu(l, "all", 10),
          },
        });
        routes.push({
          route: `/${l}/news/`,
          payload: { featured: content.getMenu(l, "rec", 3), allNews: content.getMenu(l, "all", 10) },
        });
        routes.push({ route: `/${l}/schedule/`, payload: { matches: content.getSchedule() } });
        routes.push({ route: `/${l}/results/`, payload: { results: content.getResults() } });
        const groups = content.getStandings();
        routes.push({
          route: `/${l}/standings/`,
          payload: { groups, activeGroup: (groups[0] && groups[0].name) || "" },
        });
        routes.push({
          route: `/${l}/live-tv/`,
          payload: { channels: content.getChannels(), todayMatches: content.getToday() },
        });

        // 文章详情
        for (const slug of content.listArticleSlugs()) {
          const id = slug.split("-").pop();
          const newInfo = content.getArticle(l, id);
          if (!newInfo) continue;
          newInfo.content = fixParagraphs(newInfo.content);
          routes.push({ route: `/${l}/news/${slug}/`, payload: { newInfo } });
        }
        // 比赛详情
        for (const slug of content.listMatchSlugs()) {
          const match = content.getMatch(slug, l);
          if (!match) continue;
          routes.push({
            route: `/${l}/matches/${slug}/`,
            payload: { match, relatedNews: content.getMenu(l, "all", 3) },
          });
        }
      }
      return routes;
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
    title: "CompSoccer - Global News at Your Fingertips!",
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
      //     "CompSoccer is a platform that gathers countless young gamers with the best free online games. All of our games are designed to provide young people with a better way to relax and have fun, ≈ and a wide range of styles waiting for your selection. When you are looking for fun through games, CompSoccer will be your faithful choice, offering you a more comprehensive range of games, the most diverse selection and as many new surprises as possible!"
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
        content: "CompSoccer"
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
    baseUrl: "https://compsoccer.com",
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
    hostname: "https://compsoccer.com/",
    gzip: true,
    i18n: true,
    defaults: {
      changefreq: "daily",
      priority: 0.7,
      lastmod: new Date().toISOString(),
    },
    routes() {
      const langs = ["en", "es", "pt", "ar", "ja", "ko"];
      const staticRoutes = [
        // 首页
        ...langs.map((l) => ({ url: `/${l}/`, changefreq: "hourly", priority: 1.0 })),
        // 比赛结果
        ...langs.map((l) => ({ url: `/${l}/results/`, changefreq: "daily", priority: 0.9 })),
        // 积分榜
        ...langs.map((l) => ({ url: `/${l}/standings/`, changefreq: "daily", priority: 0.9 })),
        // 新闻列表
        ...langs.map((l) => ({ url: `/${l}/news/`, changefreq: "daily", priority: 0.8 })),
        // 赛程
        ...langs.map((l) => ({ url: `/${l}/schedule/`, changefreq: "daily", priority: 0.8 })),
        // 直播推荐
        ...langs.map((l) => ({ url: `/${l}/live-tv/`, changefreq: "weekly", priority: 0.7 })),
      ];

      // 动态 URL：从本地 content/ 读取文章与比赛 slug
      try {
        const content = require("./utils/content");
        const lastmod = new Date().toISOString();
        const articleSlugs = content.listArticleSlugs();
        const matchSlugs = content.listMatchSlugs();
        const articleRoutes = articleSlugs.flatMap((slug) =>
          langs.map((l) => ({
            url: `/${l}/news/${slug}/`,
            changefreq: "weekly",
            priority: 0.6,
            lastmod,
          }))
        );
        const matchRoutes = matchSlugs.flatMap((slug) =>
          langs.map((l) => ({
            url: `/${l}/matches/${slug}/`,
            changefreq: "weekly",
            priority: 0.6,
            lastmod,
          }))
        );
        return [...staticRoutes, ...articleRoutes, ...matchRoutes];
      } catch (_) {
        return staticRoutes;
      }
    },
  },
  pwa: {
    manifest: {
      name: "CompSoccer",
      short_name: "CompSoccer",
      description:
        "CompSoccer is a platform that gathers countless young gamers with the best free online games. All of our games are designed to provide young people with a better way to relax and have fun, with healthy gameplay and a wide range of styles waiting for your selection. When you are looking for fun through games, CompSoccer will be your faithful choice, offering you a more comprehensive range of games, the most diverse selection and as many new surprises as possible!",
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
    },
    // 纯静态：content.js 在构建期(服务端)用 fs 读 content/，
    // asyncData 代码也会进客户端包，这里把 fs 置空避免客户端构建报错
    // （客户端用 process.server 守卫，不会真正调用 fs）。
    extend(config, { isClient }) {
      if (isClient) {
        config.node = { ...(config.node || {}), fs: "empty" };
      }
    }
  },
  purgeCSS: {
    whitelistPatterns: [/^swiper-pagination-bullet/] // 忽略swiper样式
  }
};
