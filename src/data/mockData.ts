import dayjs from 'dayjs'
import type {
  User,
  Department,
  Attendance,
  LeaveApplication,
  AttendanceRule,
  WarningRule,
  AlertRecord,
  DashboardStats,
  Role,
  Permission,
  PersonalReport,
  DepartmentReport,
  MonthlyReport,
  SalaryItem,
  EmployeeSalaryProfile,
  SalaryRecord,
  SalaryDetailItem,
  SalaryStatistics,
  SocialSecurityConfig,
  TaxConfig,
  SalaryCalculationParams,
  ContractTemplate,
  WorkerContract,
  ContractReminder,
  ContractApprovalFlowConfig,
  ContractType,
  ContractStatus,
  ContractWorkInfo,
  ContractSalaryInfo,
  ApprovalStep,
  ContractSignatory
} from '@/types'

export const mockDepartments: Department[] = [
  { id: 1, name: '总公司', parentId: null, employeeCount: 61, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, name: '技术部', parentId: 1, parentName: '总公司', employeeCount: 21, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 3, name: '产品部', parentId: 1, parentName: '总公司', employeeCount: 10, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 4, name: '人力资源部', parentId: 1, parentName: '总公司', employeeCount: 8, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 5, name: '财务部', parentId: 1, parentName: '总公司', employeeCount: 7, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 6, name: '市场部', parentId: 1, parentName: '总公司', employeeCount: 14, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 9, name: '法务部', parentId: 1, parentName: '总公司', employeeCount: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 7, name: '前端组', parentId: 2, parentName: '技术部', employeeCount: 8, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 8, name: '后端组', parentId: 2, parentName: '技术部', employeeCount: 12, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' }
]

const surnames = ['张', '王', '李', '赵', '陈', '刘', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡']
const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀英', '霞', '平']

function randomName(): string {
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)]
}

function randomIdCard(): string {
  const prefix = '110101' + Math.floor(Math.random() * 900000 + 100000).toString()
  const suffix = Math.floor(Math.random() * 9000 + 1000).toString()
  return prefix + suffix
}

function randomPhone(): string {
  return '13' + Math.floor(Math.random() * 900000000 + 100000000).toString()
}

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    name: '超级管理员',
    email: 'admin@company.com',
    phone: '13800138000',
    idCard: '110101199001010001',
    photo: '',
    role: 'super_admin',
    departmentId: 4,
    departmentName: '人力资源部',
    position: '系统管理员',
    status: 'active',
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    username: 'hr_admin',
    name: '李华',
    email: 'lihua@company.com',
    phone: '13800138001',
    idCard: '110101199203150002',
    photo: '',
    role: 'hr_admin',
    departmentId: 4,
    departmentName: '人力资源部',
    position: 'HR主管',
    status: 'active',
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 3,
    username: 'tech_mgr',
    name: '张伟',
    email: 'zhangwei@company.com',
    phone: '13800138002',
    idCard: '110101198807200003',
    photo: '',
    role: 'manager',
    departmentId: 2,
    departmentName: '技术部',
    position: '技术总监',
    status: 'active',
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  }
]

let userId = 4
const departmentsWithStaff = [
  { deptId: 7, deptName: '前端组', count: 8 },
  { deptId: 8, deptName: '后端组', count: 12 },
  { deptId: 3, deptName: '产品部', count: 10 },
  { deptId: 4, deptName: '人力资源部', count: 5 },
  { deptId: 5, deptName: '财务部', count: 6 },
  { deptId: 6, deptName: '市场部', count: 14 }
]

departmentsWithStaff.forEach(({ deptId, deptName, count }) => {
  for (let i = 0; i < count; i++) {
    const name = randomName()
    mockUsers.push({
      id: userId++,
      username: `emp${userId}`,
      name: name,
      email: `emp${userId}@company.com`,
      phone: randomPhone(),
      idCard: randomIdCard(),
      photo: '',
      role: userId % 10 === 0 ? 'manager' : 'employee',
      departmentId: deptId,
      departmentName: deptName,
      position: deptName.includes('组') ? (deptId === 7 ? '前端工程师' : '后端工程师') : '专员',
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      createdAt: `2024-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')} 09:00:00`,
      updatedAt: `2024-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 27) + 1).padStart(2, '0')} 09:00:00`
    })
  }
})

mockUsers.push(
  {
    id: userId++,
    username: 'legal',
    name: '陈静',
    email: 'chenjing@company.com',
    phone: '13900139008',
    idCard: '110101199003150025',
    photo: '',
    role: 'legal',
    departmentId: 9,
    departmentName: '法务部',
    position: '法务专员',
    status: 'active',
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-01-15 09:00:00'
  },
  {
    id: userId++,
    username: 'finance',
    name: '刘强',
    email: 'liuqiang@company.com',
    phone: '13900139009',
    idCard: '110101198912200036',
    photo: '',
    role: 'finance',
    departmentId: 5,
    departmentName: '财务部',
    position: '财务主管',
    status: 'active',
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-01-15 09:00:00'
  },
  {
    id: userId++,
    username: 'dept_mgr_tech',
    name: '赵明',
    email: 'zhaoming@company.com',
    phone: '13900139010',
    idCard: '110101198605100047',
    photo: '',
    role: 'manager',
    departmentId: 2,
    departmentName: '技术部',
    position: '技术部经理',
    status: 'active',
    createdAt: '2024-01-15 09:00:00',
    updatedAt: '2024-01-15 09:00:00'
  }
)

function generateAttendanceRecords(): Attendance[] {
  const records: Attendance[] = []
  let id = 1
  const today = dayjs()
  const activeUsers = mockUsers.filter(u => u.status === 'active' && u.role !== 'super_admin')

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = today.subtract(dayOffset, 'day')
    const dayOfWeek = date.day()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    activeUsers.forEach(user => {
      const rand = Math.random()
      let status: Attendance['status'] = 'normal'
      let checkInTime: string | null = null
      let checkOutTime: string | null = null
      let lateMinutes = 0
      let earlyMinutes = 0
      let workHours = 0

      if (rand < 0.88) {
        status = 'normal'
        const inHour = 8 + Math.floor(Math.random() * 1)
        const inMin = 30 + Math.floor(Math.random() * 30)
        checkInTime = `${date.format('YYYY-MM-DD')} ${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`

        const outHour = 18 + Math.floor(Math.random() * 2)
        const outMin = Math.floor(Math.random() * 60)
        checkOutTime = `${date.format('YYYY-MM-DD')} ${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`

        workHours = (outHour * 60 + outMin - (inHour * 60 + inMin) - 60) / 60
      } else if (rand < 0.93) {
        status = 'late'
        const inHour = 9
        const inMin = 5 + Math.floor(Math.random() * 55)
        lateMinutes = inMin - 0 + Math.floor(Math.random() * 30)
        if (lateMinutes < 5) lateMinutes = 10
        checkInTime = `${date.format('YYYY-MM-DD')} ${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`

        const outHour = 18 + Math.floor(Math.random() * 2)
        const outMin = Math.floor(Math.random() * 60)
        checkOutTime = `${date.format('YYYY-MM-DD')} ${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`

        workHours = Math.max(0, (outHour * 60 + outMin - (inHour * 60 + inMin) - 60) / 60)
      } else if (rand < 0.97) {
        status = 'early'
        const inHour = 8 + Math.floor(Math.random() * 1)
        const inMin = 30 + Math.floor(Math.random() * 30)
        checkInTime = `${date.format('YYYY-MM-DD')} ${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`

        const outHour = 16 + Math.floor(Math.random() * 1)
        const outMin = Math.floor(Math.random() * 60)
        earlyMinutes = (18 * 60) - (outHour * 60 + outMin) + Math.floor(Math.random() * 20)
        checkOutTime = `${date.format('YYYY-MM-DD')} ${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`

        workHours = Math.max(0, (outHour * 60 + outMin - (inHour * 60 + inMin) - 60) / 60)
      } else if (rand < 0.99) {
        status = 'absent'
        workHours = 0
      } else {
        status = 'leave'
        workHours = 0
      }

      records.push({
        id: id++,
        userId: user.id,
        userName: user.name,
        departmentName: user.departmentName,
        date: date.format('YYYY-MM-DD'),
        checkInTime,
        checkOutTime,
        status,
        workHours: Math.round(workHours * 10) / 10,
        lateMinutes,
        earlyMinutes,
        createdAt: `${date.format('YYYY-MM-DD')} 09:00:00`
      })
    })
  }

  return records
}

export const mockAttendanceRecords = generateAttendanceRecords()

export const mockLeaveApplications: LeaveApplication[] = [
  {
    id: 1,
    userId: 10,
    userName: '王芳',
    departmentName: '前端组',
    type: 'annual',
    startDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    days: 2,
    reason: '家中有事需处理',
    status: 'approved',
    approvedBy: 3,
    approvedByName: '张伟',
    approvedAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
    createdAt: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 2,
    userId: 15,
    userName: '李伟',
    departmentName: '后端组',
    type: 'sick',
    startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    days: 1,
    reason: '感冒发烧，身体不适',
    status: 'approved',
    approvedBy: 3,
    approvedByName: '张伟',
    approvedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 3,
    userId: 25,
    userName: '赵丽',
    departmentName: '产品部',
    type: 'personal',
    startDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    days: 2,
    reason: '参加好友婚礼',
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 4,
    userId: 35,
    userName: '刘强',
    departmentName: '市场部',
    type: 'business_trip' as any,
    startDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
    days: 3,
    reason: '前往上海参加行业峰会',
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 5,
    userId: 8,
    userName: '陈静',
    departmentName: '前端组',
    type: 'maternity',
    startDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().add(7, 'day').add(3, 'month').format('YYYY-MM-DD'),
    days: 98,
    reason: '预产期临近，申请产假',
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
    updatedAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
  }
]

export const mockAttendanceRule: AttendanceRule = {
  id: 1,
  workStartTime: '09:00:00',
  workEndTime: '18:00:00',
  lateThreshold: 15,
  earlyThreshold: 15,
  checkInRangeStart: '06:00:00',
  checkInRangeEnd: '12:00:00',
  checkOutRangeStart: '17:00:00',
  checkOutRangeEnd: '23:59:59',
  workDaysPerWeek: [1, 2, 3, 4, 5],
  createdAt: '2024-01-01 09:00:00',
  updatedAt: '2024-01-01 09:00:00'
}

export const mockWarningRule: WarningRule = {
  id: 1,
  lateWarningCount: 3,
  earlyWarningCount: 3,
  absentWarningCount: 2,
  continuousAbsentDays: 2,
  notifyAdmin: true,
  notifyEmployee: true,
  createdAt: '2024-01-01 09:00:00',
  updatedAt: '2024-01-01 09:00:00'
}

export const mockAlertRecords: AlertRecord[] = [
  {
    id: 1,
    type: 'late',
    userId: 12,
    userName: '周洋',
    departmentName: '后端组',
    date: dayjs().format('YYYY-MM-DD'),
    description: '本月已累计迟到3次，达到预警阈值',
    handled: false,
    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 2,
    type: 'absent',
    userId: 28,
    userName: '吴敏',
    departmentName: '市场部',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    description: '连续缺勤2天，需关注员工情况',
    handled: false,
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: 3,
    type: 'early',
    userId: 18,
    userName: '孙磊',
    departmentName: '后端组',
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    description: '本月已累计早退3次，达到预警阈值',
    handled: true,
    handledBy: 2,
    handledAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
  }
]

export function calculateDashboardStats(): DashboardStats {
  const today = dayjs().format('YYYY-MM-DD')
  const activeEmployees = mockUsers.filter(u => u.status === 'active').length
  const todayRecords = mockAttendanceRecords.filter(r => r.date === today)
  const todayCheckIn = todayRecords.filter(r => r.checkInTime).length
  const todayLate = todayRecords.filter(r => r.status === 'late').length
  const todayAbsent = todayRecords.filter(r => r.status === 'absent').length
  const pendingLeaves = mockLeaveApplications.filter(l => l.status === 'pending').length
  const todayAlerts = mockAlertRecords.filter(a => !a.handled).length

  const monthStart = dayjs().startOf('month')
  const monthEnd = dayjs()
  const monthRecords = mockAttendanceRecords.filter(r => {
    const d = dayjs(r.date)
    return d.isAfter(monthStart.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'))
  })

  let thisMonthWorkDays = 0
  for (let d = monthStart; d.isBefore(monthEnd.add(1, 'day')); d = d.add(1, 'day')) {
    const dayOfWeek = d.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) thisMonthWorkDays++
  }

  const totalPossible = thisMonthWorkDays * mockUsers.filter(u => u.status === 'active' && u.role !== 'super_admin').length
  const actualAttendance = monthRecords.filter(r => r.status !== 'absent' && r.status !== 'leave').length
  const monthAttendanceRate = totalPossible > 0 ? Math.round((actualAttendance / totalPossible) * 1000) / 10 : 0

  return {
    totalEmployees: activeEmployees,
    todayCheckIn,
    todayLate,
    todayAbsent,
    pendingLeaves,
    todayAlerts,
    monthAttendanceRate,
    thisMonthWorkDays
  }
}

export const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    permissions: ['*'],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    name: '系统管理员',
    code: 'admin',
    description: '用户管理、考勤管理、报表查看、系统设置',
    permissions: [
      'dashboard',
      'user:view', 'user:create', 'user:edit', 'user:delete',
      'attendance:view', 'attendance:edit',
      'leave:view', 'leave:approve',
      'report:view', 'report:export',
      'settings:view', 'settings:edit',
      'role:view', 'role:edit',
      'alert'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 3,
    name: 'HR管理员',
    code: 'hr_admin',
    description: '工资管理、薪资计算、工资报表、员工薪资档案、合同管理',
    permissions: [
      'dashboard',
      'user:view',
      'attendance:view',
      'leave:view',
      'report:view',
      'salary:item:view', 'salary:item:create', 'salary:item:edit', 'salary:item:delete',
      'salary:profile:view', 'salary:profile:edit',
      'salary:calculate', 'salary:confirm', 'salary:pay',
      'salary:record:view', 'salary:record:edit',
      'salary:statistics:view',
      'salary:report:view', 'salary:report:export',
      'salary:payslip:view', 'salary:payslip:export',
      'contract:view', 'contract:create', 'contract:edit', 'contract:delete',
      'contract:submit', 'contract:approval',
      'contract:template:view', 'contract:template:create', 'contract:template:edit', 'contract:template:delete',
      'contract:renew', 'contract:terminate', 'contract:archive',
      'contract:reminder', 'contract:sign'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 4,
    name: '法务专员',
    code: 'legal',
    description: '合同法律审核、合同风险评估、合同条款审核',
    permissions: [
      'dashboard',
      'contract:view',
      'contract:approval',
      'contract:template:view',
      'report:view',
      'alert'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 5,
    name: '财务专员',
    code: 'finance',
    description: '财务预算审核、薪资成本审核、合同费用审核',
    permissions: [
      'dashboard',
      'contract:view',
      'contract:approval',
      'salary:record:view',
      'salary:statistics:view',
      'salary:report:view',
      'report:view',
      'alert'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 6,
    name: '部门经理',
    code: 'manager',
    description: '部门考勤管理、部门报表查看、请假审批、合同部门审核',
    permissions: [
      'dashboard',
      'user:view',
      'attendance:view',
      'leave:view', 'leave:apply', 'leave:approve',
      'contract:view',
      'contract:approval',
      'report:view',
      'alert'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 7,
    name: '普通员工',
    code: 'employee',
    description: '个人考勤查看、个人信息管理、考勤申请',
    permissions: [
      'dashboard',
      'user:view:self',
      'attendance:view:self',
      'leave:view:self', 'leave:apply',
      'report:view:self'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  }
]

export const mockPermissions: Permission[] = [
  { id: 'dashboard', name: '仪表盘', type: 'menu', parentId: null, path: '/dashboard' },
  { id: 'user', name: '用户管理', type: 'menu', parentId: null, path: '/users' },
  { id: 'user:view', name: '查看用户', type: 'button', parentId: 'user' },
  { id: 'user:create', name: '创建用户', type: 'button', parentId: 'user' },
  { id: 'user:edit', name: '编辑用户', type: 'button', parentId: 'user' },
  { id: 'user:delete', name: '删除用户', type: 'button', parentId: 'user' },
  { id: 'attendance', name: '考勤管理', type: 'menu', parentId: null, path: '/attendance' },
  { id: 'attendance:view', name: '查看考勤', type: 'button', parentId: 'attendance' },
  { id: 'attendance:edit', name: '编辑考勤', type: 'button', parentId: 'attendance' },
  { id: 'leave', name: '请假管理', type: 'menu', parentId: null, path: '/leaves' },
  { id: 'leave:view', name: '查看请假', type: 'button', parentId: 'leave' },
  { id: 'leave:apply', name: '申请请假', type: 'button', parentId: 'leave' },
  { id: 'leave:approve', name: '审批请假', type: 'button', parentId: 'leave' },
  { id: 'report', name: '报表中心', type: 'menu', parentId: null, path: '/reports' },
  { id: 'report:view', name: '查看报表', type: 'button', parentId: 'report' },
  { id: 'report:export', name: '导出报表', type: 'button', parentId: 'report' },
  { id: 'alert', name: '异常预警', type: 'menu', parentId: null, path: '/alerts' },
  { id: 'settings', name: '系统设置', type: 'menu', parentId: null, path: '/settings' },
  { id: 'settings:view', name: '查看设置', type: 'button', parentId: 'settings' },
  { id: 'settings:edit', name: '编辑设置', type: 'button', parentId: 'settings' },
  { id: 'role', name: '角色管理', type: 'menu', parentId: null, path: '/settings/roles' },
  { id: 'role:view', name: '查看角色', type: 'button', parentId: 'role' },
  { id: 'role:edit', name: '编辑角色', type: 'button', parentId: 'role' },
  { id: 'salary', name: '工资管理', type: 'menu', parentId: null, path: '/salary/items' },
  { id: 'salary:item', name: '工资项目配置', type: 'menu', parentId: 'salary', path: '/salary/items' },
  { id: 'salary:item:view', name: '查看工资项目', type: 'button', parentId: 'salary:item' },
  { id: 'salary:item:create', name: '创建工资项目', type: 'button', parentId: 'salary:item' },
  { id: 'salary:item:edit', name: '编辑工资项目', type: 'button', parentId: 'salary:item' },
  { id: 'salary:item:delete', name: '删除工资项目', type: 'button', parentId: 'salary:item' },
  { id: 'salary:profile', name: '员工薪资档案', type: 'menu', parentId: 'salary', path: '/salary/profile' },
  { id: 'salary:profile:view', name: '查看薪资档案', type: 'button', parentId: 'salary:profile' },
  { id: 'salary:profile:edit', name: '编辑薪资档案', type: 'button', parentId: 'salary:profile' },
  { id: 'salary:calculation', name: '薪资计算', type: 'menu', parentId: 'salary', path: '/salary/calculation' },
  { id: 'salary:calculate', name: '计算薪资', type: 'button', parentId: 'salary:calculation' },
  { id: 'salary:confirm', name: '确认薪资', type: 'button', parentId: 'salary:calculation' },
  { id: 'salary:pay', name: '标记已发', type: 'button', parentId: 'salary:calculation' },
  { id: 'salary:record', name: '工资记录', type: 'menu', parentId: 'salary', path: '/salary/records' },
  { id: 'salary:record:view', name: '查看工资记录', type: 'button', parentId: 'salary:record' },
  { id: 'salary:record:edit', name: '编辑工资记录', type: 'button', parentId: 'salary:record' },
  { id: 'salary:statistics', name: '工资统计分析', type: 'menu', parentId: 'salary', path: '/salary/statistics' },
  { id: 'salary:statistics:view', name: '查看统计分析', type: 'button', parentId: 'salary:statistics' },
  { id: 'salary:report', name: '工资报表', type: 'menu', parentId: 'salary', path: '/salary/report' },
  { id: 'salary:report:view', name: '查看工资报表', type: 'button', parentId: 'salary:report' },
  { id: 'salary:report:export', name: '导出工资报表', type: 'button', parentId: 'salary:report' },
  { id: 'salary:payslip', name: '工资条', type: 'menu', parentId: 'salary', path: '/salary/payslip' },
  { id: 'salary:payslip:view', name: '查看工资条', type: 'button', parentId: 'salary:payslip' },
  { id: 'salary:payslip:export', name: '导出工资条', type: 'button', parentId: 'salary:payslip' }
]

export function calculatePersonalReport(userId: number, month: string): PersonalReport {
  const user = mockUsers.find(u => u.id === userId)!
  const monthStart = dayjs(month + '-01')
  const monthEnd = monthStart.endOf('month')

  const records = mockAttendanceRecords.filter(r => {
    const d = dayjs(r.date)
    return r.userId === userId && d.isAfter(monthStart.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'))
  })

  let workDays = 0
  for (let d = monthStart; d.isBefore(monthEnd.add(1, 'day')); d = d.add(1, 'day')) {
    const dayOfWeek = d.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) workDays++
  }

  const normalDays = records.filter(r => r.status === 'normal').length
  const lateDays = records.filter(r => r.status === 'late').length
  const earlyDays = records.filter(r => r.status === 'early').length
  const absentDays = records.filter(r => r.status === 'absent').length
  const leaveDays = records.filter(r => r.status === 'leave').length
  const businessTripDays = records.filter(r => r.status === 'business_trip').length
  const actualDays = records.filter(r => r.status !== 'absent').length

  const lateMinutes = records.reduce((sum, r) => sum + r.lateMinutes, 0)
  const earlyMinutes = records.reduce((sum, r) => sum + r.earlyMinutes, 0)
  const totalWorkHours = records.reduce((sum, r) => sum + r.workHours, 0)
  const avgWorkHours = actualDays > 0 ? Math.round((totalWorkHours / actualDays) * 10) / 10 : 0
  const attendanceRate = workDays > 0 ? Math.round(((workDays - absentDays) / workDays) * 1000) / 10 : 0

  return {
    userId,
    userName: user.name,
    departmentName: user.departmentName,
    month,
    workDays,
    actualDays,
    normalDays,
    lateDays,
    lateMinutes,
    earlyDays,
    earlyMinutes,
    absentDays,
    leaveDays,
    businessTripDays,
    totalWorkHours: Math.round(totalWorkHours * 10) / 10,
    avgWorkHours,
    attendanceRate,
    dailyRecords: records
  }
}

export function calculateDepartmentReport(departmentId: number, month: string): DepartmentReport {
  const dept = mockDepartments.find(d => d.id === departmentId)!
  const deptUsers = mockUsers.filter(u => {
    if (u.departmentId === departmentId) return true
    const childDepts = mockDepartments.filter(d => d.parentId === departmentId)
    return childDepts.some(cd => cd.id === u.departmentId)
  })

  let totalLateCount = 0
  let totalEarlyCount = 0
  let totalAbsentCount = 0
  let totalLeaveDays = 0
  let totalRate = 0

  const employeeReports = deptUsers.filter(u => u.role !== 'super_admin').map(u => {
    const report = calculatePersonalReport(u.id, month)
    totalLateCount += report.lateDays
    totalEarlyCount += report.earlyDays
    totalAbsentCount += report.absentDays
    totalLeaveDays += report.leaveDays
    totalRate += report.attendanceRate
    return report
  })

  const avgAttendanceRate = employeeReports.length > 0 ? Math.round((totalRate / employeeReports.length) * 10) / 10 : 0

  return {
    departmentId,
    departmentName: dept.name,
    month,
    totalEmployees: deptUsers.filter(u => u.role !== 'super_admin').length,
    avgAttendanceRate,
    totalLateCount,
    totalEarlyCount,
    totalAbsentCount,
    totalLeaveDays,
    employeeReports
  }
}

export function calculateMonthlyReport(month: string): MonthlyReport {
  const monthStart = dayjs(month + '-01')
  const monthEnd = monthStart.endOf('month')

  const allRecords = mockAttendanceRecords.filter(r => {
    const d = dayjs(r.date)
    return d.isAfter(monthStart.subtract(1, 'day')) && d.isBefore(monthEnd.add(1, 'day'))
  })

  const deptReports = mockDepartments
    .filter(d => d.parentId === 1)
    .map(d => ({
      departmentId: d.id,
      departmentName: d.name,
      attendanceRate: calculateDepartmentReport(d.id, month).avgAttendanceRate
    }))
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .map((d, i) => ({ ...d, rank: i + 1 }))

  const lateTrend: { date: string; count: number }[] = []
  const absentTrend: { date: string; count: number }[] = []

  for (let d = monthStart; d.isBefore(monthEnd.add(1, 'day')); d = d.add(1, 'day')) {
    const dateStr = d.format('YYYY-MM-DD')
    const dayRecords = allRecords.filter(r => r.date === dateStr)
    lateTrend.push({ date: dateStr, count: dayRecords.filter(r => r.status === 'late').length })
    absentTrend.push({ date: dateStr, count: dayRecords.filter(r => r.status === 'absent').length })
  }

  const normalCount = allRecords.filter(r => r.status === 'normal').length
  const lateCount = allRecords.filter(r => r.status === 'late').length
  const earlyCount = allRecords.filter(r => r.status === 'early').length
  const absentCount = allRecords.filter(r => r.status === 'absent').length
  const leaveCount = allRecords.filter(r => r.status === 'leave').length

  const totalEmployees = mockUsers.filter(u => u.status === 'active' && u.role !== 'super_admin').length
  let totalPossible = 0
  for (let d = monthStart; d.isBefore(monthEnd.add(1, 'day')); d = d.add(1, 'day')) {
    const dayOfWeek = d.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) totalPossible += totalEmployees
  }
  const actualAttendance = allRecords.filter(r => r.status !== 'absent' && r.status !== 'leave').length
  const avgAttendanceRate = totalPossible > 0 ? Math.round((actualAttendance / totalPossible) * 1000) / 10 : 0

  return {
    month,
    totalEmployees,
    avgAttendanceRate,
    departmentRank: deptReports,
    lateTrend,
    absentTrend,
    statusDistribution: [
      { name: '正常', value: normalCount },
      { name: '迟到', value: lateCount },
      { name: '早退', value: earlyCount },
      { name: '缺勤', value: absentCount },
      { name: '请假', value: leaveCount }
    ]
  }
}

export const currentMonth = dayjs().format('YYYY-MM')

export const mockSalaryItems: SalaryItem[] = [
  { id: 1, name: '基本工资', code: 'base_salary', type: 'earning', description: '每月固定基本工资', isTaxable: true, isFixed: true, defaultValue: 0, status: 'active', sort: 1, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, name: '绩效工资', code: 'performance', type: 'earning', description: '根据绩效考核发放', isTaxable: true, isFixed: false, defaultValue: 0, status: 'active', sort: 2, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 3, name: '加班费', code: 'overtime', type: 'earning', description: '加班工资报酬', isTaxable: true, isFixed: false, defaultValue: 0, status: 'active', sort: 3, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 4, name: '奖金', code: 'bonus', type: 'earning', description: '各类奖金补贴', isTaxable: true, isFixed: false, defaultValue: 0, status: 'active', sort: 4, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 5, name: '津贴补贴', code: 'allowance', type: 'earning', description: '岗位津贴、交通补贴等', isTaxable: true, isFixed: true, defaultValue: 500, status: 'active', sort: 5, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 6, name: '其他收入', code: 'other_earning', type: 'earning', description: '其他应税收入', isTaxable: true, isFixed: false, defaultValue: 0, status: 'active', sort: 6, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 7, name: '养老保险(个人)', code: 'pension', type: 'deduction', description: '养老保险个人缴纳部分', isTaxable: false, isFixed: true, defaultValue: 0, status: 'active', sort: 7, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 8, name: '医疗保险(个人)', code: 'medical', type: 'deduction', description: '医疗保险个人缴纳部分', isTaxable: false, isFixed: true, defaultValue: 0, status: 'active', sort: 8, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 9, name: '失业保险(个人)', code: 'unemployment', type: 'deduction', description: '失业保险个人缴纳部分', isTaxable: false, isFixed: true, defaultValue: 0, status: 'active', sort: 9, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 10, name: '住房公积金(个人)', code: 'housing_fund', type: 'deduction', description: '住房公积金个人缴纳部分', isTaxable: false, isFixed: true, defaultValue: 0, status: 'active', sort: 10, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 11, name: '个人所得税', code: 'income_tax', type: 'deduction', description: '个人所得税代扣代缴', isTaxable: false, isFixed: false, defaultValue: 0, status: 'active', sort: 11, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 12, name: '其他扣款', code: 'other_deduction', type: 'deduction', description: '其他应扣款项', isTaxable: true, isFixed: false, defaultValue: 0, status: 'active', sort: 12, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' }
]

const positionSalaryMap: Record<string, { base: number; performance: number }> = {
  '系统管理员': { base: 15000, performance: 3000 },
  'HR主管': { base: 12000, performance: 2500 },
  '技术总监': { base: 25000, performance: 5000 },
  '前端工程师': { base: 18000, performance: 3500 },
  '后端工程师': { base: 20000, performance: 4000 },
  '专员': { base: 8000, performance: 1500 }
}

function generateSalaryProfile(userId: number): EmployeeSalaryProfile {
  const user = mockUsers.find(u => u.id === userId)!
  const salaryInfo = positionSalaryMap[user.position] || { base: 8000, performance: 1500 }
  const baseSalary = salaryInfo.base + Math.floor(Math.random() * 2000) - 1000
  const socialSecurityBase = Math.min(Math.max(baseSalary * 0.8, 5000), 30000)
  
  return {
    id: userId,
    userId,
    userName: user.name,
    departmentName: user.departmentName,
    position: user.position,
    baseSalary,
    performanceSalary: salaryInfo.performance,
    allowance: 500,
    socialSecurityBase: Math.round(socialSecurityBase / 100) * 100,
    housingFundBase: Math.round(socialSecurityBase / 100) * 100,
    taxFreeAmount: 5000,
    effectiveDate: '2024-01-01',
    status: user.status,
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  }
}

export const mockSalaryProfiles: EmployeeSalaryProfile[] = mockUsers
  .filter(u => u.role !== 'super_admin' && u.status === 'active')
  .map(u => generateSalaryProfile(u.id))

export const mockSocialSecurityConfig: SocialSecurityConfig = {
  id: 1,
  pensionRate: 0.08,
  medicalRate: 0.02,
  unemploymentRate: 0.005,
  workInjuryRate: 0.002,
  maternityRate: 0.008,
  housingFundRate: 0.12,
  effectiveDate: '2024-01-01',
  createdAt: '2024-01-01 09:00:00',
  updatedAt: '2024-01-01 09:00:00'
}

export const mockTaxConfig: TaxConfig = {
  id: 1,
  threshold: 5000,
  brackets: [
    { min: 0, max: 3000, rate: 0.03, deduction: 0 },
    { min: 3000, max: 12000, rate: 0.1, deduction: 210 },
    { min: 12000, max: 25000, rate: 0.2, deduction: 1410 },
    { min: 25000, max: 35000, rate: 0.25, deduction: 2660 },
    { min: 35000, max: 55000, rate: 0.3, deduction: 4410 },
    { min: 55000, max: 80000, rate: 0.35, deduction: 7160 },
    { min: 80000, max: Infinity, rate: 0.45, deduction: 15160 }
  ],
  specialDeductions: [
    { name: '子女教育', code: 'children_education', amount: 0 },
    { name: '继续教育', code: 'continuing_education', amount: 0 },
    { name: '大病医疗', code: 'serious_illness', amount: 0 },
    { name: '住房贷款利息', code: 'housing_loan_interest', amount: 0 },
    { name: '住房租金', code: 'housing_rent', amount: 0 },
    { name: '赡养老人', code: 'elderly_care', amount: 0 }
  ],
  effectiveDate: '2024-01-01',
  createdAt: '2024-01-01 09:00:00',
  updatedAt: '2024-01-01 09:00:00'
}

function calculatePersonalIncomeTax(taxableIncome: number, config: TaxConfig): number {
  if (taxableIncome <= 0) return 0
  for (const bracket of config.brackets) {
    if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
      return Math.round((taxableIncome * bracket.rate - bracket.deduction) * 100) / 100
    }
  }
  if (taxableIncome > 80000) {
    return Math.round((taxableIncome * 0.45 - 15160) * 100) / 100
  }
  return 0
}

function generateSalaryRecord(userId: number, month: string): SalaryRecord {
  const user = mockUsers.find(u => u.id === userId)!
  const profile = mockSalaryProfiles.find(p => p.userId === userId) || generateSalaryProfile(userId)
  const report = calculatePersonalReport(userId, month)
  
  const attendanceRate = report.attendanceRate / 100
  const actualWorkDays = report.actualDays
  const standardWorkDays = report.workDays
  
  const baseSalary = Math.round(profile.baseSalary * attendanceRate * 100) / 100
  const performanceSalary = Math.round(profile.performanceSalary * (0.8 + Math.random() * 0.4) * 100) / 100
  const overtimePay = Math.round(Math.random() * 1000 * 100) / 100
  const bonus = Math.round(Math.random() * 2000 * 100) / 100
  const allowance = profile.allowance
  const otherEarnings = Math.round(Math.random() * 500 * 100) / 100
  
  const totalEarnings = Math.round((baseSalary + performanceSalary + overtimePay + bonus + allowance + otherEarnings) * 100) / 100
  
  const socialSecurityPersonal = Math.round(
    (profile.socialSecurityBase * (mockSocialSecurityConfig.pensionRate + mockSocialSecurityConfig.medicalRate + mockSocialSecurityConfig.unemploymentRate)) * 100
  ) / 100
  
  const housingFundPersonal = Math.round(
    (profile.housingFundBase * mockSocialSecurityConfig.housingFundRate) * 100
  ) / 100
  
  const taxableIncome = totalEarnings - socialSecurityPersonal - housingFundPersonal - profile.taxFreeAmount
  const personalIncomeTax = calculatePersonalIncomeTax(taxableIncome, mockTaxConfig)
  
  const otherDeductions = Math.round(Math.random() * 200 * 100) / 100
  const totalDeductions = Math.round((socialSecurityPersonal + housingFundPersonal + personalIncomeTax + otherDeductions) * 100) / 100
  
  const netSalary = Math.round((totalEarnings - totalDeductions) * 100) / 100
  
  const details: SalaryDetailItem[] = [
    { itemId: 1, itemName: '基本工资', itemCode: 'base_salary', type: 'earning', amount: baseSalary, isTaxable: true },
    { itemId: 2, itemName: '绩效工资', itemCode: 'performance', type: 'earning', amount: performanceSalary, isTaxable: true },
    { itemId: 3, itemName: '加班费', itemCode: 'overtime', type: 'earning', amount: overtimePay, isTaxable: true },
    { itemId: 4, itemName: '奖金', itemCode: 'bonus', type: 'earning', amount: bonus, isTaxable: true },
    { itemId: 5, itemName: '津贴补贴', itemCode: 'allowance', type: 'earning', amount: allowance, isTaxable: true },
    { itemId: 6, itemName: '其他收入', itemCode: 'other_earning', type: 'earning', amount: otherEarnings, isTaxable: true },
    { itemId: 7, itemName: '养老保险(个人)', itemCode: 'pension', type: 'deduction', amount: Math.round(profile.socialSecurityBase * mockSocialSecurityConfig.pensionRate * 100) / 100, isTaxable: false },
    { itemId: 8, itemName: '医疗保险(个人)', itemCode: 'medical', type: 'deduction', amount: Math.round(profile.socialSecurityBase * mockSocialSecurityConfig.medicalRate * 100) / 100, isTaxable: false },
    { itemId: 9, itemName: '失业保险(个人)', itemCode: 'unemployment', type: 'deduction', amount: Math.round(profile.socialSecurityBase * mockSocialSecurityConfig.unemploymentRate * 100) / 100, isTaxable: false },
    { itemId: 10, itemName: '住房公积金(个人)', itemCode: 'housing_fund', type: 'deduction', amount: housingFundPersonal, isTaxable: false },
    { itemId: 11, itemName: '个人所得税', itemCode: 'income_tax', type: 'deduction', amount: personalIncomeTax, isTaxable: false },
    { itemId: 12, itemName: '其他扣款', itemCode: 'other_deduction', type: 'deduction', amount: otherDeductions, isTaxable: true }
  ]
  
  const statuses: ('draft' | 'confirmed' | 'paid')[] = ['paid', 'confirmed', 'draft']
  const currentMonthStr = dayjs().format('YYYY-MM')
  let status: 'draft' | 'confirmed' | 'paid' = 'paid'
  
  if (month === currentMonthStr) {
    status = 'draft'
  } else if (month === dayjs().subtract(1, 'month').format('YYYY-MM')) {
    status = statuses[Math.floor(Math.random() * 2)]
  }
  
  return {
    id: userId * 100 + parseInt(month.replace('-', '')),
    userId,
    userName: user.name,
    departmentName: user.departmentName,
    position: user.position,
    month,
    baseSalary,
    performanceSalary,
    overtimePay,
    bonus,
    allowance,
    otherEarnings,
    totalEarnings,
    socialSecurityPersonal,
    housingFundPersonal,
    personalIncomeTax,
    otherDeductions,
    totalDeductions,
    netSalary,
    actualWorkDays,
    standardWorkDays,
    attendanceRate: report.attendanceRate,
    details,
    status,
    createdAt: `${month}-01 09:00:00`,
    updatedAt: `${month}-15 09:00:00`
  }
}

function generateAllSalaryRecords(): SalaryRecord[] {
  const records: SalaryRecord[] = []
  const activeUsers = mockUsers.filter(u => u.role !== 'super_admin' && u.status === 'active')
  
  for (let m = 5; m >= 0; m--) {
    const month = dayjs().subtract(m, 'month').format('YYYY-MM')
    activeUsers.forEach(user => {
      records.push(generateSalaryRecord(user.id, month))
    })
  }
  
  return records
}

export const mockSalaryRecords: SalaryRecord[] = generateAllSalaryRecords()

export function calculateSalaryStatistics(month: string): SalaryStatistics {
  const monthRecords = mockSalaryRecords.filter(r => r.month === month)
  const paidRecords = monthRecords.filter(r => r.status === 'paid')
  
  const totalBaseSalary = monthRecords.reduce((sum, r) => sum + r.baseSalary, 0)
  const totalPerformanceSalary = monthRecords.reduce((sum, r) => sum + r.performanceSalary, 0)
  const totalOvertimePay = monthRecords.reduce((sum, r) => sum + r.overtimePay, 0)
  const totalBonus = monthRecords.reduce((sum, r) => sum + r.bonus, 0)
  const totalAllowance = monthRecords.reduce((sum, r) => sum + r.allowance, 0)
  const totalEarnings = monthRecords.reduce((sum, r) => sum + r.totalEarnings, 0)
  const totalSocialSecurityPersonal = monthRecords.reduce((sum, r) => sum + r.socialSecurityPersonal, 0)
  const totalHousingFundPersonal = monthRecords.reduce((sum, r) => sum + r.housingFundPersonal, 0)
  const totalPersonalIncomeTax = monthRecords.reduce((sum, r) => sum + r.personalIncomeTax, 0)
  const totalDeductions = monthRecords.reduce((sum, r) => sum + r.totalDeductions, 0)
  const totalNetSalary = monthRecords.reduce((sum, r) => sum + r.netSalary, 0)
  
  const netSalaries = monthRecords.map(r => r.netSalary)
  const avgNetSalary = Math.round((totalNetSalary / monthRecords.length) * 100) / 100
  const maxNetSalary = Math.max(...netSalaries)
  const minNetSalary = Math.min(...netSalaries)
  
  const deptMap = new Map<number, { deptId: number; deptName: string; total: number; count: number }>()
  monthRecords.forEach(r => {
    const dept = mockDepartments.find(d => d.name === r.departmentName)
    if (dept) {
      const existing = deptMap.get(dept.id)
      if (existing) {
        existing.total += r.netSalary
        existing.count++
      } else {
        deptMap.set(dept.id, { deptId: dept.id, deptName: dept.name, total: r.netSalary, count: 1 })
      }
    }
  })
  
  const departmentSalaryStats = Array.from(deptMap.values()).map(d => ({
    departmentId: d.deptId,
    departmentName: d.deptName,
    employeeCount: d.count,
    totalNetSalary: Math.round(d.total * 100) / 100,
    avgNetSalary: Math.round((d.total / d.count) * 100) / 100
  }))
  
  const ranges = [
    { min: 0, max: 8000, label: '8000以下' },
    { min: 8000, max: 12000, label: '8000-12000' },
    { min: 12000, max: 20000, label: '12000-20000' },
    { min: 20000, max: 30000, label: '20000-30000' },
    { min: 30000, max: Infinity, label: '30000以上' }
  ]
  
  const salaryDistribution = ranges.map(range => {
    const count = monthRecords.filter(r => r.netSalary > range.min && r.netSalary <= range.max).length
    return {
      range: range.label,
      count,
      percentage: Math.round((count / monthRecords.length) * 1000) / 10
    }
  })
  
  const monthlyTrend: { month: string; totalNetSalary: number; avgNetSalary: number; employeeCount: number }[] = []
  for (let m = 5; m >= 0; m--) {
    const mStr = dayjs().subtract(m, 'month').format('YYYY-MM')
    const mRecords = mockSalaryRecords.filter(r => r.month === mStr)
    const mTotal = mRecords.reduce((sum, r) => sum + r.netSalary, 0)
    monthlyTrend.push({
      month: mStr,
      totalNetSalary: Math.round(mTotal * 100) / 100,
      avgNetSalary: mRecords.length > 0 ? Math.round((mTotal / mRecords.length) * 100) / 100 : 0,
      employeeCount: mRecords.length
    })
  }
  
  return {
    month,
    totalEmployees: monthRecords.length,
    paidEmployees: paidRecords.length,
    totalBaseSalary: Math.round(totalBaseSalary * 100) / 100,
    totalPerformanceSalary: Math.round(totalPerformanceSalary * 100) / 100,
    totalOvertimePay: Math.round(totalOvertimePay * 100) / 100,
    totalBonus: Math.round(totalBonus * 100) / 100,
    totalAllowance: Math.round(totalAllowance * 100) / 100,
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    totalSocialSecurityPersonal: Math.round(totalSocialSecurityPersonal * 100) / 100,
    totalHousingFundPersonal: Math.round(totalHousingFundPersonal * 100) / 100,
    totalPersonalIncomeTax: Math.round(totalPersonalIncomeTax * 100) / 100,
    totalDeductions: Math.round(totalDeductions * 100) / 100,
    totalNetSalary: Math.round(totalNetSalary * 100) / 100,
    avgNetSalary,
    maxNetSalary,
    minNetSalary,
    departmentSalaryStats,
    salaryDistribution,
    monthlyTrend
  }
}

export function calculateSalary(params: SalaryCalculationParams): SalaryRecord[] {
  const { month, departmentId, userId } = params
  let records: SalaryRecord[] = []
  
  let users = mockUsers.filter(u => u.role !== 'super_admin' && u.status === 'active')
  if (departmentId) {
    users = users.filter(u => u.departmentId === departmentId)
  }
  if (userId) {
    users = users.filter(u => u.id === userId)
  }
  
  users.forEach(user => {
    const existingRecord = mockSalaryRecords.find(r => r.userId === user.id && r.month === month)
    if (existingRecord) {
      records.push(existingRecord)
    } else {
      records.push(generateSalaryRecord(user.id, month))
    }
  })
  
  return records
}

export const contractTypeMap: Record<ContractType, string> = {
  fixed_term: '固定期限',
  open_ended: '无固定期限',
  part_time: '非全日制',
  probation: '试用期',
  project: '项目制'
}

export const contractStatusMap: Record<ContractStatus, string> = {
  draft: '草稿',
  pending_approval: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  signed: '已签署',
  active: '履行中',
  expired: '已到期',
  terminated: '已终止',
  archived: '已归档'
}

export const contractStatusTagMap: Record<ContractStatus, string> = {
  draft: 'info',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  signed: 'success',
  active: 'success',
  expired: 'info',
  terminated: 'danger',
  archived: 'info'
}

export const mockContractTemplates: ContractTemplate[] = [
  {
    id: 1,
    name: '标准劳动合同模板',
    code: 'STD_LABOR_001',
    type: 'fixed_term',
    version: 'v1.0',
    content: `甲方（用人单位）：____________________
法定代表人：____________________
地址：____________________

乙方（劳动者）：____________________
身份证号码：____________________
地址：____________________

根据《中华人民共和国劳动法》、《中华人民共和国劳动合同法》等法律法规的规定，甲乙双方本着平等自愿、协商一致、合法公平、诚实信用的原则，签订本劳动合同，并承诺共同遵守：

一、合同期限
本合同为固定期限劳动合同，合同期限自____年__月__日起至____年__月__日止。其中试用期为__个月，自____年__月__日起至____年__月__日止。

二、工作内容和工作地点
1. 乙方同意根据甲方工作需要，担任____岗位工作。
2. 工作地点为：____________________

三、工作时间和休息休假
1. 甲方实行____工时制度。
2. 乙方依法享有法定节假日、年休假、婚假、产假等假期。

四、劳动报酬
1. 乙方月工资为人民币____元。
2. 甲方每月__日以货币形式支付乙方工资。

五、社会保险和福利待遇
甲乙双方必须依法参加社会保险，甲方按所在地规定的一定比例按月为乙方缴纳养老、医疗、工伤、失业、生育保险费，乙方个人负担的部分，由甲方代乙方在其工资中扣缴。

六、劳动保护、劳动条件和职业危害防护
甲方必须为乙方提供符合国家规定的劳动安全卫生条件和必要的劳动防护用品。

七、劳动合同的解除和终止
（一）经甲乙双方协商一致，可以解除本合同。
（二）乙方有下列情形之一的，甲方可以随时解除本合同：
1. 在试用期间被证明不符合录用条件的；
2. 严重违反甲方规章制度的；
3. 严重失职，营私舞弊，给甲方造成重大损害的；
4. 劳动者同时与其他用人单位建立劳动关系，对完成本单位的工作任务造成严重影响，或者经用人单位提出，拒不改正的；
5. 被依法追究刑事责任的。

八、其他约定事项

九、争议处理
因履行本合同发生的劳动争议，双方可以协商解决；协商不成的，可以向甲方所在地劳动争议仲裁委员会申请仲裁。

本合同一式两份，甲乙双方各执一份，自双方签字盖章之日起生效。

甲方（盖章）：                    乙方（签字）：
法定代表人：
日期：____年__月__日              日期：____年__月__日`,
    placeholderFields: [
      'employer_name', 'employer_legal_rep', 'employer_address',
      'employee_name', 'employee_id_card', 'employee_address',
      'start_date', 'end_date', 'probation_months',
      'position', 'work_location', 'work_hours',
      'salary', 'pay_day'
    ],
    isDefault: true,
    status: 'active',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '无固定期限劳动合同模板',
    code: 'OPEN_LABOR_001',
    type: 'open_ended',
    version: 'v1.0',
    content: '无固定期限劳动合同模板内容...',
    placeholderFields: [
      'employer_name', 'employee_name', 'position', 'salary', 'start_date'
    ],
    isDefault: false,
    status: 'active',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00'
  },
  {
    id: 3,
    name: '试用期劳动合同模板',
    code: 'PROBATION_001',
    type: 'probation',
    version: 'v1.0',
    content: '试用期劳动合同模板内容...',
    placeholderFields: [
      'employer_name', 'employee_name', 'position', 'probation_salary', 'probation_months'
    ],
    isDefault: false,
    status: 'inactive',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-03-01 09:00:00',
    updatedAt: '2024-03-10 14:00:00'
  }
]

function evaluateCondition(condition: any, contract: any): boolean {
  const { type, operator, value } = condition
  let actualValue: any
  
  switch (type) {
    case 'amount':
      actualValue = contract.salaryInfo?.baseSalary || 0
      break
    case 'contract_type':
      actualValue = contract.type
      break
    case 'department':
      actualValue = contract.workInfo?.departmentId
      break
    case 'probation':
      actualValue = contract.workInfo?.probationPeriod || 0
      break
    default:
      return true
  }
  
  switch (operator) {
    case 'gt': return actualValue > value
    case 'gte': return actualValue >= value
    case 'lt': return actualValue < value
    case 'lte': return actualValue <= value
    case 'eq': return actualValue === value
    case 'in': return Array.isArray(value) && value.includes(actualValue)
    case 'not_in': return Array.isArray(value) && !value.includes(actualValue)
    default: return true
  }
}

function getApproverByRole(role: string, departmentId?: number): { id: number; name: string } {
  const roleUserMap: Record<string, { id: number; name: string }> = {
    manager: departmentId === 2 
      ? { id: 62, name: '赵明' }
      : { id: 3, name: '张伟' },
    hr_admin: { id: 2, name: '李华' },
    legal: { id: 60, name: '陈静' },
    finance: { id: 61, name: '刘强' },
    super_admin: { id: 1, name: '超级管理员' },
    admin: { id: 1, name: '超级管理员' }
  }
  return roleUserMap[role] || { id: 1, name: '超级管理员' }
}

function generateContractApprovalSteps(contract: any): ApprovalStep[] {
  const flow = mockContractApprovalFlows.find(f => f.contractType === contract.type) 
    || mockContractApprovalFlows.find(f => f.isDefault)
  if (!flow) return []
  
  const steps: ApprovalStep[] = []
  let effectiveStepOrder = 1
  
  flow.steps.forEach((stepConfig, index) => {
    if (stepConfig.conditions && stepConfig.conditions.length > 0) {
      const allConditionsMet = stepConfig.conditions.every(cond => evaluateCondition(cond, contract))
      if (!allConditionsMet) return
    }
    
    const approver = getApproverByRole(stepConfig.role, contract.workInfo?.departmentId)
    const now = dayjs()
    const deadline = stepConfig.deadlineHours 
      ? now.add(stepConfig.deadlineHours, 'hour').format('YYYY-MM-DD HH:mm:ss')
      : undefined
    
    const isBeforePending = contract.status === 'pending_approval' && index < 1
    const isPending = contract.status === 'pending_approval' && index === 1
    
    steps.push({
      id: contract.id * 100 + effectiveStepOrder,
      stepOrder: effectiveStepOrder,
      stepName: stepConfig.stepName,
      approverId: approver.id,
      approverName: approver.name,
      approverRole: stepConfig.role,
      approverRoleName: stepConfig.roleName,
      mode: stepConfig.mode,
      status: isBeforePending ? 'approved' : (isPending ? 'pending' : 'pending'),
      comment: isBeforePending ? '信息审核通过，同意提交' : '',
      approvedAt: isBeforePending 
        ? dayjs().subtract(Math.floor(Math.random() * 24) + 1, 'hour').format('YYYY-MM-DD HH:mm:ss')
        : undefined,
      deadline,
      canDelegate: stepConfig.canDelegate,
      canReturn: stepConfig.canReturn,
      canAddSign: stepConfig.canAddSign
    } as any)
    
    effectiveStepOrder++
  })
  
  return steps
}

function generateContractSignatories(contractId: number, userName: string): ContractSignatory[] {
  return [
    {
      id: contractId * 100 + 1,
      userId: 2,
      userName: '李华',
      role: 'hr',
      signatureData: undefined,
      signedAt: undefined,
      status: 'pending'
    },
    {
      id: contractId * 100 + 2,
      userId: 0,
      userName: userName,
      role: 'employee',
      signatureData: undefined,
      signedAt: undefined,
      status: 'pending'
    }
  ]
}

function generateMockContracts(): WorkerContract[] {
  const contracts: WorkerContract[] = []
  const activeEmployees = mockUsers.filter(u => u.status === 'active' && u.role === 'employee')
  
  const statuses: ContractStatus[] = ['active', 'active', 'active', 'signed', 'pending_approval', 'expired', 'draft']
  
  activeEmployees.forEach((user, index) => {
    const startDate = dayjs().subtract(Math.floor(Math.random() * 24) + 1, 'month')
    const termMonths = [12, 24, 36][Math.floor(Math.random() * 3)]
    const endDate = startDate.add(termMonths, 'month')
    const status = statuses[index % statuses.length]
    
    const contract: WorkerContract = {
      id: index + 1,
      contractNo: `HT${dayjs().format('YYYY')}${String(index + 1).padStart(5, '0')}`,
      templateId: 1,
      templateName: '标准劳动合同模板',
      type: 'fixed_term',
      status,
      
      userId: user.id,
      userName: user.name,
      userIdCard: user.idCard,
      userPhone: user.phone,
      userEmail: user.email,
      userAddress: '北京市朝阳区某某路某某号',
      
      workInfo: {
        position: user.position,
        departmentId: user.departmentId,
        departmentName: user.departmentName,
        workLocation: '北京市',
        workHours: '09:00-18:00',
        workDays: '周一至周五',
        probationPeriod: 3,
        probationSalary: 6000
      },
      
      salaryInfo: {
        baseSalary: 8000 + Math.floor(Math.random() * 12000),
        performanceSalary: 2000 + Math.floor(Math.random() * 3000),
        overtimeSalary: 0,
        bonus: 5000,
        allowance: 1000,
        socialSecurityBase: 8000,
        housingFundBase: 8000,
        payCycle: 'monthly',
        payDay: 15
      },
      
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      termMonths,
      
      renewalCount: Math.floor(Math.random() * 2),
      lastRenewalDate: undefined,
      nextRenewalDate: endDate.subtract(1, 'month').format('YYYY-MM-DD'),
      expirationReminderSent: Math.random() > 0.5,
      
      content: undefined,
      attachments: [],
      
      approvalSteps: [],
      currentApprovalStep: 0,
      signatories: [] as any,
      
      remarks: '',
      terminationReason: undefined,
      terminatedAt: undefined,
      
      createdBy: 2,
      createdByName: '李华',
      createdAt: startDate.subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: startDate.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      signedAt: status === 'signed' || status === 'active' ? startDate.format('YYYY-MM-DD HH:mm:ss') : undefined,
      archivedAt: status === 'archived' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : undefined
    }
    
    if (status === 'pending_approval' || status === 'approved' || status === 'signed' || status === 'active') {
      contract.approvalSteps = generateContractApprovalSteps(contract)
      if (contract.approvalSteps.length > 0 && status === 'pending_approval') {
        const pendingStep = contract.approvalSteps.find(s => s.status === 'pending')
        contract.currentApprovalStep = pendingStep ? pendingStep.stepOrder : 0
      }
    }
    
    contract.signatories = status === 'signed' || status === 'active' 
      ? generateContractSignatories(contract.id, user.name).map(s => ({ ...s, status: 'signed' as const, signedAt: startDate.add(1, 'day').format('YYYY-MM-DD HH:mm:ss') }))
      : generateContractSignatories(contract.id, user.name)
    
    contracts.push(contract)
  })
  
  return contracts
}

export const mockContracts: WorkerContract[] = generateMockContracts()

export const mockContractReminders: ContractReminder[] = (() => {
  const reminders: ContractReminder[] = []
  const activeContracts = mockContracts.filter(c => c.status === 'active' || c.status === 'signed')
  
  activeContracts.forEach((contract, index) => {
    if (contract.endDate) {
      const endDate = dayjs(contract.endDate)
      const daysRemaining = endDate.diff(dayjs(), 'day')
      
      if (daysRemaining <= 90 && daysRemaining > 0) {
        reminders.push({
          id: index + 1,
          contractId: contract.id,
          contractNo: contract.contractNo,
          userName: contract.userName,
          departmentName: contract.workInfo.departmentName,
          type: daysRemaining <= 30 ? 'expiration' : 'renewal',
          reminderDate: endDate.subtract(30, 'day').format('YYYY-MM-DD'),
          daysRemaining,
          handled: false,
          createdAt: dayjs().subtract(Math.floor(Math.random() * 10), 'day').format('YYYY-MM-DD HH:mm:ss')
        })
      }
    }
    
    if (contract.workInfo.probationPeriod) {
      const probationEnd = dayjs(contract.startDate).add(contract.workInfo.probationPeriod, 'month')
      const daysRemaining = probationEnd.diff(dayjs(), 'day')
      
      if (daysRemaining <= 15 && daysRemaining > 0) {
        reminders.push({
          id: reminders.length + 1,
          contractId: contract.id,
          contractNo: contract.contractNo,
          userName: contract.userName,
          departmentName: contract.workInfo.departmentName,
          type: 'probation_end',
          reminderDate: probationEnd.subtract(7, 'day').format('YYYY-MM-DD'),
          daysRemaining,
          handled: false,
          createdAt: dayjs().subtract(Math.floor(Math.random() * 5), 'day').format('YYYY-MM-DD HH:mm:ss')
        })
      }
    }
  })
  
  return reminders
})()

export const mockContractApprovalFlows: ContractApprovalFlowConfig[] = [
  {
    id: 1,
    name: '标准劳动合同审批流程',
    contractType: 'fixed_term',
    description: '固定期限劳动合同标准审批流程，根据薪资金额自动路由到不同审核节点',
    steps: [
      {
        stepOrder: 1,
        stepName: '部门经理审核',
        role: 'manager',
        roleName: '部门经理',
        mode: 'sequential',
        requireComment: false,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      {
        stepOrder: 2,
        stepName: 'HR专员审核',
        role: 'hr_admin',
        roleName: 'HR管理员',
        mode: 'sequential',
        requireComment: false,
        deadlineHours: 12,
        canDelegate: true,
        canReturn: true,
        canAddSign: true
      },
      {
        stepOrder: 3,
        stepName: '财务审核',
        role: 'finance',
        roleName: '财务专员',
        mode: 'sequential',
        conditions: [{
          type: 'amount',
          operator: 'gte',
          value: 10000,
          description: '基本工资≥10000元需财务审核'
        }],
        requireComment: true,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      {
        stepOrder: 4,
        stepName: '法务审核',
        role: 'legal',
        roleName: '法务专员',
        mode: 'sequential',
        conditions: [{
          type: 'amount',
          operator: 'gte',
          value: 20000,
          description: '基本工资≥20000元需法务审核'
        }],
        requireComment: true,
        deadlineHours: 48,
        canDelegate: true,
        canReturn: true,
        canAddSign: true
      },
      {
        stepOrder: 5,
        stepName: '总经理审批',
        role: 'super_admin',
        roleName: '总经理',
        mode: 'sequential',
        conditions: [{
          type: 'amount',
          operator: 'gte',
          value: 50000,
          description: '基本工资≥50000元需总经理审批'
        }],
        requireComment: true,
        deadlineHours: 72,
        canDelegate: false,
        canReturn: true,
        canAddSign: false
      }
    ],
    isDefault: true,
    status: 'active',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-06-15 10:30:00'
  },
  {
    id: 2,
    name: '无固定期限劳动合同审批流程',
    contractType: 'open_ended',
    description: '无固定期限劳动合同审批流程，需经法务和总经理最终审批',
    steps: [
      {
        stepOrder: 1,
        stepName: '部门经理审核',
        role: 'manager',
        roleName: '部门经理',
        mode: 'sequential',
        requireComment: true,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      {
        stepOrder: 2,
        stepName: 'HR主管审核',
        role: 'hr_admin',
        roleName: 'HR管理员',
        mode: 'sequential',
        requireComment: true,
        deadlineHours: 12,
        canDelegate: true,
        canReturn: true,
        canAddSign: true
      },
      {
        stepOrder: 3,
        stepName: '财务审核',
        role: 'finance',
        roleName: '财务专员',
        mode: 'sequential',
        requireComment: true,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      {
        stepOrder: 4,
        stepName: '法务审核',
        role: 'legal',
        roleName: '法务专员',
        mode: 'sequential',
        requireComment: true,
        deadlineHours: 48,
        canDelegate: true,
        canReturn: true,
        canAddSign: true
      },
      {
        stepOrder: 5,
        stepName: '总经理审批',
        role: 'super_admin',
        roleName: '总经理',
        mode: 'sequential',
        requireComment: true,
        deadlineHours: 72,
        canDelegate: false,
        canReturn: true,
        canAddSign: false
      }
    ],
    isDefault: false,
    status: 'active',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-06-15 10:30:00'
  },
  {
    id: 3,
    name: '试用期合同审批流程',
    contractType: 'probation',
    description: '试用期劳动合同简易审批流程',
    steps: [
      {
        stepOrder: 1,
        stepName: '部门经理审核',
        role: 'manager',
        roleName: '部门经理',
        mode: 'sequential',
        requireComment: false,
        deadlineHours: 12,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      {
        stepOrder: 2,
        stepName: 'HR专员审核',
        role: 'hr_admin',
        roleName: 'HR管理员',
        mode: 'sequential',
        requireComment: false,
        deadlineHours: 12,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      }
    ],
    isDefault: false,
    status: 'active',
    createdBy: 1,
    createdByName: '超级管理员',
    createdAt: '2024-03-01 09:00:00',
    updatedAt: '2024-06-15 10:30:00'
  }
]

export const approvalRoleMap: Record<string, string> = {
  manager: '部门经理',
  hr_admin: 'HR管理员',
  legal: '法务专员',
  finance: '财务专员',
  admin: '系统管理员',
  super_admin: '总经理'
}

export const approvalModeMap: Record<string, string> = {
  sequential: '依次审批',
  countersign: '会签审批',
  any_sign: '或签审批'
}

export const approvalConditionTypeMap: Record<string, string> = {
  amount: '薪资金额',
  contract_type: '合同类型',
  department: '所属部门',
  probation: '试用期'
}

export const approvalOperatorMap: Record<string, string> = {
  gt: '大于',
  gte: '大于等于',
  lt: '小于',
  lte: '小于等于',
  eq: '等于',
  in: '包含',
  not_in: '不包含'
}

export function getContractStats() {
  const total = mockContracts.length
  const active = mockContracts.filter(c => c.status === 'active' || c.status === 'signed').length
  const pending = mockContracts.filter(c => c.status === 'pending_approval').length
  const expired = mockContracts.filter(c => c.status === 'expired').length
  const expiringSoon = mockContractReminders.filter(r => r.type === 'expiration' && !r.handled).length
  
  return {
    total,
    active,
    pending,
    expired,
    expiringSoon
  }
}
