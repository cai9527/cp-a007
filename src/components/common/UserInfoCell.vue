<template>
  <div :class="['user-info-cell', { clickable: $listeners.click }]" @click="$emit('click', $event)">
    <AvatarPlaceholder :name="name" :size="avatarSize" />
    <div class="user-detail">
      <div class="user-name">
        <slot name="name">{{ name }}</slot>
      </div>
      <div v-if="subLabel || $slots.sub" class="user-sub">
        <slot name="sub">{{ subLabel }}</slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import AvatarPlaceholder from './AvatarPlaceholder.vue'

type AvatarSize = 'mini' | 'small' | 'medium' | 'large'

export default Vue.extend({
  name: 'UserInfoCell',
  components: { AvatarPlaceholder },
  props: {
    name: {
      type: String,
      default: ''
    },
    subLabel: {
      type: String,
      default: ''
    },
    avatarSize: {
      type: String as () => AvatarSize,
      default: 'small'
    }
  }
})
</script>

<style lang="scss" scoped>
.user-info-cell {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &.clickable {
    cursor: pointer;
    transition: opacity $transition-fast;

    &:hover {
      opacity: 0.8;
    }
  }

  .user-detail {
    display: flex;
    flex-direction: column;
    min-width: 0;

    .user-name {
      font-size: $font-size-base;
      color: $text-primary;
      font-weight: $font-weight-medium;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-sub {
      font-size: $font-size-extra-small;
      color: $text-secondary;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
