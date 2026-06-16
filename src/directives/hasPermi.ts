import Vue from 'vue'
import store from '@/store'
import { hasPermission } from '@/utils'

export const hasPermi = Vue.directive('hasPermi', {
  bind(el: HTMLElement, binding) {
    const { value } = binding
    const permissions = store.state.permissions

    if (value && value instanceof Array && value.length > 0) {
      const has = value.some(p => hasPermission(permissions, p))
      if (!has) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string' && value) {
      if (!hasPermission(permissions, value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`v-hasPermi 需要权限标识，例如 v-hasPermi="'user:view'" 或 v-hasPermi="['user:view', 'user:edit']"`)
    }
  },
  inserted(el: HTMLElement, binding) {
    const { value } = binding
    const permissions = store.state.permissions

    if (value && value instanceof Array && value.length > 0) {
      const has = value.some(p => hasPermission(permissions, p))
      if (!has) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string' && value) {
      if (!hasPermission(permissions, value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  },
  update(el: HTMLElement, binding) {
    const { value } = binding
    const permissions = store.state.permissions

    if (value && value instanceof Array && value.length > 0) {
      const has = value.some(p => hasPermission(permissions, p))
      if (!has) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string' && value) {
      if (!hasPermission(permissions, value)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
})

export const hasRole = Vue.directive('hasRole', {
  bind(el: HTMLElement, binding) {
    const { value } = binding
    const user = store.state.user

    if (!user) {
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    if (value && value instanceof Array && value.length > 0) {
      if (!value.includes(user.role)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string' && value) {
      if (user.role !== value) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`v-hasRole 需要角色标识，例如 v-hasRole="'super_admin'" 或 v-hasRole="['super_admin', 'hr_admin']"`)
    }
  },
  inserted(el: HTMLElement, binding) {
    const { value } = binding
    const user = store.state.user

    if (!user) {
      el.parentNode && el.parentNode.removeChild(el)
      return
    }

    if (value && value instanceof Array && value.length > 0) {
      if (!value.includes(user.role)) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string' && value) {
      if (user.role !== value) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
})

export function setupDirectives() {
  Vue.directive('hasPermi', hasPermi)
  Vue.directive('hasRole', hasRole)
}

export default setupDirectives
