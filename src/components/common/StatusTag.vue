<template>
  <span :class="['status-tag', statusClass]">
    <slot>{{ label }}</slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'

type StatusType = 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'business_trip' |
                  'success' | 'warning' | 'danger' | 'info' | 'primary'

export default Vue.extend({
  name: 'StatusTag',
  props: {
    status: {
      type: String as () => StatusType,
      default: 'info'
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String as () => StatusType,
      default: ''
    }
  },
  computed: {
    statusClass(): string {
      const s = this.type || this.status
      return s.startsWith('status-') ? s : `status-${s}`
    }
  }
})
</script>

<style lang="scss" scoped>
@use 'sass:map';

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-extra-small;
  font-weight: $font-weight-medium;

  @each $status, $bg in $attendance-status-bg {
    &.status-#{$status} {
      background: $bg;
      color: map.get($status-colors, $status);
    }
  }

  &.status-success {
    background: rgba($color-success, 0.1);
    color: $color-success;
  }

  &.status-warning {
    background: rgba($color-warning, 0.1);
    color: $color-warning;
  }

  &.status-danger {
    background: rgba($color-danger, 0.1);
    color: $color-danger;
  }

  &.status-info {
    background: rgba($color-info, 0.1);
    color: $color-info;
  }

  &.status-primary {
    background: rgba($color-primary, 0.1);
    color: $color-primary;
  }
}
</style>
