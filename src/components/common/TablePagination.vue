<template>
  <div class="table-pagination-wrapper">
    <slot></slot>
    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination
        :current-page.sync="currentPage"
        :page-sizes="pageSizes"
        :page-size.sync="pageSize"
        :total="total"
        :layout="layout"
        :background="background"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'TablePagination',
  props: {
    page: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    pageSizes: {
      type: Array as () => number[],
      default: () => [10, 20, 50, 100]
    },
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    background: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentPage: this.page
    }
  },
  watch: {
    page(val: number) {
      this.currentPage = val
    }
  },
  methods: {
    handleSizeChange(size: number) {
      this.$emit('update:pageSize', size)
      this.$emit('size-change', size)
      this.$emit('change', { page: this.currentPage, pageSize: size })
    },
    handlePageChange(pg: number) {
      this.$emit('update:page', pg)
      this.$emit('current-change', pg)
      this.$emit('change', { page: pg, pageSize: this.pageSize })
    }
  }
})
</script>
