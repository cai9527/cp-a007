<template>
  <div class="batch-actions" v-if="visible">
    <slot></slot>
    <span v-if="countText" class="selected-count">{{ countText }}</span>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'BatchActions',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    count: {
      type: Number,
      default: 0
    },
    countLabel: {
      type: String,
      default: '已选择'
    }
  },
  computed: {
    countText(): string {
      return this.count > 0 ? `${this.countLabel} ${this.count} 条记录` : ''
    }
  }
})
</script>

<style lang="scss" scoped>
.batch-actions {
  @include flex-start;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-base;
  margin-bottom: $spacing-base;
  background: linear-gradient(90deg, rgba($color-primary, 0.08), transparent);
  border-radius: $radius-base;
  border-left: 3px solid $color-primary;

  .selected-count {
    margin-left: auto;
    font-size: $font-size-small;
    color: $text-secondary;
  }
}
</style>
