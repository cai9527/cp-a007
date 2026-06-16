import Vue from 'vue'
import Vuex from 'vuex'
import type { RouteConfig } from 'vue-router'
import type { User, DashboardStats } from '@/types'
import { getCurrentUser, logout as apiLogout } from '@/api/auth'
import { getDashboardStats } from '@/api/report'
import { getPermissionsByRole, hasPermission } from '@/utils'

Vue.use(Vuex)

export interface RootState {
  user: User | null
  token: string | null
  loading: boolean
  dashboardStats: DashboardStats | null
  permissions: string[]
  addRoutes: RouteConfig[]
}

export default new Vuex.Store<RootState>({
  state: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    dashboardStats: null,
    permissions: [],
    addRoutes: []
  },
  mutations: {
    SET_USER(state, user: User | null) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    SET_TOKEN(state, token: string | null) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },
    SET_DASHBOARD_STATS(state, stats: DashboardStats) {
      state.dashboardStats = stats
    },
    SET_PERMISSIONS(state, permissions: string[]) {
      state.permissions = permissions
    },
    SET_ADD_ROUTES(state, routes: RouteConfig[]) {
      state.addRoutes = routes
    }
  },
  actions: {
    async initAuth({ commit }) {
      const token = localStorage.getItem('token')
      if (!token) return
      commit('SET_TOKEN', token)
      try {
        const user = await getCurrentUser()
        commit('SET_USER', user)
        const permissions = getPermissionsByRole(user.role)
        commit('SET_PERMISSIONS', permissions)
      } catch {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
        commit('SET_PERMISSIONS', [])
        commit('SET_ADD_ROUTES', [])
      }
    },
    async login({ commit }, payload: { user: User; token: string }) {
      commit('SET_USER', payload.user)
      commit('SET_TOKEN', payload.token)
      const permissions = getPermissionsByRole(payload.user.role)
      commit('SET_PERMISSIONS', permissions)
    },
    async logout({ commit }) {
      await apiLogout()
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
      commit('SET_DASHBOARD_STATS', null)
      commit('SET_PERMISSIONS', [])
      commit('SET_ADD_ROUTES', [])
    },
    async loadDashboardStats({ commit }) {
      const stats = await getDashboardStats()
      commit('SET_DASHBOARD_STATS', stats)
    }
  },
  getters: {
    isLoggedIn: state => !!state.token,
    isSuperAdmin: state => state.user?.role === 'super_admin',
    isAdmin: state => state.user?.role === 'super_admin' || state.user?.role === 'admin',
    isManager: state => state.user?.role === 'super_admin' || state.user?.role === 'admin' || state.user?.role === 'manager',
    isEmployee: state => state.user?.role === 'employee',
    isSalaryAdmin: state => state.user?.role === 'super_admin' || state.user?.role === 'hr_admin',
    hasPermission: state => (permission: string) => {
      return hasPermission(state.permissions, permission)
    }
  }
})
