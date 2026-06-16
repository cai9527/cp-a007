import type { RouteConfig } from 'vue-router'

export const asyncRoutes: RouteConfig[] = [
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
        meta: { title: '考勤打卡', icon: 'el-icon-time', permission: 'attendance:view:self' }
      },
      {
        path: 'leaves',
        name: 'LeaveManagement',
        component: () => import('@/views/LeaveManagement.vue'),
        meta: { title: '请假管理', icon: 'el-icon-document', permission: 'leave:view:self' }
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
        meta: { title: '报表中心', icon: 'el-icon-s-marketing', permission: 'report:view:self' }
      },
      {
        path: 'contract/list',
        name: 'ContractList',
        component: () => import('@/views/ContractList.vue'),
        meta: { title: '合同列表', icon: 'el-icon-document-copy', permission: 'contract:view', roles: ['super_admin', 'hr_admin'], group: 'contract' }
      },
      {
        path: 'contract/templates',
        name: 'ContractTemplates',
        component: () => import('@/views/ContractTemplates.vue'),
        meta: { title: '合同模板管理', icon: 'el-icon-tickets', permission: 'contract:template:view', roles: ['super_admin', 'hr_admin'], group: 'contract' }
      },
      {
        path: 'contract/approval',
        name: 'ContractApproval',
        component: () => import('@/views/ContractApproval.vue'),
        meta: { title: '合同审核', icon: 'el-icon-edit-outline', permission: 'contract:approval', roles: ['super_admin', 'hr_admin'], group: 'contract' }
      },
      {
        path: 'contract/reminders',
        name: 'ContractReminders',
        component: () => import('@/views/ContractReminders.vue'),
        meta: { title: '到期提醒', icon: 'el-icon-bell', permission: 'contract:reminder', roles: ['super_admin', 'hr_admin'], group: 'contract' }
      },
      {
        path: 'contract/create',
        name: 'ContractCreate',
        component: () => import('@/views/ContractForm.vue'),
        meta: { title: '新建合同', hidden: true, permission: 'contract:create', roles: ['super_admin', 'hr_admin'] }
      },
      {
        path: 'contract/edit/:id',
        name: 'ContractEdit',
        component: () => import('@/views/ContractForm.vue'),
        meta: { title: '编辑合同', hidden: true, permission: 'contract:edit', roles: ['super_admin', 'hr_admin'] }
      },
      {
        path: 'contract/detail/:id',
        name: 'ContractDetail',
        component: () => import('@/views/ContractDetail.vue'),
        meta: { title: '合同详情', hidden: true, permission: 'contract:view', roles: ['super_admin', 'hr_admin'] }
      },
      {
        path: 'salary/items',
        name: 'SalaryItems',
        component: () => import('@/views/SalaryItems.vue'),
        meta: { title: '工资项目配置', icon: 'el-icon-s-order', permission: 'salary:item:view', roles: ['super_admin', 'hr_admin'], group: 'salary' }
      },
      {
        path: 'salary/calculation',
        name: 'SalaryCalculation',
        component: () => import('@/views/SalaryCalculation.vue'),
        meta: { title: '薪资计算', icon: 'el-icon-s-finance', permission: 'salary:calculate', roles: ['super_admin', 'hr_admin'], group: 'salary' }
      },
      {
        path: 'salary/statistics',
        name: 'SalaryStatistics',
        component: () => import('@/views/SalaryStatistics.vue'),
        meta: { title: '工资统计分析', icon: 'el-icon-s-data', permission: 'salary:statistics:view', roles: ['super_admin', 'hr_admin'], group: 'salary' }
      },
      {
        path: 'salary/report',
        name: 'SalaryReport',
        component: () => import('@/views/SalaryReport.vue'),
        meta: { title: '工资报表', icon: 'el-icon-document', permission: 'salary:report:view', roles: ['super_admin', 'hr_admin'], group: 'salary' }
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

export const groupConfig: Record<string, { title: string; icon: string }> = {
  contract: { title: '合同管理', icon: 'el-icon-document' },
  salary: { title: '工资管理', icon: 'el-icon-money' }
}

export const constantRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true, title: '登录' }
  }
]
