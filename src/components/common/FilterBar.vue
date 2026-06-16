<template>
  <div class="filter-bar">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'FilterBar'
})
</script>
