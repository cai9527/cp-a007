import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'
import { constantRoutes, asyncRoutes } from './asyncRoutes'
import { getPermissionsByRole, filterRoutesByPermission, hasPermission } from '@/utils'
import type { UserRole } from '@/types'

Vue.use(VueRouter)

const createRouter = () => new VueRouter({
  mode: 'history',
  routes: constantRoutes
})

let router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export function generateRoutes(userRole: UserRole): RouteConfig[] {
  const permissions = getPermissionsByRole(userRole)
  return filterRoutesByPermission(asyncRoutes, userRole, permissions)
}

export function addDynamicRoutes(userRole: UserRole) {
  const accessRoutes = generateRoutes(userRole)
  accessRoutes.forEach(route => {
    router.addRoute(route)
  })
  return accessRoutes
}

const SALARY_MODULE_PATHS = [
  '/salary/items',
  '/salary/calculation',
  '/salary/statistics',
  '/salary/report'
]
const SALARY_ALLOWED_ROLES: UserRole[] = ['super_admin', 'hr_admin']

router.beforeEach(async (to, from, next) => {
  try {
    const token = localStorage.getItem('token')

    if (to.meta.public) {
      if (token) {
        next('/dashboard')
      } else {
        next()
      }
      return
    }

    if (!token) {
      next('/login')
      return
    }

    let user = store.state.user
    if (!user) {
      try {
        await store.dispatch('initAuth')
        user = store.state.user
      } catch (e) {
        console.error('initAuth error:', e)
        next('/login')
        return
      }
      if (!user) {
        next('/login')
        return
      }
    }

    const isSalaryPath = SALARY_MODULE_PATHS.some(p => to.path.startsWith(p))
    if (isSalaryPath) {
      if (!user.role || !SALARY_ALLOWED_ROLES.includes(user.role as UserRole)) {
        console.warn(`[Salary Module] Access denied for user ${user.username} (role: ${user.role}) to path: ${to.path}`)
        next('/dashboard')
        return
      }
      if (!store.getters.isSalaryAdmin) {
        console.warn(`[Salary Module] isSalaryAdmin check failed for user ${user.username}`)
        next('/dashboard')
        return
      }
    }

    if (!store.state.addRoutes || store.state.addRoutes.length === 0) {
      resetRouter()
      const userRole = user.role as UserRole
      const accessRoutes = addDynamicRoutes(userRole)
      store.commit('SET_ADD_ROUTES', accessRoutes)
      next({ ...to, replace: true })
      return
    }

    const userRole = user.role
    const requiredRoles = to.meta.roles as string[] | undefined
    if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
      console.warn(`Access denied for route ${to.path}: role ${userRole} not in ${requiredRoles}`)
      next('/dashboard')
      return
    }

    const requiredPermission = to.meta.permission as string | undefined
    if (requiredPermission && !hasPermission(store.state.permissions, requiredPermission)) {
      console.warn(`Access denied for route ${to.path}: missing permission ${requiredPermission}`)
      next('/dashboard')
      return
    }

    next()
  } catch (error) {
    console.error('Router guard error:', error)
    next('/dashboard')
  }
})

export default router
