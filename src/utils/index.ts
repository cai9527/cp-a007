import dayjs from 'dayjs'
import type { UserRole, AttendanceStatus, LeaveType, LeaveStatus, Role } from '@/types'
import { mockRoles } from '@/data/mockData'
import type { RouteConfig } from 'vue-router'

export const roleMap: Record<UserRole, string> = {
  super_admin: '超级管理员',
  admin: '系统管理员',
  hr_admin: 'HR管理员',
  manager: '部门管理员',
  employee: '普通员工'
}

export const statusMap: Record<AttendanceStatus, string> = {
  normal: '正常',
  late: '迟到',
  early: '早退',
  absent: '缺勤',
  leave: '请假',
  business_trip: '出差'
}

export const leaveTypeMap: Record<LeaveType, string> = {
  annual: '年假',
  sick: '病假',
  personal: '事假',
  maternity: '产假',
  paternity: '陪产假',
  marriage: '婚假',
  funeral: '丧假'
}

export const leaveStatusMap: Record<LeaveStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝'
}

export const alertTypeMap: Record<string, string> = {
  late: '迟到预警',
  early: '早退预警',
  absent: '缺勤预警',
  continuous_absent: '连续缺勤预警'
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  return dayjs(date).format('HH:mm:ss')
}

export function getInitials(name: string): string {
  if (!name) return '?'
  return name.charAt(0)
}

export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 8) return idCard
  return idCard.slice(0, 6) + '********' + idCard.slice(-4)
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function isValidIdCard(idCard: string): boolean {
  return /^\d{17}[\dXx]$/.test(idCard)
}

export function calcWorkDays(startDate: string, endDate: string): number {
  let count = 0
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  for (let d = start; d.isBefore(end.add(1, 'day')); d = d.add(1, 'day')) {
    const dayOfWeek = d.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++
  }
  return count
}

export function getRoleByCode(code: UserRole): Role | undefined {
  return mockRoles.find(r => r.code === code)
}

export function getPermissionsByRole(roleCode: UserRole): string[] {
  const role = getRoleByCode(roleCode)
  return role?.permissions || []
}

export function hasPermission(permissions: string[], requiredPermission: string): boolean {
  if (permissions.includes('*')) return true
  if (permissions.includes(requiredPermission)) return true
  const requiredPrefix = requiredPermission.split(':')[0]
  const requiredAction = requiredPermission.split(':')[1]
  if (permissions.includes(`${requiredPrefix}:${requiredAction}`)) return true
  if (permissions.includes(`${requiredPrefix}:view`) && requiredAction === 'view') return true
  if (permissions.includes(`${requiredPrefix}:view:self`) && requiredPermission.endsWith(':view:self')) return true
  if (permissions.includes(`${requiredPrefix}:view`)) {
    if (requiredPermission.endsWith(':view:self')) return true
  }
  return false
}

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole)
}

export function filterRoutesByPermission(
  routes: RouteConfig[],
  userRole: UserRole,
  permissions: string[]
): RouteConfig[] {
  return routes.filter(route => {
    if (route.meta?.public) return true
    if (route.meta?.hidden) return true
    const requiredRoles = route.meta?.roles as UserRole[] | undefined
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      return false
    }
    const requiredPermission = route.meta?.permission as string | undefined
    if (requiredPermission && !hasPermission(permissions, requiredPermission)) {
      return false
    }
    if (route.children && route.children.length > 0) {
      const filteredChildren = filterRoutesByPermission([...route.children], userRole, permissions)
      ;(route as any)._filteredChildren = filteredChildren
    }
    return true
  }).map(route => {
    if ((route as any)._filteredChildren) {
      const result = { ...route, children: (route as any)._filteredChildren }
      delete (result as any)._filteredChildren
      return result
    }
    return route
  })
}

export function generateMenuRoutes(routes: RouteConfig[]): RouteConfig[] {
  const mainRoute = routes.find(r => r.path === '/')
  if (!mainRoute || !mainRoute.children) return []
  return mainRoute.children.filter(route => !route.meta?.hidden)
}
