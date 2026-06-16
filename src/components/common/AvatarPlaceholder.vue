<template>
  <span :class="['avatar-placeholder', sizeClass]" :style="containerStyle">
    <slot>{{ initials }}</slot>
  </span>
</template>

<script lang="ts">
import Vue from 'vue'
import { getInitials } from '@/utils'

type AvatarSize = 'mini' | 'small' | 'medium' | 'large'

export default Vue.extend({
  name: 'AvatarPlaceholder',
  props: {
    name: {
      type: String,
      default: ''
    },
    size: {
      type: String as () => AvatarSize,
      default: 'medium'
    },
    color: {
      type: String,
      default: ''
    },
    bgColor: {
      type: String,
      default: ''
    }
  },
  computed: {
    initials(): string {
      if (this.$slots.default) return ''
      return this.name ? getInitials(this.name) : '?'
    },
    sizeClass(): string {
      return `avatar-${this.size}`
    },
    containerStyle(): Record<string, string> {
      const style: Record<string, string> = {}
      if (this.color) style.color = this.color
      if (this.bgColor) style.background = this.bgColor
      return style
    }
  }
})
</script>

<style lang="scss" scoped>
.avatar-placeholder {
  @include flex-center;
  display: inline-flex;
  color: #fff;
  font-weight: $font-weight-semi-bold;
  flex-shrink: 0;
  border-radius: $radius-circle;
  background: linear-gradient(135deg, $color-primary, #36cfc9);

  &.avatar-mini {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }

  &.avatar-small {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  &.avatar-medium {
    width: 40px;
    height: 40px;
    font-size: $font-size-base;
  }

  &.avatar-large {
    width: 48px;
    height: 48px;
    font-size: 18px;
  }
}
</style>
