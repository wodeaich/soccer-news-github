<template>
  <div class="page-wrap">
    <Afs-Header :lang="$i18n.locale" />

    <main class="container">
      <h1 class="page-title">{{ $t('standings.title') }}</h1>

      <!-- 顶部广告 -->
      <adm-slot-preload
        class="ad-block"
        adm-id="standings-top"
        adm-unit="/23197833490/soccerins/soccerins_home_1"
        ads-slot="6667048681"
      />

      <!-- 无数据状态 -->
      <div v-if="!groups.length" class="empty">
        <div class="empty-icon">📊</div>
        <p class="empty-text">{{ $t('common.noData') }}</p>
      </div>

      <!-- 有数据时展示 -->
      <div v-else>
        <!-- 组别 Tab -->
        <div class="group-tabs">
          <button
            v-for="group in groups"
            :key="group.name"
            class="group-tab"
            :class="{ active: activeGroup === group.name }"
            @click="activeGroup = group.name"
          >
            {{ $t('standings.allGroups') === activeGroup ? $t('standings.allGroups') : '' }}
            {{ groupLabel(group.name) }}
          </button>
        </div>

        <!-- 当前分组积分表 -->
        <div v-if="currentGroup" class="standings-block">
          <div class="group-title">{{ groupLabel(currentGroup.name) }}</div>
          <div class="table-wrap">
            <table class="standings-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">{{ $t('standings.team') }}</th>
                  <th>{{ $t('standings.played') }}</th>
                  <th>{{ $t('standings.won') }}</th>
                  <th>{{ $t('standings.drawn') }}</th>
                  <th>{{ $t('standings.lost') }}</th>
                  <th>{{ $t('standings.goalsFor') }}</th>
                  <th>{{ $t('standings.goalsAgainst') }}</th>
                  <th>{{ $t('standings.goalDiff') }}</th>
                  <th class="col-pts">{{ $t('standings.points') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(team, i) in currentGroup.table"
                  :key="team.team"
                  :class="{ qualify: i < 2, danger: i >= currentGroup.table.length - 1 }"
                >
                  <td class="col-rank">{{ team.rank || i + 1 }}</td>
                  <td class="col-team">
                    <img
                      v-if="team.team && team.team.logo"
                      :src="team.team.logo"
                      :alt="team.team.name"
                      class="team-flag"
                    />
                    <span class="team-name">{{ team.team && team.team.name }}</span>
                  </td>
                  <td>{{ team.played }}</td>
                  <td>{{ team.won }}</td>
                  <td>{{ team.drawn }}</td>
                  <td>{{ team.lost }}</td>
                  <td>{{ team.goals_for }}</td>
                  <td>{{ team.goals_against }}</td>
                  <td :class="team.goal_diff > 0 ? 'gd-pos' : team.goal_diff < 0 ? 'gd-neg' : ''">
                    {{ team.goal_diff > 0 ? '+' : '' }}{{ team.goal_diff }}
                  </td>
                  <td class="col-pts">{{ team.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 说明图例 -->
          <div class="legend">
            <span class="legend-item qualify-dot">▪ {{ qualifyText }}</span>
            <span class="legend-item danger-dot">▪ {{ eliminationText }}</span>
          </div>
        </div>
      </div>

      <!-- 通栏广告 -->
      <adm-slot-full
        class="ad-block"
        adm-id="standings-full"
        adm-unit="/23197833490/soccerins/soccerins_home_full"
        ads-slot="4080715115"
      />
    </main>

    <Afs-Footer :lang="$i18n.locale" />
    <AdLoading />
    <BackTop />
  </div>
</template>

<script>
const QUALIFY_TEXT = { en: 'Advance to Round of 16', es: 'Pasa a Octavos', pt: 'Avança às Oitavas', ar: 'يتأهل لدور الـ16', ja: '決勝トーナメント進出', ko: '16강 진출' }
const ELIM_TEXT    = { en: 'Elimination zone', es: 'Zona de eliminación', pt: 'Zona de eliminação', ar: 'منطقة الإقصاء', ja: '敗退圏', ko: '탈락권' }

export default {
  asyncData({ payload }) {
    return payload || { groups: [], activeGroup: '' }
  },
  data() {
    return { activeGroup: '' }
  },
  computed: {
    currentGroup() {
      return this.groups.find(g => g.name === this.activeGroup) || null
    },
    qualifyText() {
      return QUALIFY_TEXT[this.$i18n.locale] || QUALIFY_TEXT.en
    },
    eliminationText() {
      return ELIM_TEXT[this.$i18n.locale] || ELIM_TEXT.en
    }
  },
  methods: {
    groupLabel(name) {
      return `Group ${name}`
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
        { '@type': 'ListItem', position: 2, name: this.$t('standings.title'), item: `https://compsoccer.com/${locale}/standings/` }
      ]
    }
    return {
      htmlAttrs: { lang: locale, dir: locale === 'ar' ? 'rtl' : 'ltr' },
      title: `${this.$t('standings.title')} - CompSoccer`,
      meta: [
        { hid: 'description', name: 'description', content: 'World Cup 2026 group standings. Live table with points, goals and qualification status.' },
        { hid: 'og:title', property: 'og:title', content: `${this.$t('standings.title')} - CompSoccer` },
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
  padding-inline-start: 12px;
  border-inline-start: 4px solid $color1;
}

.empty {
  text-align: center;
  padding: 80px 0;
}
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-text { font-size: 16px; color: rgba($font1, 0.5); font-family: "rs"; }

.group-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.group-tab {
  padding: 7px 16px;
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

.standings-block { margin-bottom: 32px; }

.group-title {
  font-family: "rssb";
  font-size: 16px;
  color: $font1;
  margin-bottom: 12px;
  padding-inline-start: 10px;
  border-inline-start: 3px solid $color1;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.standings-table {
  width: 100%;
  background: #fff;
  border-collapse: collapse;
  font-family: "rs";
  font-size: 14px;

  thead tr {
    background: $font1;
    color: #fff;
  }
  th {
    padding: 12px 10px;
    text-align: center;
    font-family: "rssb";
    font-size: 12px;
    white-space: nowrap;
  }
  td {
    padding: 11px 10px;
    text-align: center;
    color: $font1;
    border-bottom: 1px solid #f0f2f5;
  }
  tbody tr {
    transition: background 0.15s;
    &:hover { background: rgba($color1, 0.05); }
    &:last-child td { border-bottom: none; }
    &.qualify td { border-inline-start: 3px solid $color1; }
    &.danger td { border-inline-start: 3px solid #ff5a5a; }
  }
}

.col-rank { width: 36px; font-family: "rssb"; }
.col-team { text-align: left !important; min-width: 140px; }
.col-pts { font-family: "rssb"; font-size: 15px !important; color: $color1 !important; }

.team-flag { width: 24px; height: 16px; object-fit: cover; border-radius: 2px; vertical-align: middle; margin-right: 8px; }
.team-name { font-family: "rssb"; vertical-align: middle; }

.gd-pos { color: #2ec05a; font-family: "rssb"; }
.gd-neg { color: #ff5a5a; font-family: "rssb"; }

.legend {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  padding-left: 4px;
}
.legend-item {
  font-size: 12px;
  color: rgba($font1, 0.5);
  font-family: "rs";
}
.qualify-dot { color: $color1; }
.danger-dot  { color: #ff5a5a; }

.ad-block { margin: 28px 0; }

@media screen and (max-width: 750px) {
  .container { padding: 0 vw(46) vw(80); }
  .page-title { font-size: vw(42); margin: vw(32) 0 vw(24); }
  .group-tabs { gap: vw(12); margin-bottom: vw(32); }
  .group-tab { padding: vw(12) vw(24); font-size: vw(22); border-radius: vw(32); }
  .standings-table {
    th, td { padding: vw(16) vw(8); font-size: vw(22); }
  }
  .col-pts { font-size: vw(24) !important; }
  .team-flag { width: vw(32); height: vw(22); margin-right: vw(8); }
  .legend { gap: vw(24); }
  .legend-item { font-size: vw(20); }
}
</style>
