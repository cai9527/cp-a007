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
  SalaryCalculationParams
} from '@/types'

export const mockDepartments: Department[] = [
  { id: 1, name: '总公司', parentId: null, employeeCount: 58, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 2, name: '技术部', parentId: 1, parentName: '总公司', employeeCount: 20, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 3, name: '产品部', parentId: 1, parentName: '总公司', employeeCount: 10, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 4, name: '人力资源部', parentId: 1, parentName: '总公司', employeeCount: 8, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 5, name: '财务部', parentId: 1, parentName: '总公司', employeeCount: 6, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
  { id: 6, name: '市场部', parentId: 1, parentName: '总公司', employeeCount: 14, createdAt: '2024-01-01 09:00:00', updatedAt: '2024-01-01 09:00:00' },
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
    description: '工资管理、薪资计算、工资报表、员工薪资档案',
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
      'salary:payslip:view', 'salary:payslip:export'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 5,
    name: '部门管理员',
    code: 'manager',
    description: '部门考勤管理、部门报表查看、请假审批',
    permissions: [
      'dashboard',
      'user:view',
      'attendance:view',
      'leave:view', 'leave:apply', 'leave:approve',
      'report:view',
      'alert'
    ],
    createdAt: '2024-01-01 09:00:00',
    updatedAt: '2024-01-01 09:00:00'
  },
  {
    id: 6,
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
