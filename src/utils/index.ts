import dayjs from 'dayjs'
import type { UserRole, AttendanceStatus, LeaveType, LeaveStatus } from '@/types'

export const roleMap: Record<UserRole, string> = {
  super_admin: '超级管理员',
  admin: '系统管理员',
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
