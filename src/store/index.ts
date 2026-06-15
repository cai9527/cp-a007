import Vue from 'vue'
import Vuex from 'vuex'
import type { User, DashboardStats } from '@/types'
import { getCurrentUser, logout as apiLogout } from '@/api/auth'
import { getDashboardStats } from '@/api/report'

Vue.use(Vuex)

export interface RootState {
  user: User | null
  token: string | null
  loading: boolean
  dashboardStats: DashboardStats | null
}

export default new Vuex.Store<RootState>({
  state: {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    dashboardStats: null
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
      } catch {
        commit('SET_TOKEN', null)
        commit('SET_USER', null)
      }
    },
    async login({ commit }, payload: { user: User; token: string }) {
      commit('SET_USER', payload.user)
      commit('SET_TOKEN', payload.token)
    },
    async logout({ commit }) {
      await apiLogout()
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
      commit('SET_DASHBOARD_STATS', null)
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
    isEmployee: state => state.user?.role === 'employee'
  }
})
