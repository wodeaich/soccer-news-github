<template>
  <section
    v-infinite-scroll="loadMore"
    :infinite-scroll-disabled="loading || endOfList"
    infinite-scroll-distance="0"
  >
    <slot :items="items"></slot>
  </section>
</template>

<script>
export default {
  props: {
    apiEndpoint: {
      type: String,
      default: ""
    },
    initialPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 21
    },
    initialItems: {
      type: Array,
      default: () => []
    },
    modId: {
      type: String,
      default: ""
    }
  },
  data() {
    const isStatic = !this.apiEndpoint;
    const firstBatch = isStatic
      ? this.initialItems.slice(0, this.pageSize)
      : [...this.initialItems];
    return {
      loading: false,
      endOfList: isStatic
        ? this.initialItems.length <= this.pageSize
        : false,
      currentPage: this.initialPage,
      items: firstBatch,
      cursor: isStatic ? this.pageSize : 0
    };
  },
  methods: {
    async loadMore() {
      if (this.loading || this.endOfList) return;

      if (!this.apiEndpoint) {
        this.loading = true;
        const next = this.initialItems.slice(this.cursor, this.cursor + this.pageSize);
        this.items = this.items.concat(next);
        this.cursor += next.length;
        if (next.length < this.pageSize || this.cursor >= this.initialItems.length) {
          this.endOfList = true;
        }
        this.loading = false;
        return;
      }

      this.loading = true;
      try {
        const params = {
          site_id: process.env.SITE_AFS,
          mod_id: this.modId,
          page: this.currentPage,
          size: this.pageSize
        };
        const response = await this.$axios.$get(this.apiEndpoint, { params });
        const newData = response.list;
        this.items = this.items.concat(newData);
        if (newData.length === 0 || newData.length < this.pageSize) {
          this.endOfList = true;
        }
        this.currentPage++;
      } catch (error) {
        console.error("Failed to load more data:", error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
