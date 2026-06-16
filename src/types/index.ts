export type UserRole = 'super_admin' | 'admin' | 'hr_admin' | 'manager' | 'employee'

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

export type SalaryItemType = 'earning' | 'deduction'

export interface SalaryItem {
  id: number
  name: string
  code: string
  type: SalaryItemType
  description: string
  isTaxable: boolean
  isFixed: boolean
  defaultValue: number
  status: 'active' | 'inactive'
  sort: number
  createdAt: string
  updatedAt: string
}

export interface EmployeeSalaryProfile {
  id: number
  userId: number
  userName: string
  departmentName: string
  position: string
  baseSalary: number
  performanceSalary: number
  allowance: number
  socialSecurityBase: number
  housingFundBase: number
  taxFreeAmount: number
  effectiveDate: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface SalaryDetailItem {
  itemId: number
  itemName: string
  itemCode: string
  type: SalaryItemType
  amount: number
  isTaxable: boolean
}

export interface SalaryRecord {
  id: number
  userId: number
  userName: string
  departmentName: string
  position: string
  month: string
  baseSalary: number
  performanceSalary: number
  overtimePay: number
  bonus: number
  allowance: number
  otherEarnings: number
  totalEarnings: number
  socialSecurityPersonal: number
  housingFundPersonal: number
  personalIncomeTax: number
  otherDeductions: number
  totalDeductions: number
  netSalary: number
  actualWorkDays: number
  standardWorkDays: number
  attendanceRate: number
  details: SalaryDetailItem[]
  status: 'draft' | 'confirmed' | 'paid'
  paidAt?: string
  confirmedBy?: number
  confirmedByName?: string
  confirmedAt?: string
  createdAt: string
  updatedAt: string
}

export interface SalaryCalculationParams {
  month: string
  departmentId?: number
  userId?: number
}

export interface SalaryStatistics {
  month: string
  totalEmployees: number
  paidEmployees: number
  totalBaseSalary: number
  totalPerformanceSalary: number
  totalOvertimePay: number
  totalBonus: number
  totalAllowance: number
  totalEarnings: number
  totalSocialSecurityPersonal: number
  totalHousingFundPersonal: number
  totalPersonalIncomeTax: number
  totalDeductions: number
  totalNetSalary: number
  avgNetSalary: number
  maxNetSalary: number
  minNetSalary: number
  departmentSalaryStats: {
    departmentId: number
    departmentName: string
    employeeCount: number
    totalNetSalary: number
    avgNetSalary: number
  }[]
  salaryDistribution: {
    range: string
    count: number
    percentage: number
  }[]
  monthlyTrend: {
    month: string
    totalNetSalary: number
    avgNetSalary: number
    employeeCount: number
  }[]
}

export interface PayslipTemplate {
  id: number
  name: string
  code: string
  showFields: string[]
  layout: 'simple' | 'detailed'
  logoUrl?: string
  companyName: string
  createdAt: string
  updatedAt: string
}

export type TaxRateBracket = {
  min: number
  max: number
  rate: number
  deduction: number
}

export interface SocialSecurityConfig {
  id: number
  pensionRate: number
  medicalRate: number
  unemploymentRate: number
  workInjuryRate: number
  maternityRate: number
  housingFundRate: number
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

export interface TaxConfig {
  id: number
  threshold: number
  brackets: TaxRateBracket[]
  specialDeductions: {
    name: string
    code: string
    amount: number
  }[]
  effectiveDate: string
  createdAt: string
  updatedAt: string
}

export type ContractType = 'fixed_term' | 'open_ended' | 'part_time' | 'probation' | 'project'
export type ContractStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'signed' | 'active' | 'expired' | 'terminated' | 'archived'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'delegated' | 'returned' | 'cancelled'
export type ApprovalMode = 'sequential' | 'countersign' | 'any_sign'
export type ApprovalConditionType = 'amount' | 'contract_type' | 'department' | 'probation'

export interface ApprovalPermissionError {
  code: 'NOT_APPROVER' | 'NOT_PENDING' | 'CONTRACT_NOT_FOUND' | 'STEP_NOT_FOUND' | 'ALREADY_PROCESSED' | 'INSUFFICIENT_PERMISSION'
  message: string
  contractId?: number
  stepOrder?: number
}

export interface BatchOperationResultItem {
  contractId: number
  contractNo: string
  userName: string
  success: boolean
  error?: ApprovalPermissionError
}

export interface BatchOperationResult {
  total: number
  successCount: number
  failureCount: number
  items: BatchOperationResultItem[]
}

export interface ApprovalCondition {
  type: ApprovalConditionType
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in' | 'not_in'
  value: number | string | string[]
  description?: string
}

export interface ApprovalStepConfig {
  stepOrder: number
  stepName: string
  role: string
  roleName: string
  mode: ApprovalMode
  approverId?: number
  approverName?: string
  approverIds?: number[]
  conditions?: ApprovalCondition[]
  requireComment: boolean
  deadlineHours?: number
  canDelegate: boolean
  canReturn: boolean
  canAddSign: boolean
}

export interface ContractTemplate {
  id: number
  name: string
  code: string
  type: ContractType
  version: string
  content: string
  placeholderFields: string[]
  isDefault: boolean
  status: 'active' | 'inactive'
  createdBy: number
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ContractSalaryInfo {
  baseSalary: number
  performanceSalary?: number
  overtimeSalary?: number
  bonus?: number
  allowance?: number
  socialSecurityBase?: number
  housingFundBase?: number
  payCycle: 'monthly' | 'weekly' | 'biweekly' | 'hourly'
  payDay: number
}

export interface ContractWorkInfo {
  position: string
  departmentId: number
  departmentName: string
  workLocation: string
  workHours: string
  workDays: string
  probationPeriod?: number
  probationSalary?: number
}

export interface ApprovalStep {
  id: number
  stepOrder: number
  stepName: string
  approverId: number
  approverName: string
  approverRole: string
  approverRoleName: string
  mode: ApprovalMode
  status: ApprovalStatus
  comment?: string
  approvedAt?: string
  deadline?: string
  delegatedTo?: number
  delegatedToName?: string
  delegatedAt?: string
  returnedTo?: number
  returnedReason?: string
  returnedAt?: string
  addSigners?: { id: number; name: string; comment?: string; signedAt?: string; status?: ApprovalStatus }[]
}

export interface ContractSignatory {
  id: number
  userId: number
  userName: string
  role: 'employee' | 'company_rep' | 'hr'
  signatureData?: string
  signedAt?: string
  status: 'pending' | 'signed' | 'rejected'
}

export interface WorkerContract {
  id: number
  contractNo: string
  templateId: number
  templateName: string
  type: ContractType
  status: ContractStatus

  userId: number
  userName: string
  userIdCard: string
  userPhone: string
  userEmail: string
  userAddress: string

  workInfo: ContractWorkInfo
  salaryInfo: ContractSalaryInfo

  startDate: string
  endDate?: string
  termMonths?: number

  renewalCount: number
  lastRenewalDate?: string
  nextRenewalDate?: string
  expirationReminderSent: boolean

  content?: string
  attachments?: { name: string; url: string; type: string }[]

  approvalSteps: ApprovalStep[]
  currentApprovalStep: number
  signatories: ContractSignatory[]

  remarks?: string
  terminationReason?: string
  terminatedAt?: string

  createdBy: number
  createdByName: string
  createdAt: string
  updatedAt: string
  signedAt?: string
  archivedAt?: string
}

export interface ContractReminder {
  id: number
  contractId: number
  contractNo: string
  userName: string
  departmentName: string
  type: 'expiration' | 'renewal' | 'probation_end'
  reminderDate: string
  daysRemaining: number
  handled: boolean
  handledBy?: number
  handledAt?: string
  createdAt: string
}

export interface ContractApprovalFlowConfig {
  id: number
  name: string
  contractType: ContractType
  description?: string
  steps: ApprovalStepConfig[]
  isDefault: boolean
  status: 'active' | 'inactive'
  createdBy: number
  createdByName: string
  createdAt: string
  updatedAt: string
}

export interface ApprovalDelegation {
  id: number
  fromUserId: number
  fromUserName: string
  toUserId: number
  toUserName: string
  reason?: string
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export interface ApprovalTimelineItem {
  id: number
  action: 'submit' | 'approve' | 'reject' | 'delegate' | 'return' | 'add_sign' | 'complete' | 'reject'
  operatorId: number
  operatorName: string
  operatorRole: string
  comment?: string
  timestamp: string
  stepOrder?: number
  stepName?: string
  fromUser?: string
  toUser?: string
}
