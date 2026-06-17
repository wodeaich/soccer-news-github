<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="main container">

      <!-- 顶部精选新闻 -->
      <section v-if="featured.length" class="section-featured">
        <div class="featured-grid">
          <Soccer-NewsCardFeatured :item="featured[0]" class="featured-main" />
          <div class="featured-side">
            <Soccer-NewsCardFeatured
              v-for="(item, i) in featured.slice(1, 3)"
              :key="i"
              :item="item"
              class="featured-side-item"
            />
          </div>
        </div>
      </section>

      <!-- Match Results -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.trending') }}</h2>
          <nuxt-link :to="localePath('/results/')" class="view-all">
            {{ $t('results.allResults') }} →
          </nuxt-link>
        </div>

        <div v-if="results.length" class="result-list">
          <nuxt-link
            v-for="match in results.slice(0, 4)"
            :key="match.id"
            :to="match.slug ? localePath(`/matches/${match.slug}/`) : localePath('/results/')"
            class="result-card"
          >
            <span class="stage">{{ match.stage }}</span>
            <div class="match-row">
              <div class="team home">
                <img
                  v-if="match.home_flag"
                  :src="match.home_flag"
                  :alt="match.home_team"
                  class="flag"
                  @error="e => e.target.style.display='none'"
                />
                <span class="team-name">{{ match.home_team }}</span>
              </div>
              <div class="score-box">
                <span class="score">{{ match.home_score }}</span>
                <span class="sep">-</span>
                <span class="score">{{ match.away_score }}</span>
              </div>
              <div class="team away">
                <span class="team-name">{{ match.away_team }}</span>
                <img
                  v-if="match.away_flag"
                  :src="match.away_flag"
                  :alt="match.away_team"
                  class="flag"
                  @error="e => e.target.style.display='none'"
                />
              </div>
            </div>
            <span class="match-date">{{ formatDate(match.kickoff) }}</span>
          </nuxt-link>
        </div>

        <div v-else class="empty-hint">{{ $t('common.noData') }}</div>
      </section>

      <!-- Standings（首组） -->
      <section v-if="groups.length" class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('home.allArticles') }}</h2>
          <nuxt-link :to="localePath('/standings/')" class="view-all">
            {{ $t('standings.title') }} →
          </nuxt-link>
        </div>

        <div class="standings-wrap">
          <div
            v-for="group in groups.slice(0, 2)"
            :key="group.name"
            class="standings-group"
          >
            <div class="group-name">Group {{ group.name }}</div>
            <table class="standings-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">{{ $t('standings.team') }}</th>
                  <th>{{ $t('standings.played') }}</th>
                  <th>{{ $t('standings.won') }}</th>
                  <th>{{ $t('standings.drawn') }}</th>
                  <th>{{ $t('standings.lost') }}</th>
                  <th class="col-pts">{{ $t('standings.points') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in group.table.slice(0, 4)"
                  :key="row.team"
                  :class="{ qualify: row.rank <= 2 }"
                >
                  <td class="col-rank">{{ row.rank }}</td>
                  <td class="col-team">
                    <img
                      v-if="row.team && row.team.logo"
                      :src="row.team && row.team.logo"
                      :alt="row.team && row.team.name"
                      class="team-logo"
                      @error="e => e.target.style.display='none'"
                    />
                    {{ row.team && row.team.name }}
                  </td>
                  <td>{{ row.played }}</td>
                  <td>{{ row.won }}</td>
                  <td>{{ row.drawn }}</td>
                  <td>{{ row.lost }}</td>
                  <td class="col-pts">{{ row.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <BackTop />
  </div>
</template>

<script>
export default {
  asyncData({ payload }) {
    return payload || { featured: [], results: [], groups: [] }
  },
  methods: {
    formatDate(ts) {
      if (!ts) return ''
      return new Date(ts * 1000).toLocaleDateString(this.$i18n.locale, {
        month: 'short', day: 'numeric'
      })
    }
  },
  head() {
    const desc = 'World Cup 2026 news, schedules, results, standings and live TV guide in 6 languages.'
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CompSoccer',
      url: 'https://compsoccer.com/',
      logo: 'https://compsoccer.com/icons/192.png',
      description: desc
    }
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CompSoccer',
      url: 'https://compsoccer.com/',
      description: desc,
      inLanguage: ['en', 'es', 'pt', 'ar', 'ja', 'ko'],
      publisher: { '@type': 'Organization', name: 'CompSoccer', url: 'https://compsoccer.com/' }
    }
    return {
      title: `CompSoccer - ${this.$t('home.latestNews')}`,
      meta: [
        { hid: 'description', name: 'description', content: desc },
        { hid: 'og:title', property: 'og:title', content: `CompSoccer - ${this.$t('home.latestNews')}` },
        { hid: 'og:description', property: 'og:description', content: 'World Cup 2026 news, schedules, results and live TV guide.' },
        { hid: 'og:type', property: 'og:type', content: 'website' },
        { hid: 'og:site_name', property: 'og:site_name', content: 'CompSoccer' }
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: [
        { hid: 'ld-website', type: 'application/ld+json', innerHTML: JSON.stringify(websiteSchema) },
        { hid: 'ld-organization', type: 'application/ld+json', innerHTML: JSON.stringify(organizationSchema) }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap { background: $bg; min-height: 100vh; }

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.section { margin-top: 40px; }

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-family: "rssb";
  font-size: 22px;
  color: $font1;
  padding-bottom: 8px;
  border-bottom: 2px solid $color1;
  display: inline-block;
}
.view-all {
  font-family: "rssb";
  font-size: 13px;
  color: $color1;
  white-space: nowrap;
  &:hover { text-decoration: underline; }
}

// 精选新闻
.section-featured { margin-top: 24px; }
.featured-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  height: 400px;
}
.featured-main { height: 100%; }
.featured-side { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.featured-side-item { flex: 1; min-height: 0; }

// ─── Match Results ───────────────────────────────────────────
.result-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.result-card {
  display: block;
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
}

.stage {
  display: block;
  font-size: 11px;
  color: rgba($font1, 0.45);
  font-family: "rssb";
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.match-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.team {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  &.away { justify-content: flex-end; }
}
.flag {
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}
.team-name {
  font-family: "rssb";
  font-size: 15px;
  color: $font1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: $font1;
  border-radius: 8px;
  padding: 5px 14px;
  flex-shrink: 0;
}
.score {
  font-family: "rssb";
  font-size: 20px;
  color: #fff;
  line-height: 1;
}
.sep { font-size: 16px; color: rgba(#fff, 0.5); }

.match-date {
  font-size: 11px;
  color: rgba($font1, 0.4);
  display: block;
  text-align: right;
}

.empty-hint {
  color: rgba($font1, 0.4);
  font-size: 14px;
  text-align: center;
  padding: 40px 0;
}

// ─── Standings ───────────────────────────────────────────────
.standings-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.standings-group {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.group-name {
  font-family: "rssb";
  font-size: 13px;
  color: #fff;
  background: $font1;
  padding: 8px 16px;
  letter-spacing: 0.5px;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  thead tr {
    background: rgba($font1, 0.04);
  }
  th {
    padding: 8px 10px;
    font-family: "rssb";
    font-size: 12px;
    color: rgba($font1, 0.5);
    text-align: center;
    white-space: nowrap;
  }
  td {
    padding: 9px 10px;
    text-align: center;
    color: $font1;
    border-top: 1px solid rgba($font1, 0.06);
  }
  tr.qualify td { background: rgba($color1, 0.04); }
}

.col-rank { width: 28px; }
.col-team {
  text-align: left !important;
  display: flex;
  align-items: center;
  gap: 6px;
}
td.col-team {
  display: table-cell;
  white-space: nowrap;
}
.team-logo {
  width: 20px;
  height: 20px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 4px;
}
.col-pts {
  font-family: "rssb";
  font-weight: bold;
  color: $font1 !important;
}

// ─── Responsive ──────────────────────────────────────────────
@media screen and (max-width: 900px) {
  .result-list { grid-template-columns: 1fr; }
  .standings-wrap { grid-template-columns: 1fr; }
}

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .section { margin-top: vw(48); }
  .section-title { font-size: vw(36); }
  .view-all { font-size: vw(24); }

  .featured-grid {
    grid-template-columns: 1fr;
    height: auto;
    gap: vw(24);
  }
  .featured-main { height: vw(360); }
  .featured-side { flex-direction: row; height: vw(200); }

  .result-card { padding: vw(24) vw(28); border-radius: vw(16); }
  .team-name { font-size: vw(26); }
  .score-box { padding: vw(8) vw(18); border-radius: vw(12); }
  .score { font-size: vw(34); }
  .flag { width: vw(40); height: vw(28); }

  .standings-table { font-size: vw(22); }
  .standings-table th, .standings-table td { padding: vw(10) vw(8); }
  .team-logo { width: vw(28); height: vw(28); }
}
</style>
