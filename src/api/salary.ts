import dayjs from 'dayjs'
import type {
  SalaryItem,
  EmployeeSalaryProfile,
  SalaryRecord,
  SalaryStatistics,
  SocialSecurityConfig,
  TaxConfig,
  PaginationParams,
  PaginatedResponse,
  SalaryCalculationParams
} from '@/types'
import {
  mockSalaryItems,
  mockSalaryProfiles,
  mockSalaryRecords,
  mockSocialSecurityConfig,
  mockTaxConfig,
  calculateSalaryStatistics,
  calculateSalary as mockCalculateSalary
} from '@/data/mockData'
import { mockUsers, mockDepartments } from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let salaryItemsClone: SalaryItem[] = JSON.parse(JSON.stringify(mockSalaryItems))
let salaryProfilesClone: EmployeeSalaryProfile[] = JSON.parse(JSON.stringify(mockSalaryProfiles))
let salaryRecordsClone: SalaryRecord[] = JSON.parse(JSON.stringify(mockSalaryRecords))
let socialSecurityConfigClone: SocialSecurityConfig = JSON.parse(JSON.stringify(mockSocialSecurityConfig))
let taxConfigClone: TaxConfig = JSON.parse(JSON.stringify(mockTaxConfig))

export async function getSalaryItems(
  params: PaginationParams & { type?: string; status?: string }
): Promise<PaginatedResponse<SalaryItem>> {
  await delay(300)
  let list = [...salaryItemsClone]
  if (params.type) {
    list = list.filter(i => i.type === params.type)
  }
  if (params.status) {
    list = list.filter(i => i.status === params.status)
  }
  list.sort((a, b) => a.sort - b.sort)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getAllSalaryItems(): Promise<SalaryItem[]> {
  await delay(200)
  return [...salaryItemsClone].filter(i => i.status === 'active').sort((a, b) => a.sort - b.sort)
}

export async function getSalaryItem(id: number): Promise<SalaryItem | null> {
  await delay(200)
  return salaryItemsClone.find(i => i.id === id) || null
}

export async function createSalaryItem(data: Omit<SalaryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryItem> {
  await delay(300)
  const newId = Math.max(...salaryItemsClone.map(i => i.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newItem: SalaryItem = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  salaryItemsClone.push(newItem)
  return newItem
}

export async function updateSalaryItem(id: number, data: Partial<SalaryItem>): Promise<SalaryItem | null> {
  await delay(300)
  const idx = salaryItemsClone.findIndex(i => i.id === id)
  if (idx === -1) return null
  salaryItemsClone[idx] = {
    ...salaryItemsClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return salaryItemsClone[idx]
}

export async function deleteSalaryItem(id: number): Promise<boolean> {
  await delay(300)
  const idx = salaryItemsClone.findIndex(i => i.id === id)
  if (idx === -1) return false
  salaryItemsClone.splice(idx, 1)
  return true
}

export async function getSalaryProfiles(
  params: PaginationParams & { departmentId?: number; keyword?: string }
): Promise<PaginatedResponse<EmployeeSalaryProfile>> {
  await delay(300)
  let list = [...salaryProfilesClone]
  if (params.departmentId) {
    const userIds = mockUsers.filter(u => u.departmentId === params.departmentId).map(u => u.id)
    list = list.filter(p => userIds.includes(p.userId))
  }
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase()
    list = list.filter(p => 
      p.userName.toLowerCase().includes(keyword) ||
      p.departmentName.toLowerCase().includes(keyword) ||
      p.position.toLowerCase().includes(keyword)
    )
  }
  list.sort((a, b) => a.id - b.id)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getSalaryProfile(userId: number): Promise<EmployeeSalaryProfile | null> {
  await delay(200)
  return salaryProfilesClone.find(p => p.userId === userId) || null
}

export async function createSalaryProfile(data: Omit<EmployeeSalaryProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeSalaryProfile> {
  await delay(300)
  const newId = Math.max(...salaryProfilesClone.map(p => p.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newProfile: EmployeeSalaryProfile = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  salaryProfilesClone.push(newProfile)
  return newProfile
}

export async function updateSalaryProfile(
  userId: number,
  data: Partial<EmployeeSalaryProfile>
): Promise<EmployeeSalaryProfile | null> {
  await delay(300)
  const idx = salaryProfilesClone.findIndex(p => p.userId === userId)
  if (idx === -1) return null
  salaryProfilesClone[idx] = {
    ...salaryProfilesClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return salaryProfilesClone[idx]
}

export async function getSalaryRecords(
  params: PaginationParams & {
    month?: string
    departmentId?: number
    userId?: number
    status?: string
  }
): Promise<PaginatedResponse<SalaryRecord>> {
  await delay(300)
  let list = [...salaryRecordsClone]
  if (params.month) {
    list = list.filter(r => r.month === params.month)
  }
  if (params.departmentId) {
    const userIds = mockUsers.filter(u => u.departmentId === params.departmentId).map(u => u.id)
    list = list.filter(r => userIds.includes(r.userId))
  }
  if (params.userId) {
    list = list.filter(r => r.userId === params.userId)
  }
  if (params.status) {
    list = list.filter(r => r.status === params.status)
  }
  list.sort((a, b) => b.month.localeCompare(a.month) || b.id - a.id)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getSalaryRecord(id: number): Promise<SalaryRecord | null> {
  await delay(200)
  return salaryRecordsClone.find(r => r.id === id) || null
}

export async function calculateSalary(params: SalaryCalculationParams): Promise<SalaryRecord[]> {
  await delay(500)
  const records = mockCalculateSalary(params)
  
  records.forEach(record => {
    const existingIdx = salaryRecordsClone.findIndex(r => r.userId === record.userId && r.month === record.month)
    if (existingIdx !== -1) {
      salaryRecordsClone[existingIdx] = {
        ...record,
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }
    } else {
      salaryRecordsClone.push(record)
    }
  })
  
  return records
}

export async function confirmSalary(month: string, confirmBy: number): Promise<boolean> {
  await delay(300)
  const confirmByName = mockUsers.find(u => u.id === confirmBy)?.name
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  salaryRecordsClone.forEach(record => {
    if (record.month === month && record.status === 'draft') {
      record.status = 'confirmed'
      record.confirmedBy = confirmBy
      record.confirmedByName = confirmByName
      record.confirmedAt = now
      record.updatedAt = now
    }
  })
  
  return true
}

export async function markAsPaid(month: string): Promise<boolean> {
  await delay(300)
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  salaryRecordsClone.forEach(record => {
    if (record.month === month && record.status === 'confirmed') {
      record.status = 'paid'
      record.paidAt = now
      record.updatedAt = now
    }
  })
  
  return true
}

export async function updateSalaryRecord(id: number, data: Partial<SalaryRecord>): Promise<SalaryRecord | null> {
  await delay(300)
  const idx = salaryRecordsClone.findIndex(r => r.id === id)
  if (idx === -1) return null
  
  salaryRecordsClone[idx] = {
    ...salaryRecordsClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  return salaryRecordsClone[idx]
}

export async function getSalaryStats(month: string): Promise<SalaryStatistics> {
  await delay(300)
  return calculateSalaryStatistics(month)
}

export async function getSocialSecurityConfig(): Promise<SocialSecurityConfig> {
  await delay(200)
  return socialSecurityConfigClone
}

export async function updateSocialSecurityConfig(data: Partial<SocialSecurityConfig>): Promise<SocialSecurityConfig> {
  await delay(300)
  Object.assign(socialSecurityConfigClone, data, { updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  return socialSecurityConfigClone
}

export async function getTaxConfig(): Promise<TaxConfig> {
  await delay(200)
  return taxConfigClone
}

export async function updateTaxConfig(data: Partial<TaxConfig>): Promise<TaxConfig> {
  await delay(300)
  Object.assign(taxConfigClone, data, { updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss') })
  return taxConfigClone
}

export async function exportSalaryReport(month: string, format: 'excel' | 'pdf' = 'excel'): Promise<{ success: boolean; url?: string }> {
  await delay(1000)
  return {
    success: true,
    url: `/salary/report/${month}.${format}`
  }
}

export async function exportPayslip(userId: number, month: string): Promise<{ success: boolean; url?: string }> {
  await delay(500)
  return {
    success: true,
    url: `/payslip/${userId}/${month}.pdf`
  }
}

export async function batchExportPayslips(month: string): Promise<{ success: boolean; url?: string }> {
  await delay(1000)
  return {
    success: true,
    url: `/payslips/${month}.zip`
  }
}
