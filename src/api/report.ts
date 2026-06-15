import type { DashboardStats, PersonalReport, DepartmentReport, MonthlyReport } from '@/types'
import {
  calculateDashboardStats,
  calculatePersonalReport,
  calculateDepartmentReport,
  calculateMonthlyReport
} from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(300)
  return calculateDashboardStats()
}

export async function getPersonalReport(userId: number, month: string): Promise<PersonalReport> {
  await delay(400)
  return calculatePersonalReport(userId, month)
}

export async function getDepartmentReport(departmentId: number, month: string): Promise<DepartmentReport> {
  await delay(500)
  return calculateDepartmentReport(departmentId, month)
}

export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  await delay(600)
  return calculateMonthlyReport(month)
}

export function exportCSV(data: any[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        let val = row[h]
        if (val === null || val === undefined) val = ''
        val = String(val).replace(/"/g, '""')
        if (val.includes(',') || val.includes('\n')) val = `"${val}"`
        return val
      }).join(',')
    )
  ].join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename + '.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
