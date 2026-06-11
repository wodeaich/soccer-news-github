<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <!-- 顶部广告 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="match-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 比赛比分头部 -->
      <div class="match-header">
        <div class="stage-badge">{{ getStageName(match.stage) }}</div>
        <div class="match-date">{{ formatDate(match.kickoff) }}</div>
        <div class="score-board">
          <div class="team-block">
            <img v-if="match.home_flag" :src="match.home_flag" :alt="match.home_team" class="team-flag" />
            <span class="team-name">{{ match.home_team || '—' }}</span>
          </div>
          <div class="score-center">
            <div v-if="match.status === 'finished'" class="final-score">
              <span>{{ match.home_score }}</span>
              <span class="sep">:</span>
              <span>{{ match.away_score }}</span>
            </div>
            <div v-else class="vs-text">VS</div>
            <div class="match-venue">{{ match.venue }}</div>
          </div>
          <div class="team-block">
            <img v-if="match.away_flag" :src="match.away_flag" :alt="match.away_team" class="team-flag" />
            <span class="team-name">{{ match.away_team || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- 比赛统计（如有数据） -->
      <div v-if="hasStats" class="stats-section">
        <h2 class="section-title">{{ $t('matches.stats') }}</h2>
        <div class="stats-list">
          <div class="stat-row">
            <span class="stat-val home">{{ match.stats.possession_home }}%</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar home-bar" :style="{ width: match.stats.possession_home + '%' }"></div>
            </div>
            <span class="stat-label">{{ $t('matches.possession') }}</span>
            <div class="stat-bar-wrap">
              <div class="stat-bar away-bar" :style="{ width: match.stats.possession_away + '%' }"></div>
            </div>
            <span class="stat-val away">{{ match.stats.possession_away }}%</span>
          </div>

          <div v-for="stat in statRows" :key="stat.key" class="stat-row">
            <span class="stat-val home">{{ match.stats[stat.home] }}</span>
            <div class="stat-bar-wrap">
              <div
                class="stat-bar home-bar"
                :style="{ width: barPct(match.stats[stat.home], match.stats[stat.away]) + '%' }"
              ></div>
            </div>
            <span class="stat-label">{{ $t(stat.label) }}</span>
            <div class="stat-bar-wrap">
              <div
                class="stat-bar away-bar"
                :style="{ width: barPct(match.stats[stat.away], match.stats[stat.home]) + '%' }"
              ></div>
            </div>
            <span class="stat-val away">{{ match.stats[stat.away] }}</span>
          </div>
        </div>
      </div>

      <!-- 通栏广告 -->
      <adm-slot-full
        class="ad-block"
        adm-id="match-full"
        adm-unit="/23197833490/soccerins/soccerins_home_full"
        ads-slot="4080715115"
      />

      <!-- 文字评述 -->
      <div v-if="match.review" class="review-section">
        <h2 class="section-title">{{ $t('matches.overview') }}</h2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="review-content" v-html="match.review"></div>
      </div>

      <!-- 相关新闻 -->
      <div v-if="relatedNews.length" class="related-section">
        <h2 class="section-title">{{ $t('news.relatedNews') }}</h2>
        <div class="related-list">
          <Soccer-NewsCardRow
            v-for="(item, i) in relatedNews"
            :key="i"
            :item="item"
          />
        </div>
      </div>

      <!-- 底部广告 -->
      <adm-slot
        class="ad-block"
        adm-id="match-bottom"
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
  asyncData({ payload, error }) {
    if (payload && payload.match) return payload
    return error({ statusCode: 404, message: 'Match not found' })
  },
  data() {
    return {
      match: {},
      relatedNews: [],
      statRows: [
        { key: 'shots',    home: 'shots_home',    away: 'shots_away',    label: 'matches.shots' },
        { key: 'corners',  home: 'corners_home',  away: 'corners_away',  label: 'matches.corners' },
        { key: 'fouls',    home: 'fouls_home',    away: 'fouls_away',    label: 'matches.fouls' },
        { key: 'yellow',   home: 'yellow_home',   away: 'yellow_away',   label: 'matches.yellowCards' },
        { key: 'red',      home: 'red_home',      away: 'red_away',      label: 'matches.redCards' },
      ]
    }
  },
  computed: {
    hasStats() {
      return this.match.stats && Object.keys(this.match.stats).length > 0
    }
  },
  methods: {
    formatDate(ts) {
      if (!ts) return ''
      return new Date(ts * 1000).toLocaleDateString(this.$i18n.locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    },
    getStageName(stage) {
      const map = {
        group: 'schedule.group', r16: 'schedule.roundOf16',
        quarter: 'schedule.quarter', semi: 'schedule.semi', final: 'schedule.final'
      }
      return map[stage] ? this.$t(map[stage]) : (stage || '')
    },
    barPct(a, b) {
      const total = (Number(a) || 0) + (Number(b) || 0)
      if (!total) return 50
      return Math.round((Number(a) / total) * 100)
    }
  },
  head() {
    const locale = this.$i18n.locale
    const localeMap = { en: 'en_US', es: 'es_ES', pt: 'pt_BR', ar: 'ar_SA', ja: 'ja_JP', ko: 'ko_KR' }
    const title = this.match.home_team && this.match.away_team
      ? `${this.match.home_team} vs ${this.match.away_team} - CompSoccer`
      : `${this.$t('matches.title')} - CompSoccer`
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title,
      meta: [
        { hid: 'description', name: 'description', content: this.match.review_summary || 'World Cup 2026 match review and statistics.' },
        { hid: 'og:title', property: 'og:title', content: title },
        { hid: 'og:locale', property: 'og:locale', content: localeMap[locale] || locale },
        { hid: 'og:type', property: 'og:type', content: 'article' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: this.match.home_team ? [{
        hid: 'ld-sports-event',
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SportsEvent',
          name: `${this.match.home_team} vs ${this.match.away_team}`,
          startDate: this.match.kickoff ? new Date(this.match.kickoff * 1000).toISOString() : undefined,
          location: this.match.venue ? { '@type': 'Place', name: this.match.venue } : undefined,
          homeTeam: { '@type': 'SportsTeam', name: this.match.home_team },
          awayTeam: { '@type': 'SportsTeam', name: this.match.away_team },
          sport: 'Soccer'
        })
      }] : []
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }
.container { max-width: 900px; margin: 0 auto; padding: 0 24px 64px; }

/* 比赛头部 */
.match-header {
  background: $font1;
  border-radius: 16px;
  padding: 24px 32px 28px;
  margin: 24px 0 32px;
  text-align: center;
  color: #fff;
}
.stage-badge {
  display: inline-block;
  font-size: 12px;
  font-family: "rssb";
  background: rgba($color1, 0.25);
  color: $color1;
  padding: 3px 12px;
  border-radius: 12px;
  margin-bottom: 8px;
}
.match-date {
  font-size: 13px;
  color: rgba(#fff, 0.6);
  margin-bottom: 20px;
  font-family: "rs";
}
.score-board {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.team-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 100px;
}
.team-flag { width: 48px; height: 32px; object-fit: cover; border-radius: 4px; }
.team-name {
  font-family: "rssb";
  font-size: 18px;
  color: #fff;
  text-align: center;
}
.score-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}
.final-score {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: "rssb";
  font-size: 48px;
  color: #fff;
  line-height: 1;
}
.sep { color: rgba(#fff, 0.4); font-size: 36px; }
.vs-text {
  font-family: "rssb";
  font-size: 32px;
  color: rgba(#fff, 0.4);
}
.match-venue {
  font-size: 12px;
  color: rgba(#fff, 0.5);
  margin-top: 8px;
  font-family: "rs";
}

/* 统计 */
.section-title {
  font-family: "rssb";
  font-size: 20px;
  color: $font1;
  margin: 32px 0 16px;
  padding-left: 12px;
  border-left: 4px solid $color1;
}
.stats-section { margin-bottom: 8px; }
.stats-list { background: #fff; border-radius: 12px; padding: 20px 24px; }
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  &:last-child { margin-bottom: 0; }
}
.stat-val {
  font-family: "rssb";
  font-size: 14px;
  color: $font1;
  min-width: 36px;
  &.home { text-align: right; }
  &.away { text-align: left; }
}
.stat-label {
  font-size: 13px;
  color: rgba($font1, 0.6);
  min-width: 90px;
  text-align: center;
  font-family: "rs";
}
.stat-bar-wrap { flex: 1; height: 6px; background: #f0f2f5; border-radius: 3px; overflow: hidden; }
.stat-bar { height: 100%; border-radius: 3px; }
.home-bar { background: $color1; margin-left: auto; }
.away-bar { background: #41414c; }

/* 评述 */
.review-section { margin-bottom: 32px; }
.review-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  font-size: 16px;
  line-height: 1.75;
  color: $font1;
  font-family: "rs";
  ::v-deep p { margin-bottom: 16px; }
  ::v-deep h2 { font-family: "rssb"; font-size: 20px; margin: 24px 0 12px; }
  ::v-deep h3 { font-family: "rssb"; font-size: 17px; margin: 20px 0 10px; }
}

/* 相关新闻 */
.related-section { margin-bottom: 8px; }
.related-list { display: flex; flex-direction: column; gap: 16px; }

.ad-block { margin: 28px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .match-header { padding: vw(32) vw(28) vw(40); border-radius: vw(20); margin: vw(24) 0 vw(40); }
  .score-board { gap: vw(12); }
  .team-block { min-width: vw(140); gap: vw(12); }
  .team-flag { width: vw(60); height: vw(40); }
  .team-name { font-size: vw(26); }
  .score-center { min-width: vw(120); }
  .final-score { font-size: vw(64); gap: vw(16); }
  .sep { font-size: vw(48); }
  .vs-text { font-size: vw(44); }
  .section-title { font-size: vw(36); margin: vw(40) 0 vw(20); }
  .stats-list { padding: vw(24) vw(28); }
  .stat-val { font-size: vw(24); min-width: vw(48); }
  .stat-label { font-size: vw(22); min-width: vw(120); }
  .stat-bar-wrap { height: vw(8); }
  .review-content { padding: vw(32) vw(28); font-size: vw(28); }
}
</style>
