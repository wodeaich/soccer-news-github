<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('schedule.title') }}</h1>

      <!-- 顶部广告 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="schedule-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 阶段筛选 Tab -->
      <div class="tabs">
        <button
          v-for="stage in stages"
          :key="stage.key"
          class="tab"
          :class="{ active: activeStage === stage.key }"
          @click="activeStage = stage.key"
        >
          {{ $t(stage.label) }}
        </button>
      </div>

      <!-- 无数据状态 -->
      <div v-if="!filteredMatches.length" class="empty">
        <div class="empty-icon">⚽</div>
        <p class="empty-text">{{ $t('common.noData') }}</p>
      </div>

      <!-- 赛程列表（按日期分组） -->
      <div v-else>
        <div v-for="(group, date) in groupedMatches" :key="date" class="date-group">
          <div class="date-header">{{ formatGroupDate(date) }}</div>
          <div class="match-list">
            <div v-for="match in group" :key="match.id" class="match-card">
              <div class="match-stage-badge">{{ getStageName(match.stage) }}</div>
              <div class="match-teams">
                <div class="team home">
                  <img v-if="match.home_flag" :src="match.home_flag" :alt="match.home_team" class="team-flag" />
                  <span class="team-name">{{ match.home_team }}</span>
                </div>
                <div class="match-center">
                  <span class="vs">VS</span>
                  <span class="kickoff-time">{{ formatTime(match.kickoff) }}</span>
                </div>
                <div class="team away">
                  <span class="team-name">{{ match.away_team }}</span>
                  <img v-if="match.away_flag" :src="match.away_flag" :alt="match.away_team" class="team-flag" />
                </div>
              </div>
              <div class="match-venue">
                <span class="venue-label">{{ $t('schedule.venue') }}:</span>
                <span class="venue-name">{{ match.venue }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中部广告 -->
      <adm-slot
        class="ad-block"
        adm-id="schedule-mid"
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
      const data = await $axios.$get('/api/match/schedule', {
        params: { site_id: env.SITE_ID }
      })
      return { matches: data.list || [] }
    } catch {
      return { matches: [] }
    }
  },
  data() {
    return {
      activeStage: 'all',
      stages: [
        { key: 'all',     label: 'schedule.allStages' },
        { key: 'group',   label: 'schedule.group' },
        { key: 'r16',     label: 'schedule.roundOf16' },
        { key: 'quarter', label: 'schedule.quarter' },
        { key: 'semi',    label: 'schedule.semi' },
        { key: 'final',   label: 'schedule.final' },
      ]
    }
  },
  computed: {
    filteredMatches() {
      if (this.activeStage === 'all') return this.matches
      return this.matches.filter(m => m.stage === this.activeStage)
    },
    groupedMatches() {
      return this.filteredMatches.reduce((acc, match) => {
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
      return new Date(ts * 1000).toLocaleTimeString(this.$i18n.locale, {
        hour: '2-digit', minute: '2-digit'
      })
    },
    getStageName(stage) {
      const map = {
        group: 'schedule.group',
        r16: 'schedule.roundOf16',
        quarter: 'schedule.quarter',
        semi: 'schedule.semi',
        final: 'schedule.final'
      }
      return map[stage] ? this.$t(map[stage]) : stage
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
        { '@type': 'ListItem', position: 2, name: this.$t('schedule.title'), item: `https://compsoccer.com/${locale}/schedule/` }
      ]
    }
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.$t('schedule.title')} - SoccerIns`,
      meta: [
        { hid: 'description', name: 'description', content: 'World Cup 2026 match schedule. Find all upcoming fixtures, kick-off times and venues.' },
        { hid: 'og:title', property: 'og:title', content: `${this.$t('schedule.title')} - SoccerIns` },
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
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.tab {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid $color1;
  font-family: "rssb";
  font-size: 13px;
  color: $font1;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s, color 0.2s;
  &:hover { background: rgba($color1, 0.1); }
  &.active { background: $color1; color: #fff; border-color: $color1; }
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

.match-list { display: flex; flex-direction: column; gap: 12px; }

.match-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.match-stage-badge {
  display: inline-block;
  font-size: 11px;
  font-family: "rssb";
  color: $color1;
  background: rgba($color1, 0.1);
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.team {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  &.away { justify-content: flex-end; }
}
.team-flag { width: 28px; height: 20px; object-fit: cover; border-radius: 2px; }
.team-name {
  font-family: "rssb";
  font-size: 15px;
  color: $font1;
}

.match-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}
.vs {
  font-family: "rssb";
  font-size: 18px;
  color: rgba($font1, 0.3);
}
.kickoff-time {
  font-size: 12px;
  color: $color1;
  font-family: "rs";
  margin-top: 2px;
}

.match-venue {
  font-size: 12px;
  color: rgba($font1, 0.5);
  font-family: "rs";
}
.venue-label { font-family: "rssb"; margin-right: 4px; }

.ad-block { margin: 28px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .page-title { font-size: vw(42); margin: vw(32) 0 vw(24); }
  .tabs { gap: vw(12); margin-bottom: vw(36); }
  .tab { padding: vw(14) vw(28); font-size: vw(24); border-radius: vw(32); }
  .team-name { font-size: vw(26); }
  .match-card { padding: vw(24) vw(28); border-radius: vw(16); }
  .team-flag { width: vw(40); height: vw(28); }
  .match-center { min-width: vw(100); }
  .vs { font-size: vw(28); }
  .kickoff-time { font-size: vw(20); }
  .match-venue { font-size: vw(20); }
}
</style>
