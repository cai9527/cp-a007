import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true, title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'el-icon-s-data', permission: 'dashboard' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'el-icon-user', permission: 'user:view', roles: ['super_admin', 'admin', 'manager'] }
      },
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/Attendance.vue'),
        meta: { title: '考勤打卡', icon: 'el-icon-time', permission: 'attendance:view' }
      },
      {
        path: 'leaves',
        name: 'LeaveManagement',
        component: () => import('@/views/LeaveManagement.vue'),
        meta: { title: '请假管理', icon: 'el-icon-document', permission: 'leave:view' }
      },
      {
        path: 'alerts',
        name: 'AlertCenter',
        component: () => import('@/views/AlertCenter.vue'),
        meta: { title: '异常预警', icon: 'el-icon-warning', permission: 'alert', roles: ['super_admin', 'admin', 'manager'] }
      },
      {
        path: 'reports',
        name: 'ReportCenter',
        component: () => import('@/views/ReportCenter.vue'),
        meta: { title: '报表中心', icon: 'el-icon-s-marketing', permission: 'report:view' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置', icon: 'el-icon-setting', permission: 'settings:view', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'settings/roles',
        name: 'RoleManagement',
        component: () => import('@/views/RoleManagement.vue'),
        meta: { title: '角色权限管理', icon: 'el-icon-lock', permission: 'role:view', roles: ['super_admin', 'admin'] }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', hidden: true }
      }
    ]
  },
  {
    path: '*',
    redirect: '/dashboard'
  }
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach(async (to, from, next) => {
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

  if (!store.state.user) {
    await store.dispatch('initAuth')
    if (!store.state.user) {
      next('/login')
      return
    }
  }

  const userRole = store.state.user?.role
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(userRole!)) {
    next('/dashboard')
    return
  }

  next()
})

export default router
