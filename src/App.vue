<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
  mounted() {
    this.$store.dispatch('initAuth')
  }
})
</script>

<style lang="scss">
</style>
