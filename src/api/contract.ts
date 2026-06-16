import dayjs from 'dayjs'
import type {
  ContractTemplate,
  WorkerContract,
  ContractReminder,
  ContractApprovalFlowConfig,
  PaginationParams,
  PaginatedResponse,
  ContractStatus,
  ContractType
} from '@/types'
import {
  mockContractTemplates,
  mockContracts,
  mockContractReminders,
  mockContractApprovalFlows,
  getContractStats as getMockContractStats
} from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

let templatesClone: ContractTemplate[] = JSON.parse(JSON.stringify(mockContractTemplates))
let contractsClone: WorkerContract[] = JSON.parse(JSON.stringify(mockContracts))
let remindersClone: ContractReminder[] = JSON.parse(JSON.stringify(mockContractReminders))
let approvalFlowsClone: ContractApprovalFlowConfig[] = JSON.parse(JSON.stringify(mockContractApprovalFlows))

export async function getContractStats() {
  await delay(200)
  return getMockContractStats()
}

export async function getContractTemplates(
  params: PaginationParams & { type?: string; status?: string; keyword?: string }
): Promise<PaginatedResponse<ContractTemplate>> {
  await delay(300)
  let list = [...templatesClone]
  if (params.type) {
    list = list.filter(i => i.type === params.type)
  }
  if (params.status) {
    list = list.filter(i => i.status === params.status)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(kw) || i.code.toLowerCase().includes(kw))
  }
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getAllContractTemplates(): Promise<ContractTemplate[]> {
  await delay(200)
  return [...templatesClone].filter(i => i.status === 'active')
}

export async function getContractTemplate(id: number): Promise<ContractTemplate | null> {
  await delay(200)
  return templatesClone.find(i => i.id === id) || null
}

export async function createContractTemplate(data: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
  await delay(300)
  const newId = Math.max(...templatesClone.map(i => i.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newItem: ContractTemplate = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  templatesClone.push(newItem)
  return newItem
}

export async function updateContractTemplate(id: number, data: Partial<ContractTemplate>): Promise<ContractTemplate | null> {
  await delay(300)
  const idx = templatesClone.findIndex(i => i.id === id)
  if (idx === -1) return null
  templatesClone[idx] = {
    ...templatesClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return templatesClone[idx]
}

export async function deleteContractTemplate(id: number): Promise<boolean> {
  await delay(300)
  const idx = templatesClone.findIndex(i => i.id === id)
  if (idx === -1) return false
  templatesClone.splice(idx, 1)
  return true
}

export async function getContracts(
  params: PaginationParams & { 
    status?: ContractStatus
    type?: ContractType
    departmentId?: number
    keyword?: string
    startDateFrom?: string
    startDateTo?: string
    endDateFrom?: string
    endDateTo?: string
  }
): Promise<PaginatedResponse<WorkerContract>> {
  await delay(300)
  let list = [...contractsClone]
  
  if (params.status) {
    list = list.filter(i => i.status === params.status)
  }
  if (params.type) {
    list = list.filter(i => i.type === params.type)
  }
  if (params.departmentId) {
    list = list.filter(i => i.workInfo.departmentId === params.departmentId)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(i => 
      i.contractNo.toLowerCase().includes(kw) || 
      i.userName.toLowerCase().includes(kw) ||
      i.userIdCard.includes(kw)
    )
  }
  if (params.startDateFrom) {
    list = list.filter(i => i.startDate >= params.startDateFrom!)
  }
  if (params.startDateTo) {
    list = list.filter(i => i.startDate <= params.startDateTo!)
  }
  if (params.endDateFrom) {
    list = list.filter(i => i.endDate && i.endDate >= params.endDateFrom!)
  }
  if (params.endDateTo) {
    list = list.filter(i => i.endDate && i.endDate <= params.endDateTo!)
  }
  
  list.sort((a, b) => b.id - a.id)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getContract(id: number): Promise<WorkerContract | null> {
  await delay(200)
  return contractsClone.find(i => i.id === id) || null
}

export async function createContract(data: Omit<WorkerContract, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkerContract> {
  await delay(300)
  const newId = Math.max(...contractsClone.map(i => i.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newItem: WorkerContract = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  contractsClone.push(newItem)
  return newItem
}

export async function updateContract(id: number, data: Partial<WorkerContract>): Promise<WorkerContract | null> {
  await delay(300)
  const idx = contractsClone.findIndex(i => i.id === id)
  if (idx === -1) return null
  contractsClone[idx] = {
    ...contractsClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return contractsClone[idx]
}

export async function deleteContract(id: number): Promise<boolean> {
  await delay(300)
  const idx = contractsClone.findIndex(i => i.id === id)
  if (idx === -1) return false
  contractsClone.splice(idx, 1)
  return true
}

export async function submitContractForApproval(id: number): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  contract.status = 'pending_approval'
  contract.currentApprovalStep = 1
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function approveContract(id: number, stepOrder: number, comment?: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  
  const step = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (step) {
    step.status = 'approved'
    step.comment = comment
    step.approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  const nextStep = contract.approvalSteps.find(s => s.status === 'pending')
  if (nextStep) {
    contract.currentApprovalStep = nextStep.stepOrder
  } else {
    contract.status = 'approved'
    contract.currentApprovalStep = 0
  }
  
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function rejectContract(id: number, stepOrder: number, comment?: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  
  const step = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (step) {
    step.status = 'rejected'
    step.comment = comment
    step.approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  contract.status = 'rejected'
  contract.currentApprovalStep = 0
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function signContract(id: number, signatoryId: number, signatureData: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  
  const signatory = contract.signatories.find(s => s.id === signatoryId)
  if (signatory) {
    signatory.status = 'signed'
    signatory.signatureData = signatureData
    signatory.signedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  const allSigned = contract.signatories.every(s => s.status === 'signed')
  if (allSigned) {
    contract.status = 'signed'
    contract.signedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function archiveContract(id: number): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  contract.status = 'archived'
  contract.archivedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function terminateContract(id: number, reason: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  contract.status = 'terminated'
  contract.terminationReason = reason
  contract.terminatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function renewContract(id: number, newEndDate: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  
  contract.lastRenewalDate = contract.endDate
  contract.endDate = newEndDate
  contract.renewalCount = (contract.renewalCount || 0) + 1
  contract.status = 'active'
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  return contract
}

export async function getContractReminders(
  params: PaginationParams & { type?: string; handled?: boolean; keyword?: string }
): Promise<PaginatedResponse<ContractReminder>> {
  await delay(300)
  let list = [...remindersClone]
  
  if (params.type) {
    list = list.filter(i => i.type === params.type)
  }
  if (params.handled !== undefined) {
    list = list.filter(i => i.handled === params.handled)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(i => 
      i.contractNo.toLowerCase().includes(kw) || 
      i.userName.toLowerCase().includes(kw)
    )
  }
  
  list.sort((a, b) => a.daysRemaining - b.daysRemaining)
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function handleContractReminder(id: number): Promise<boolean> {
  await delay(200)
  const reminder = remindersClone.find(r => r.id === id)
  if (!reminder) return false
  reminder.handled = true
  reminder.handledAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return true
}

export async function getContractApprovalFlows(
  params: PaginationParams & { contractType?: string; status?: string }
): Promise<PaginatedResponse<ContractApprovalFlowConfig>> {
  await delay(300)
  let list = [...approvalFlowsClone]
  if (params.contractType) {
    list = list.filter(i => i.contractType === params.contractType)
  }
  if (params.status) {
    list = list.filter(i => i.status === params.status)
  }
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getAllContractApprovalFlows(): Promise<ContractApprovalFlowConfig[]> {
  await delay(200)
  return [...approvalFlowsClone].filter(i => i.status === 'active')
}

export async function getContractApprovalFlow(id: number): Promise<ContractApprovalFlowConfig | null> {
  await delay(200)
  return approvalFlowsClone.find(i => i.id === id) || null
}

export async function createContractApprovalFlow(data: Omit<ContractApprovalFlowConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractApprovalFlowConfig> {
  await delay(300)
  const newId = Math.max(...approvalFlowsClone.map(i => i.id), 0) + 1
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  const newItem: ContractApprovalFlowConfig = {
    id: newId,
    ...data,
    createdAt: now,
    updatedAt: now
  }
  approvalFlowsClone.push(newItem)
  return newItem
}

export async function updateContractApprovalFlow(id: number, data: Partial<ContractApprovalFlowConfig>): Promise<ContractApprovalFlowConfig | null> {
  await delay(300)
  const idx = approvalFlowsClone.findIndex(i => i.id === id)
  if (idx === -1) return null
  approvalFlowsClone[idx] = {
    ...approvalFlowsClone[idx],
    ...data,
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
  }
  return approvalFlowsClone[idx]
}

export async function deleteContractApprovalFlow(id: number): Promise<boolean> {
  await delay(300)
  const idx = approvalFlowsClone.findIndex(i => i.id === id)
  if (idx === -1) return false
  approvalFlowsClone.splice(idx, 1)
  return true
}

export function generateContractNo(): string {
  const year = dayjs().format('YYYY')
  const random = String(Math.floor(Math.random() * 90000) + 10000)
  return `HT${year}${random}`
}
