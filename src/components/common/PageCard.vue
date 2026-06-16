<template>
  <div class="page-card">
    <div v-if="title || $slots.header" class="page-header">
      <h2 v-if="title">{{ title }}</h2>
      <slot name="header" v-else></slot>
      <div v-if="$slots['header-actions']" class="header-actions">
        <slot name="header-actions"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'PageCard',
  props: {
    title: {
      type: String,
      default: ''
    }
  }
})
</script>
