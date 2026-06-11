<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('results.title') }}</h1>

      <!-- 顶部广告 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="results-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 日期筛选 Tab -->
      <div class="tabs">
        <button
          v-for="tab in dateTabs"
          :key="tab.key"
          class="tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 无数据状态 -->
      <div v-if="!filteredResults.length" class="empty">
        <div class="empty-icon">🏆</div>
        <p class="empty-text">{{ $t('common.noData') }}</p>
      </div>

      <!-- 结果列表（按日期分组） -->
      <div v-else>
        <div v-for="(group, date) in groupedResults" :key="date" class="date-group">
          <div class="date-header">{{ formatGroupDate(date) }}</div>
          <div class="result-list">
            <div v-for="match in group" :key="match.id" class="result-card">
              <div class="result-teams">
                <div class="team home">
                  <img v-if="match.home_flag" :src="match.home_flag" :alt="match.home_team" class="team-flag" />
                  <span class="team-name">{{ match.home_team }}</span>
                </div>

                <div class="score-box">
                  <span class="score">{{ match.home_score }}</span>
                  <span class="score-sep">-</span>
                  <span class="score">{{ match.away_score }}</span>
                </div>

                <div class="team away">
                  <span class="team-name">{{ match.away_team }}</span>
                  <img v-if="match.away_flag" :src="match.away_flag" :alt="match.away_team" class="team-flag" />
                </div>
              </div>

              <div class="result-meta">
                <span class="match-date">{{ formatTime(match.kickoff) }}</span>
                <nuxt-link
                  v-if="match.slug"
                  :to="localePath(`/matches/${match.slug}/`)"
                  class="review-link"
                >
                  {{ $t('results.viewReview') }} →
                </nuxt-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中部广告 -->
      <adm-slot
        class="ad-block"
        adm-id="results-mid"
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
export default {
  async asyncData({ $axios, env }) {
    try {
      const data = await $axios.$get('/api/match/results', {
        params: { site_id: env.SITE_ID }
      })
      return { results: data.list || [] }
    } catch {
      return { results: [] }
    }
  },
  data() {
    return {
      activeTab: 'all'
    }
  },
  computed: {
    dateTabs() {
      const today = new Date().toISOString().slice(0, 10)
      return [
        { key: 'all',   label: this.$t('results.allResults') },
        { key: today,   label: this.$t('results.today') }
      ]
    },
    filteredResults() {
      if (this.activeTab === 'all') return this.results
      return this.results.filter(m => {
        const day = new Date(m.kickoff * 1000).toISOString().slice(0, 10)
        return day === this.activeTab
      })
    },
    groupedResults() {
      return this.filteredResults.reduce((acc, match) => {
        const day = new Date(match.kickoff * 1000).toISOString().slice(0, 10)
        if (!acc[day]) acc[day] = []
        acc[day].push(match)
        return acc
      }, {})
    }
  },
  methods: {
    formatGroupDate(dateStr) {
      return new Date(dateStr).toLocaleDateString(this.$i18n.locale, {
        weekday: 'long', month: 'long', day: 'numeric'
      })
    },
    formatTime(ts) {
      if (!ts) return ''
      return new Date(ts * 1000).toLocaleDateString(this.$i18n.locale, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    }
  },
  head() {
    const locale = this.$i18n.locale
    const localeMap = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', ar: 'ar_SA', ja: 'ja_JP', ko: 'ko_KR' }
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `https://compsoccer.com/${locale}/` },
        { '@type': 'ListItem', position: 2, name: this.$t('results.title'), item: `https://compsoccer.com/${locale}/results/` }
      ]
    }
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.$t('results.title')} - CompSoccer`,
      meta: [
        { hid: 'description', name: 'description', content: 'World Cup 2026 match results and scores. View all completed fixtures with match reviews.' },
        { hid: 'og:title', property: 'og:title', content: `${this.$t('results.title')} - CompSoccer` },
        { hid: 'og:locale', property: 'og:locale', content: localeMap[locale] || locale },
        { hid: 'og:type', property: 'og:type', content: 'website' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [{ hid: 'ld-breadcrumb', type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) }]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 24px 64px; }

.page-title {
  font-family: "rssb";
  font-size: 28px;
  color: $font1;
  margin: 32px 0 24px;
  padding-left: 12px;
  border-left: 4px solid $color1;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
}
.tab {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid $color1;
  font-family: "rssb";
  font-size: 13px;
  color: $font1;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s, color 0.2s;
  &:hover { background: rgba($color1, 0.1); }
  &.active { background: $color1; color: #fff; }
}

.empty {
  text-align: center;
  padding: 80px 0;
}
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: rgba($font1, 0.5); font-family: "rs"; }

.date-group { margin-bottom: 32px; }
.date-header {
  font-family: "rssb";
  font-size: 15px;
  color: rgba($font1, 0.6);
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 12px;
  text-transform: capitalize;
}

.result-list { display: flex; flex-direction: column; gap: 12px; }

.result-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.result-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.team {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  &.away { justify-content: flex-end; }
}
.team-flag { width: 32px; height: 22px; object-fit: cover; border-radius: 2px; }
.team-name {
  font-family: "rssb";
  font-size: 16px;
  color: $font1;
}

.score-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: $font1;
  border-radius: 8px;
  padding: 6px 16px;
  min-width: 80px;
  justify-content: center;
}
.score {
  font-family: "rssb";
  font-size: 22px;
  color: #fff;
  line-height: 1;
}
.score-sep {
  font-size: 18px;
  color: rgba(#fff, 0.5);
}

.result-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.match-date {
  font-size: 12px;
  color: rgba($font1, 0.5);
  font-family: "rs";
}
.review-link {
  font-size: 13px;
  font-family: "rssb";
  color: $color1;
  &:hover { text-decoration: underline; }
}

.ad-block { margin: 28px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .page-title { font-size: vw(42); margin: vw(32) 0 vw(24); }
  .tabs { gap: vw(16); margin-bottom: vw(36); }
  .tab { padding: vw(14) vw(32); font-size: vw(24); border-radius: vw(32); }
  .result-card { padding: vw(24) vw(28); border-radius: vw(16); }
  .team-name { font-size: vw(26); }
  .team-flag { width: vw(44); height: vw(30); }
  .score-box { padding: vw(8) vw(20); min-width: vw(100); border-radius: vw(12); }
  .score { font-size: vw(36); }
  .score-sep { font-size: vw(28); }
  .review-link { font-size: vw(22); }
  .match-date { font-size: vw(20); }
}
</style>
