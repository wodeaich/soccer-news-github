<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('liveTV.title') }}</h1>

      <!-- 顶部广告 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="livetv-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 今日赛事快览 -->
      <section v-if="todayMatches.length" class="today-section">
        <h2 class="section-title">{{ $t('liveTV.todayMatches') }}</h2>
        <div class="today-list">
          <div v-for="match in todayMatches" :key="match.id" class="today-card">
            <div class="today-teams">
              <span class="team-name">{{ match.home_team }}</span>
              <span class="today-vs">VS</span>
              <span class="team-name">{{ match.away_team }}</span>
            </div>
            <span class="today-time">{{ formatTime(match.kickoff) }}</span>
          </div>
        </div>
      </section>

      <!-- 通栏广告 -->
      <adm-slot-full
        class="ad-block"
        adm-id="livetv-full"
        adm-unit="/23197833490/soccerins/soccerins_home_full"
        ads-slot="4080715115"
      />

      <!-- 按地区分组的播出渠道 -->
      <section class="channels-section">
        <h2 class="section-title">{{ $t('liveTV.byRegion') }}</h2>

        <!-- 地区 Tab -->
        <div class="region-tabs">
          <button
            v-for="region in regionList"
            :key="region.key"
            class="region-tab"
            :class="{ active: activeRegion === region.key }"
            @click="activeRegion = region.key"
          >
            {{ region.flag }} {{ $t('liveTV.regions.' + region.key) }}
          </button>
        </div>

        <!-- 当前地区频道列表 -->
        <div v-if="currentChannels.length" class="channel-grid">
          <div v-for="ch in currentChannels" :key="ch.id" class="channel-card">
            <div class="channel-head">
              <img v-if="ch.logo" :src="ch.logo" :alt="ch.name" class="channel-logo" />
              <div v-else class="channel-logo-placeholder">📺</div>
              <div class="channel-info">
                <span class="channel-name">{{ ch.name }}</span>
                <span class="channel-type" :class="ch.free ? 'free' : 'paid'">
                  {{ ch.free ? $t('liveTV.free') : $t('liveTV.paid') }}
                </span>
              </div>
            </div>
            <p v-if="ch.note" class="channel-note">{{ ch.note }}</p>
            <a
              v-if="ch.url"
              :href="ch.url"
              target="_blank"
              rel="noopener noreferrer"
              class="watch-btn"
            >{{ $t('liveTV.watchNow') }}</a>
          </div>
        </div>

        <!-- 无频道数据时显示静态默认内容 -->
        <div v-else class="default-channels">
          <div v-for="ch in defaultChannels" :key="ch.name" class="channel-card">
            <div class="channel-head">
              <div class="channel-logo-placeholder">📺</div>
              <div class="channel-info">
                <span class="channel-name">{{ ch.name }}</span>
                <span class="channel-type" :class="ch.free ? 'free' : 'paid'">
                  {{ ch.free ? $t('liveTV.free') : $t('liveTV.paid') }}
                </span>
              </div>
            </div>
            <p class="channel-note">{{ ch.note }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ — GEO 优化 -->
      <section class="faq-section">
        <h2 class="section-title">FAQ</h2>
        <div class="faq-list">
          <div v-for="(faq, i) in faqs" :key="i" class="faq-item">
            <button class="faq-q" @click="toggleFaq(i)">
              {{ faq.q }}
              <span class="faq-arrow" :class="{ open: openFaq === i }">›</span>
            </button>
            <div v-show="openFaq === i" class="faq-a">{{ faq.a }}</div>
          </div>
        </div>
      </section>

      <!-- 底部广告 -->
      <adm-slot
        class="ad-block"
        adm-id="livetv-bottom"
        adm-unit="/23197833490/soccerins/soccerins_home_3"
        ads-slot="6028318341"
      />
    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <AdLoading />
    <BackTop />
  </div>
</template>

<script>
const DEFAULT_CHANNELS = {
  us: [
    { name: 'Fox Sports',  free: false, note: 'English broadcast — cable/streaming' },
    { name: 'Telemundo',   free: false, note: 'Spanish broadcast — cable/streaming' },
    { name: 'HBO Max',     free: false, note: 'Streaming platform' },
    { name: 'FIFA+',       free: true,  note: 'Free selected matches worldwide' },
  ],
  uk: [
    { name: 'ITV',         free: true,  note: 'Free-to-air, selected matches' },
    { name: 'BBC One',     free: true,  note: 'Free-to-air, selected matches' },
    { name: 'ITV X',       free: true,  note: 'Free streaming via ITV app' },
  ],
  br: [
    { name: 'TV Globo',    free: true,  note: 'Canal aberto, jogos selecionados' },
    { name: 'SporTV',      free: false, note: 'Todos os jogos — cabo/streaming' },
    { name: 'Globoplay',   free: false, note: 'Streaming' },
  ],
  mx: [
    { name: 'Televisa',    free: true,  note: 'Canal abierto, partidos seleccionados' },
    { name: 'Sky Sports',  free: false, note: 'Todos los partidos' },
  ],
  jp: [
    { name: 'NHK',         free: true,  note: '地上波・一部試合' },
    { name: 'ABEMA',       free: true,  note: '全試合無料ライブ配信（予定）' },
    { name: 'DAZN',        free: false, note: 'ストリーミング' },
  ],
  kr: [
    { name: 'KBS',         free: true,  note: '지상파 · 일부 경기' },
    { name: 'MBC',         free: true,  note: '지상파 · 일부 경기' },
    { name: 'Coupang Play',free: false, note: '전 경기 스트리밍' },
  ],
  me: [
    { name: 'beIN Sports', free: false, note: 'الإذاعة العربية — جميع المباريات' },
    { name: 'SSC',         free: false, note: 'المملكة العربية السعودية' },
    { name: 'FIFA+',       free: true,  note: 'بث مجاني لمباريات مختارة' },
  ],
}

const FAQS_BY_LANG = {
  en: [
    { q: 'Where can I watch World Cup 2026 for free?',
      a: 'FIFA+ streams select matches for free worldwide. In the UK, ITV and BBC One air selected matches free-to-air. Check your local listings for free-to-air options.' },
    { q: 'What channel shows World Cup 2026 in the USA?',
      a: 'Fox Sports broadcasts in English and Telemundo in Spanish. Both require a cable subscription or live TV streaming service (e.g., Sling, YouTube TV).' },
    { q: 'Can I watch World Cup 2026 on mobile?',
      a: 'Yes — FIFA+ app, ITV X app (UK), ABEMA app (Japan), and each broadcaster\'s official app support mobile streaming.' },
  ],
  es: [
    { q: '¿Dónde ver el Mundial 2026 gratis?',
      a: 'FIFA+ transmite partidos seleccionados de forma gratuita. En México, Televisa transmite partidos en abierto. Consulta tu guía local para opciones gratuitas.' },
    { q: '¿Qué canal transmite el Mundial 2026?',
      a: 'En EE.UU.: Fox Sports (inglés) y Telemundo (español). En México: Televisa y Sky Sports. En España: RTVE (previsto).' },
    { q: '¿Puedo ver el Mundial en el móvil?',
      a: 'Sí — la app de FIFA+, las apps de cada operadora y servicios de streaming como HBO Max permiten ver los partidos en móvil.' },
  ],
  pt: [
    { q: 'Onde assistir à Copa do Mundo 2026 de graça?',
      a: 'A FIFA+ transmite jogos selecionados gratuitamente. A TV Globo transmite jogos em canal aberto no Brasil.' },
    { q: 'Qual canal transmite a Copa do Mundo 2026?',
      a: 'No Brasil: TV Globo (aberto) e SporTV (cabo). Em Portugal: RTP (previsto) e SPORT TV.' },
    { q: 'Posso assistir pelo celular?',
      a: 'Sim — o app FIFA+, Globoplay e os apps das emissoras permitem assistir no celular.' },
  ],
}

export default {
  asyncData({ payload }) {
    return payload || { channels: [], todayMatches: [] }
  },
  data() {
    return {
      activeRegion: 'us',
      openFaq: null,
      regionList: [
        { key: 'us', flag: '🇺🇸' },
        { key: 'uk', flag: '🇬🇧' },
        { key: 'br', flag: '🇧🇷' },
        { key: 'mx', flag: '🇲🇽' },
        { key: 'jp', flag: '🇯🇵' },
        { key: 'kr', flag: '🇰🇷' },
        { key: 'me', flag: '🌍' },
      ]
    }
  },
  computed: {
    currentChannels() {
      return this.channels.filter(ch => ch.region === this.activeRegion)
    },
    defaultChannels() {
      return DEFAULT_CHANNELS[this.activeRegion] || []
    },
    faqs() {
      const locale = this.$i18n.locale
      return FAQS_BY_LANG[locale] || FAQS_BY_LANG.en
    }
  },
  methods: {
    formatTime(ts) {
      if (!ts) return ''
      return new Date(ts * 1000).toLocaleTimeString(this.$i18n.locale, {
        hour: '2-digit', minute: '2-digit'
      })
    },
    toggleFaq(i) {
      this.openFaq = this.openFaq === i ? null : i
    }
  },
  head() {
    const locale = this.$i18n.locale
    const localeMap = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', ar: 'ar_SA', ja: 'ja_JP', ko: 'ko_KR' }
    const faqs = this.faqs
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.$t('liveTV.title')} - CompSoccer`,
      meta: [
        { hid: 'description', name: 'description', content: 'Where to watch World Cup 2026 live. Full TV guide by region — USA, UK, Brazil, Mexico, Japan, Korea and Middle East.' },
        { hid: 'og:title', property: 'og:title', content: `${this.$t('liveTV.title')} - CompSoccer` },
        { hid: 'og:locale', property: 'og:locale', content: localeMap[locale] || locale },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        {
          hid: 'ld-faq',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a }
            }))
          })
        },
        {
          hid: 'ld-breadcrumb',
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `https://compsoccer.com/${locale}/` },
              { '@type': 'ListItem', position: 2, name: this.$t('liveTV.title'), item: `https://compsoccer.com/${locale}/live-tv/` }
            ]
          })
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px 64px; }

.page-title {
  font-family: "rssb";
  font-size: 28px;
  color: $font1;
  margin: 32px 0 24px;
  padding-left: 12px;
  border-left: 4px solid $color1;
}

.section-title {
  font-family: "rssb";
  font-size: 20px;
  color: $font1;
  margin: 0 0 16px;
  padding-left: 10px;
  border-left: 3px solid $color1;
}

/* 今日赛事 */
.today-section { margin-bottom: 8px; }
.today-list { display: flex; flex-wrap: wrap; gap: 12px; }
.today-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.today-teams { display: flex; align-items: center; gap: 8px; }
.team-name { font-family: "rssb"; font-size: 14px; color: $font1; }
.today-vs { font-size: 12px; color: rgba($font1, 0.4); font-family: "rs"; }
.today-time {
  font-family: "rssb";
  font-size: 13px;
  color: $color1;
  margin-left: 8px;
}

/* 地区 Tab */
.channels-section { margin-top: 32px; }
.region-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.region-tab {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid $color1;
  font-size: 13px;
  font-family: "rssb";
  color: $font1;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s, color 0.2s;
  &:hover { background: rgba($color1, 0.1); }
  &.active { background: $color1; color: #fff; }
}

/* 频道格子 */
.channel-grid, .default-channels {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.channel-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.channel-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.channel-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
}
.channel-logo-placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f0f2f5;
  border-radius: 8px;
}
.channel-info { display: flex; flex-direction: column; gap: 4px; }
.channel-name { font-family: "rssb"; font-size: 15px; color: $font1; }
.channel-type {
  display: inline-block;
  font-size: 11px;
  font-family: "rssb";
  padding: 2px 8px;
  border-radius: 8px;
  &.free { background: rgba($color1, 0.15); color: darken($color1, 10%); }
  &.paid { background: rgba($font1, 0.08); color: rgba($font1, 0.6); }
}
.channel-note {
  font-size: 12px;
  color: rgba($font1, 0.5);
  font-family: "rs";
  line-height: 1.5;
}
.watch-btn {
  margin-top: auto;
  display: inline-block;
  background: $color1;
  color: #fff;
  font-family: "rssb";
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
}

/* FAQ */
.faq-section { margin-top: 40px; }
.faq-list { display: flex; flex-direction: column; gap: 2px; }
.faq-item {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 8px;
}
.faq-q {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-family: "rssb";
  font-size: 15px;
  color: $font1;
  cursor: pointer;
  background: none;
  text-align: left;
  &:hover { background: rgba($color1, 0.04); }
}
.faq-arrow {
  font-size: 20px;
  color: $color1;
  transition: transform 0.2s;
  flex-shrink: 0;
  &.open { transform: rotate(90deg); }
}
.faq-a {
  padding: 0 20px 16px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba($font1, 0.7);
  font-family: "rs";
}

.ad-block { margin: 28px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .page-title { font-size: vw(42); margin: vw(32) 0 vw(24); }
  .section-title { font-size: vw(34); }
  .today-list { gap: vw(16); }
  .today-card { padding: vw(20) vw(24); border-radius: vw(16); gap: vw(12); }
  .team-name { font-size: vw(26); }
  .today-time { font-size: vw(22); }
  .region-tabs { gap: vw(12); }
  .region-tab { padding: vw(12) vw(20); font-size: vw(22); border-radius: vw(32); }
  .channel-grid, .default-channels { grid-template-columns: 1fr 1fr; gap: vw(20); }
  .channel-card { padding: vw(24) vw(20); border-radius: vw(16); gap: vw(12); }
  .channel-logo, .channel-logo-placeholder { width: vw(60); height: vw(60); border-radius: vw(10); }
  .channel-logo-placeholder { font-size: vw(32); }
  .channel-name { font-size: vw(26); }
  .faq-q { padding: vw(24) vw(24); font-size: vw(26); }
  .faq-a { padding: 0 vw(24) vw(24); font-size: vw(24); }
  .faq-arrow { font-size: vw(32); }
}
</style>
