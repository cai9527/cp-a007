export type UserRole = 'super_admin' | 'admin' | 'manager' | 'employee'

export interface User {
  id: number
  username: string
  name: string
  email: string
  phone: string
  idCard: string
  photo: string
  role: UserRole
  departmentId: number
  departmentName: string
  position: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: number
  name: string
  parentId: number | null
  parentName?: string
  employeeCount?: number
  createdAt: string
  updatedAt: string
}

export type AttendanceStatus = 'normal' | 'late' | 'early' | 'absent' | 'leave' | 'business_trip'

export interface Attendance {
  id: number
  userId: number
  userName: string
  departmentName: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: AttendanceStatus
  workHours: number
  lateMinutes: number
  earlyMinutes: number
  createdAt: string
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'marriage' | 'funeral'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveApplication {
  id: number
  userId: number
  userName: string
  departmentName: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approvedBy: number | null
  approvedByName?: string
  approvedAt: string | null
  rejectReason?: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceRule {
  id: number
  workStartTime: string
  workEndTime: string
  lateThreshold: number
  earlyThreshold: number
  checkInRangeStart: string
  checkInRangeEnd: string
  checkOutRangeStart: string
  checkOutRangeEnd: string
  workDaysPerWeek: number[]
  createdAt: string
  updatedAt: string
}

export interface WarningRule {
  id: number
  lateWarningCount: number
  earlyWarningCount: number
  absentWarningCount: number
  continuousAbsentDays: number
  notifyAdmin: boolean
  notifyEmployee: boolean
  createdAt: string
  updatedAt: string
}

export interface AlertRecord {
  id: number
  type: 'late' | 'early' | 'absent' | 'continuous_absent'
  userId: number
  userName: string
  departmentName: string
  date: string
  description: string
  handled: boolean
  handledBy?: number
  handledAt?: string
  createdAt: string
}

export interface DashboardStats {
  totalEmployees: number
  todayCheckIn: number
  todayLate: number
  todayAbsent: number
  pendingLeaves: number
  todayAlerts: number
  monthAttendanceRate: number
  thisMonthWorkDays: number
}

export interface PersonalReport {
  userId: number
  userName: string
  departmentName: string
  month: string
  workDays: number
  actualDays: number
  normalDays: number
  lateDays: number
  lateMinutes: number
  earlyDays: number
  earlyMinutes: number
  absentDays: number
  leaveDays: number
  businessTripDays: number
  totalWorkHours: number
  avgWorkHours: number
  attendanceRate: number
  dailyRecords: Attendance[]
}

export interface DepartmentReport {
  departmentId: number
  departmentName: string
  month: string
  totalEmployees: number
  avgAttendanceRate: number
  totalLateCount: number
  totalEarlyCount: number
  totalAbsentCount: number
  totalLeaveDays: number
  employeeReports: PersonalReport[]
}

export interface MonthlyReport {
  month: string
  totalEmployees: number
  avgAttendanceRate: number
  departmentRank: {
    departmentId: number
    departmentName: string
    attendanceRate: number
    rank: number
  }[]
  lateTrend: { date: string; count: number }[]
  absentTrend: { date: string; count: number }[]
  statusDistribution: {
    name: string
    value: number
  }[]
}

export interface Role {
  id: number
  name: string
  code: string
  description: string
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  type: 'menu' | 'button'
  parentId: string | null
  path?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
