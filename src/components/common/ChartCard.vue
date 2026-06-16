<template>
  <div class="page-card chart-card">
    <div v-if="title || $slots.header" class="chart-header">
      <h3 v-if="title">{{ title }}</h3>
      <slot v-else name="header"></slot>
      <div v-if="$slots['header-extra']" class="header-extra">
        <slot name="header-extra"></slot>
      </div>
    </div>
    <div :class="['chart-container', { [`chart-height-${height}`]: true }]" :style="customStyle" ref="chartRef">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type ChartHeight = 'sm' | 'md' | 'lg' | 'xl'

export default Vue.extend({
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    height: {
      type: String as () => ChartHeight,
      default: 'md'
    },
    customHeight: {
      type: [Number, String],
      default: ''
    }
  },
  computed: {
    customStyle(): Record<string, string> {
      if (!this.customHeight) return {}
      const h = typeof this.customHeight === 'number' ? `${this.customHeight}px` : this.customHeight
      return { height: h }
    }
  }
})
</script>

<style lang="scss" scoped>
.chart-card {
  padding: $spacing-xl;

  .chart-header {
    @include flex-between;
    margin-bottom: $spacing-base;

    h3 {
      font-size: $font-size-medium;
      font-weight: $font-weight-semi-bold;
      margin: 0;
      color: $text-primary;
    }

    .header-extra {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
    }
  }

  .chart-container {
    width: 100%;
    position: relative;

    &.chart-height-sm { height: 250px; }
    &.chart-height-md { height: 350px; }
    &.chart-height-lg { height: 450px; }
    &.chart-height-xl { height: 550px; }
  }
}
</style>
