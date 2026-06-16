<template>
  <div class="stat-card" @click="$emit('click', $event)">
    <i v-if="icon" :class="['stat-icon', icon]" :style="iconStyle"></i>
    <div class="stat-label">{{ label }}</div>
    <div :class="['stat-value', typeClass]">{{ displayValue }}</div>
    <div v-if="$slots.footer || footer" class="stat-footer">
      <slot name="footer">{{ footer }}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

type StatType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'total' | 'active' | 'pending' | 'expired' | 'expiring' | 'renew'

export default Vue.extend({
  name: 'StatCard',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      default: 0
    },
    suffix: {
      type: String,
      default: ''
    },
    type: {
      type: String as () => StatType,
      default: 'primary'
    },
    icon: {
      type: String,
      default: ''
    },
    iconColor: {
      type: String,
      default: ''
    },
    footer: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayValue(): string | number {
      return this.suffix ? `${this.value}${this.suffix}` : this.value
    },
    typeClass(): StatType {
      return this.type
    },
    iconStyle(): Record<string, string> {
      return this.iconColor ? { color: this.iconColor } : {}
    }
  }
})
</script>
