import dayjs from 'dayjs'
import type { User, PaginationParams, PaginatedResponse, Department, Role, Permission } from '@/types'
import { mockUsers, mockDepartments, mockRoles, mockPermissions } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
let usersClone: User[] = JSON.parse(JSON.stringify(mockUsers))

export async function getUsers(
  params: PaginationParams & { keyword?: string; departmentId?: number; role?: string; status?: string }
): Promise<PaginatedResponse<User>> {
  await delay(300)
  let list = [...usersClone]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(u =>
      u.name.toLowerCase().includes(kw) ||
      u.username.toLowerCase().includes(kw) ||
      u.phone.includes(kw) ||
      u.email.toLowerCase().includes(kw)
    )
  }
  if (params.departmentId) {
    const deptIds = [params.departmentId]
    const children = mockDepartments.filter(d => d.parentId === params.departmentId)
    children.forEach(c => deptIds.push(c.id))
    list = list.filter(u => deptIds.includes(u.departmentId))
  }
  if (params.role) {
    list = list.filter(u => u.role === params.role)
  }
  if (params.status) {
    list = list.filter(u => u.status === params.status)
  }
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getUser(id: number): Promise<User | null> {
  await delay(200)
  return usersClone.find(u => u.id === id) || null
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  await delay(300)
  const newId = Math.max(...usersClone.map(u => u.id)) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const dept = mockDepartments.find(d => d.id === userData.departmentId)
  const newUser: User = {
    id: newId,
    ...userData,
    departmentName: dept?.name || userData.departmentName,
    createdAt: now,
    updatedAt: now
  }
  usersClone.push(newUser)
  return newUser
}

export async function updateUser(id: number, userData: Partial<User>): Promise<User | null> {
  await delay(300)
  const idx = usersClone.findIndex(u => u.id === id)
  if (idx === -1) return null
  const dept = userData.departmentId ? mockDepartments.find(d => d.id === userData.departmentId) : null
  usersClone[idx] = {
    ...usersClone[idx],
    ...userData,
    ...(dept ? { departmentName: dept.name } : {}),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return usersClone[idx]
}

export async function deleteUser(id: number): Promise<boolean> {
  await delay(300)
  const idx = usersClone.findIndex(u => u.id === id)
  if (idx === -1) return false
  usersClone.splice(idx, 1)
  return true
}

export async function getDepartments(): Promise<Department[]> {
  await delay(200)
  return mockDepartments
}

export async function createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
  await delay(300)
  const newId = Math.max(...mockDepartments.map(d => d.id)) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const parent = data.parentId ? mockDepartments.find(d => d.id === data.parentId) : null
  const newDept: Department = {
    id: newId,
    ...data,
    parentName: parent?.name,
    employeeCount: 0,
    createdAt: now,
    updatedAt: now
  }
  mockDepartments.push(newDept)
  return newDept
}

export async function updateDepartment(id: number, data: Partial<Department>): Promise<Department | null> {
  await delay(300)
  const idx = mockDepartments.findIndex(d => d.id === id)
  if (idx === -1) return null
  mockDepartments[idx] = {
    ...mockDepartments[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return mockDepartments[idx]
}

export async function deleteDepartment(id: number): Promise<boolean> {
  await delay(300)
  const idx = mockDepartments.findIndex(d => d.id === id)
  if (idx === -1) return false
  if (mockDepartments.some(d => d.parentId === id)) {
    throw new Error('存在下级部门，无法删除')
  }
  if (usersClone.some(u => u.departmentId === id)) {
    throw new Error('部门下存在员工，无法删除')
  }
  mockDepartments.splice(idx, 1)
  return true
}

export async function getRoles(): Promise<Role[]> {
  await delay(200)
  return mockRoles
}

export async function getPermissions(): Promise<Permission[]> {
  await delay(200)
  return mockPermissions
}

export async function updateRole(id: number, data: Partial<Role>): Promise<Role | null> {
  await delay(300)
  const idx = mockRoles.findIndex(r => r.id === id)
  if (idx === -1) return null
  mockRoles[idx] = {
    ...mockRoles[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return mockRoles[idx]
}
