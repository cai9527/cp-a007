import dayjs from 'dayjs'
import type {
  Attendance,
  PaginationParams,
  PaginatedResponse,
  LeaveApplication,
  AttendanceRule,
  WarningRule,
  AlertRecord
} from '@/types'
import {
  mockAttendanceRecords,
  mockLeaveApplications,
  mockAttendanceRule,
  mockWarningRule,
  mockAlertRecords,
  mockUsers
} from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
let attendanceClone: Attendance[] = JSON.parse(JSON.stringify(mockAttendanceRecords))
let leaveClone: LeaveApplication[] = JSON.parse(JSON.stringify(mockLeaveApplications))
let alertClone: AlertRecord[] = JSON.parse(JSON.stringify(mockAlertRecords))

export async function getAttendanceList(
  params: PaginationParams & {
    userId?: number
    departmentId?: number
    startDate?: string
    endDate?: string
    status?: string
  }
): Promise<PaginatedResponse<Attendance>> {
  await delay(300)
  let list = [...attendanceClone]
  if (params.userId) {
    list = list.filter(r => r.userId === params.userId)
  }
  if (params.departmentId) {
    const userIds = mockUsers.filter(u => {
      if (u.departmentId === params.departmentId) return true
      return false
    }).map(u => u.id)
    list = list.filter(r => userIds.includes(r.userId))
  }
  if (params.startDate) {
    list = list.filter(r => r.date >= params.startDate!)
  }
  if (params.endDate) {
    list = list.filter(r => r.date <= params.endDate!)
  }
  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }
  list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function checkIn(userId: number): Promise<Attendance | null> {
  await delay(300)
  const today = dayjs().format('YYYY-MM-DD')
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return null
  let record = attendanceClone.find(r => r.userId === userId && r.date === today)
  const now = dayjs()
  const nowStr = now.format('YYYY-MM-DD HH:mm:ss')

  let lateMinutes = 0
  let status: Attendance['status'] = 'normal'
  const workStart = dayjs(today + ' ' + mockAttendanceRule.workStartTime)
  if (now.isAfter(workStart.add(mockAttendanceRule.lateThreshold, 'minute'))) {
    status = 'late'
    lateMinutes = now.diff(workStart, 'minute')
  }

  if (record) {
    record.checkInTime = nowStr
    record.status = status
    record.lateMinutes = lateMinutes
  } else {
    const newId = Math.max(...attendanceClone.map(r => r.id), 0) + 1
    record = {
      id: newId,
      userId,
      userName: user.name,
      departmentName: user.departmentName,
      date: today,
      checkInTime: nowStr,
      checkOutTime: null,
      status,
      workHours: 0,
      lateMinutes,
      earlyMinutes: 0,
      createdAt: nowStr
    }
    attendanceClone.push(record)
  }
  return record
}

export async function checkOut(userId: number): Promise<Attendance | null> {
  await delay(300)
  const today = dayjs().format('YYYY-MM-DD')
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return null
  const record = attendanceClone.find(r => r.userId === userId && r.date === today)
  if (!record) return null

  const now = dayjs()
  const nowStr = now.format('YYYY-MM-DD HH:mm:ss')
  const workEnd = dayjs(today + ' ' + mockAttendanceRule.workEndTime)
  let earlyMinutes = 0

  if (now.isBefore(workEnd.subtract(mockAttendanceRule.earlyThreshold, 'minute'))) {
    record.status = record.status === 'late' ? 'late' : 'early'
    earlyMinutes = workEnd.diff(now, 'minute')
  }

  record.checkOutTime = nowStr
  record.earlyMinutes = earlyMinutes

  if (record.checkInTime) {
    const checkIn = dayjs(record.checkInTime)
    const diffMinutes = now.diff(checkIn, 'minute')
    record.workHours = Math.max(0, Math.round(((diffMinutes - 60) / 60) * 10) / 10)
  }

  return record
}

export async function getTodayAttendance(userId: number): Promise<Attendance | null> {
  await delay(200)
  const today = dayjs().format('YYYY-MM-DD')
  return attendanceClone.find(r => r.userId === userId && r.date === today) || null
}

export async function getLeaveApplications(
  params: PaginationParams & {
    userId?: number
    departmentId?: number
    status?: string
    type?: string
  }
): Promise<PaginatedResponse<LeaveApplication>> {
  await delay(300)
  let list = [...leaveClone]
  if (params.userId) {
    list = list.filter(l => l.userId === params.userId)
  }
  if (params.departmentId) {
    const userIds = mockUsers.filter(u => u.departmentId === params.departmentId).map(u => u.id)
    list = list.filter(l => userIds.includes(l.userId))
  }
  if (params.status) {
    list = list.filter(l => l.status === params.status)
  }
  if (params.type) {
    list = list.filter(l => l.type === params.type)
  }
  list.sort((a, b) => b.id - a.id)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function applyLeave(
  userId: number,
  data: Omit<LeaveApplication, 'id' | 'userId' | 'userName' | 'departmentName' | 'status' | 'approvedBy' | 'approvedAt' | 'createdAt' | 'updatedAt'>
): Promise<LeaveApplication> {
  await delay(300)
  const user = mockUsers.find(u => u.id === userId)!
  const newId = Math.max(...leaveClone.map(l => l.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newApp: LeaveApplication = {
    id: newId,
    userId,
    userName: user.name,
    departmentName: user.departmentName,
    ...data,
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: now,
    updatedAt: now
  }
  leaveClone.push(newApp)
  return newApp
}

export async function approveLeave(
  id: number,
  approverId: number,
  status: 'approved' | 'rejected',
  rejectReason?: string
): Promise<LeaveApplication | null> {
  await delay(300)
  const idx = leaveClone.findIndex(l => l.id === id)
  if (idx === -1) return null
  const approver = mockUsers.find(u => u.id === approverId)
  leaveClone[idx] = {
    ...leaveClone[idx],
    status,
    approvedBy: approverId,
    approvedByName: approver?.name,
    approvedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    rejectReason,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return leaveClone[idx]
}

export async function getAttendanceRule(): Promise<AttendanceRule> {
  await delay(200)
  return mockAttendanceRule
}

export async function updateAttendanceRule(data: Partial<AttendanceRule>): Promise<AttendanceRule> {
  await delay(300)
  Object.assign(mockAttendanceRule, data, { updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  return mockAttendanceRule
}

export async function getWarningRule(): Promise<WarningRule> {
  await delay(200)
  return mockWarningRule
}

export async function updateWarningRule(data: Partial<WarningRule>): Promise<WarningRule> {
  await delay(300)
  Object.assign(mockWarningRule, data, { updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  return mockWarningRule
}

export async function getAlerts(
  params: PaginationParams & { handled?: boolean; type?: string }
): Promise<PaginatedResponse<AlertRecord>> {
  await delay(300)
  let list = [...alertClone]
  if (params.handled !== undefined) {
    list = list.filter(a => a.handled === params.handled)
  }
  if (params.type) {
    list = list.filter(a => a.type === params.type)
  }
  list.sort((a, b) => {
    if (a.handled === b.handled) return b.id - a.id
    return a.handled ? 1 : -1
  })
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function handleAlert(id: number, handlerId: number): Promise<AlertRecord | null> {
  await delay(300)
  const idx = alertClone.findIndex(a => a.id === id)
  if (idx === -1) return null
  alertClone[idx] = {
    ...alertClone[idx],
    handled: true,
    handledBy: handlerId,
    handledAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return alertClone[idx]
}
