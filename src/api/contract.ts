import dayjs from 'dayjs'
import type {
  ContractTemplate,
  WorkerContract,
  ContractReminder,
  ContractApprovalFlowConfig,
  PaginationParams,
  PaginatedResponse,
  ContractStatus,
  ContractType,
  ApprovalPermissionError,
  BatchOperationResult,
  BatchOperationResultItem
} from '@/types'
import {
  mockContractTemplates,
  mockContracts,
  mockContractReminders,
  mockContractApprovalFlows,
  getContractStats as getMockContractStats
} from '@/data/mockData'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function getCurrentUser(): { id: number; role: string; name: string } | null {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return { id: user.id, role: user.role, name: user.name }
    }
  } catch (e) {
    // ignore
  }
  return null
}

function validateApprovalPermission(
  contract: WorkerContract | undefined,
  stepOrder: number,
  operation: 'approve' | 'reject' | 'delegate' | 'return' | 'add_sign'
): ApprovalPermissionError | null {
  if (!contract) {
    return {
      code: 'CONTRACT_NOT_FOUND',
      message: '合同不存在',
      stepOrder
    }
  }

  if (contract.status !== 'pending_approval') {
    return {
      code: 'NOT_PENDING',
      message: `合同状态为「${contract.status}」，当前不处于待审核状态`,
      contractId: contract.id,
      stepOrder
    }
  }

  const step = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (!step) {
    return {
      code: 'STEP_NOT_FOUND',
      message: `第${stepOrder}级审批节点不存在`,
      contractId: contract.id,
      stepOrder
    }
  }

  if (step.status !== 'pending') {
    return {
      code: 'ALREADY_PROCESSED',
      message: `第${stepOrder}级审批已处理，当前状态：${step.status}`,
      contractId: contract.id,
      stepOrder
    }
  }

  const currentUser = getCurrentUser()
  if (!currentUser) {
    return {
      code: 'INSUFFICIENT_PERMISSION',
      message: '未获取到当前登录用户信息，请重新登录',
      contractId: contract.id,
      stepOrder
    }
  }

  if (currentUser.role === 'super_admin' || currentUser.role === 'admin') {
    return null
  }

  if (step.approverId !== currentUser.id 
      && step.approverRole !== currentUser.role
      && step.delegatedTo !== currentUser.id) {
    return {
      code: 'NOT_APPROVER',
      message: `您不是第${stepOrder}级审批的审批人（该节点审批人：${step.approverName}），无权执行此操作`,
      contractId: contract.id,
      stepOrder
    }
  }

  if (operation === 'delegate' && !step.canDelegate) {
    return {
      code: 'INSUFFICIENT_PERMISSION',
      message: `第${stepOrder}级审批节点不支持委托操作`,
      contractId: contract.id,
      stepOrder
    }
  }
  if (operation === 'return' && !step.canReturn) {
    return {
      code: 'INSUFFICIENT_PERMISSION',
      message: `第${stepOrder}级审批节点不支持退回操作`,
      contractId: contract.id,
      stepOrder
    }
  }
  if (operation === 'add_sign' && !step.canAddSign) {
    return {
      code: 'INSUFFICIENT_PERMISSION',
      message: `第${stepOrder}级审批节点不支持加签操作`,
      contractId: contract.id,
      stepOrder
    }
  }

  return null
}

export class ApprovalPermissionException extends Error {
  error: ApprovalPermissionError
  constructor(error: ApprovalPermissionError) {
    super(error.message)
    this.error = error
    this.name = 'ApprovalPermissionException'
  }
}

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

function generateApprovalStepsForContract(contract: any): any[] {
  const flow = approvalFlowsClone.find(f => f.contractType === contract.type) 
    || approvalFlowsClone.find(f => f.isDefault)
  if (!flow) return []
  
  const steps: any[] = []
  let effectiveStepOrder = 1
  
  flow.steps.forEach((stepConfig: any) => {
    if (stepConfig.conditions && stepConfig.conditions.length > 0) {
      const allConditionsMet = stepConfig.conditions.every((cond: any) => evaluateCondition(cond, contract))
      if (!allConditionsMet) return
    }
    
    const approver = getApproverByRole(stepConfig.role, contract.workInfo?.departmentId)
    const now = dayjs()
    const deadline = stepConfig.deadlineHours 
      ? now.add(stepConfig.deadlineHours, 'hour').format('YYYY-MM-DD HH:mm:ss')
      : undefined
    
    steps.push({
      id: contract.id * 100 + effectiveStepOrder,
      stepOrder: effectiveStepOrder,
      stepName: stepConfig.stepName,
      approverId: approver.id,
      approverName: approver.name,
      approverRole: stepConfig.role,
      approverRoleName: stepConfig.roleName,
      mode: stepConfig.mode,
      status: 'pending',
      comment: '',
      approvedAt: undefined,
      deadline
    })
    
    effectiveStepOrder++
  })
  
  return steps
}

export async function submitContractForApproval(id: number): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return null
  
  const approvalSteps = generateApprovalStepsForContract(contract)
  contract.approvalSteps = approvalSteps as any
  contract.status = 'pending_approval'
  contract.currentApprovalStep = approvalSteps.length > 0 ? 1 : 0
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  return contract
}

export async function approveContract(id: number, stepOrder: number, comment?: string): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  
  const permissionError = validateApprovalPermission(contract, stepOrder, 'approve')
  if (permissionError) {
    throw new ApprovalPermissionException(permissionError)
  }
  
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
  
  const permissionError = validateApprovalPermission(contract, stepOrder, 'reject')
  if (permissionError) {
    throw new ApprovalPermissionException(permissionError)
  }
  
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

export async function delegateApproval(
  id: number,
  stepOrder: number,
  delegateToUserId: number,
  delegateToUserName: string,
  reason?: string
): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  
  const permissionError = validateApprovalPermission(contract, stepOrder, 'delegate')
  if (permissionError) {
    throw new ApprovalPermissionException(permissionError)
  }
  
  if (!contract) return null
  
  const step = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (!step) return null
  
  step.status = 'delegated'
  step.delegatedTo = delegateToUserId
  step.delegatedToName = delegateToUserName
  step.delegatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  step.delegationReason = reason
  
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function returnApproval(
  id: number,
  stepOrder: number,
  returnToStepOrder: number,
  reason: string
): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  
  const permissionError = validateApprovalPermission(contract, stepOrder, 'return')
  if (permissionError) {
    throw new ApprovalPermissionException(permissionError)
  }
  
  if (!contract) return null
  
  const currentStep = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (!currentStep) return null
  
  currentStep.status = 'returned'
  currentStep.returnedTo = returnToStepOrder
  currentStep.returnedReason = reason
  currentStep.returnedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  contract.approvalSteps.forEach(step => {
    if (step.stepOrder < stepOrder) {
      step.status = 'pending'
      step.comment = ''
      step.approvedAt = undefined
    }
  })
  
  contract.currentApprovalStep = returnToStepOrder
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function addSignatory(
  id: number,
  stepOrder: number,
  signerId: number,
  signerName: string,
  comment?: string
): Promise<WorkerContract | null> {
  await delay(300)
  const contract = contractsClone.find(c => c.id === id)
  
  const permissionError = validateApprovalPermission(contract, stepOrder, 'add_sign')
  if (permissionError) {
    throw new ApprovalPermissionException(permissionError)
  }
  
  if (!contract) return null
  
  const step = contract.approvalSteps.find(s => s.stepOrder === stepOrder)
  if (!step) return null
  
  if (!step.addSigners) {
    step.addSigners = []
  }
  
  step.addSigners.push({
    id: Date.now(),
    name: signerName,
    comment,
    status: 'pending' as const,
    signedAt: undefined
  })
  
  contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return contract
}

export async function getApprovalTimeline(id: number): Promise<any[]> {
  await delay(200)
  const contract = contractsClone.find(c => c.id === id)
  if (!contract) return []
  
  const timeline: any[] = []
  let itemId = 1
  
  timeline.push({
    id: itemId++,
    action: 'submit',
    operatorId: contract.createdBy,
    operatorName: contract.createdByName,
    operatorRole: '提交人',
    comment: '提交合同审核',
    timestamp: contract.createdAt
  })
  
  contract.approvalSteps.forEach(step => {
    if (step.status === 'approved') {
      timeline.push({
        id: itemId++,
        action: 'approve',
        operatorId: step.approverId,
        operatorName: step.approverName,
        operatorRole: step.approverRoleName,
        comment: step.comment || '审核通过',
        timestamp: step.approvedAt,
        stepOrder: step.stepOrder,
        stepName: step.stepName
      })
    } else if (step.status === 'rejected') {
      timeline.push({
        id: itemId++,
        action: 'reject',
        operatorId: step.approverId,
        operatorName: step.approverName,
        operatorRole: step.approverRoleName,
        comment: step.comment || '审核驳回',
        timestamp: step.approvedAt,
        stepOrder: step.stepOrder,
        stepName: step.stepName
      })
    } else if (step.status === 'delegated') {
      timeline.push({
        id: itemId++,
        action: 'delegate',
        operatorId: step.approverId,
        operatorName: step.approverName,
        operatorRole: step.approverRoleName,
        toUser: step.delegatedToName,
        comment: step.delegatedAt,
        timestamp: step.delegatedAt,
        stepOrder: step.stepOrder,
        stepName: step.stepName
      })
    } else if (step.status === 'returned') {
      timeline.push({
        id: itemId++,
        action: 'return',
        operatorId: step.approverId,
        operatorName: step.approverName,
        operatorRole: step.approverRoleName,
        comment: step.returnedReason,
        timestamp: step.returnedAt,
        stepOrder: step.stepOrder,
        stepName: step.stepName
      })
    }
  })
  
  if (contract.status === 'approved' || contract.status === 'signed' || contract.status === 'active') {
    const lastApprovedStep = [...contract.approvalSteps].reverse().find(s => s.status === 'approved')
    if (lastApprovedStep) {
      timeline.push({
        id: itemId++,
        action: 'complete',
        operatorId: 0,
        operatorName: '系统',
        operatorRole: '系统',
        comment: '审核流程已完成',
        timestamp: lastApprovedStep.approvedAt
      })
    }
  }
  
  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export async function getPendingApprovals(
  userId: number,
  userRole: string,
  params: PaginationParams
): Promise<PaginatedResponse<WorkerContract>> {
  await delay(300)
  
  let list = contractsClone.filter(c => c.status === 'pending_approval')
  
  list = list.filter(c => {
    const currentStep = c.approvalSteps.find(s => s.status === 'pending')
    if (!currentStep) return false
    
    if (currentStep.approverId === userId) return true
    
    if (currentStep.approverRole === userRole) return true
    
    if (currentStep.delegatedTo === userId) return true
    
    return false
  })
  
  const total = list.length
  const start = (params.page - 1) * params.pageSize
  list = list.slice(start, start + params.pageSize)
  
  return { list, total, page: params.page, pageSize: params.pageSize }
}

export async function getApprovalDelegations(): Promise<any[]> {
  await delay(200)
  return [
    {
      id: 1,
      fromUserId: 2,
      fromUserName: '李华',
      toUserId: 60,
      toUserName: '陈静',
      reason: '请假期间委托审批',
      startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      isActive: true,
      createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss')
    }
  ]
}

export async function batchApproveContracts(
  ids: number[],
  comment?: string
): Promise<BatchOperationResult> {
  await delay(500)
  const resultItems: BatchOperationResultItem[] = []
  let successCount = 0

  for (const id of ids) {
    const contract = contractsClone.find(c => c.id === id)
    const currentStep = contract?.approvalSteps.find(s => s.status === 'pending')
    const stepOrder = currentStep?.stepOrder || 0

    const item: BatchOperationResultItem = {
      contractId: id,
      contractNo: contract?.contractNo || '未知',
      userName: contract?.userName || '未知',
      success: false
    }

    try {
      const permissionError = validateApprovalPermission(contract, stepOrder, 'approve')
      if (permissionError) {
        item.error = permissionError
        resultItems.push(item)
        continue
      }

      if (!contract || !currentStep) {
        item.error = {
          code: contract ? 'NOT_PENDING' : 'CONTRACT_NOT_FOUND',
          message: contract ? '合同当前没有待处理的审批节点' : '合同不存在',
          contractId: id,
          stepOrder
        }
        resultItems.push(item)
        continue
      }

      currentStep.status = 'approved'
      currentStep.comment = comment
      currentStep.approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      const nextStep = contract.approvalSteps.find(s => s.status === 'pending')
      if (nextStep) {
        contract.currentApprovalStep = nextStep.stepOrder
      } else {
        contract.status = 'approved'
        contract.currentApprovalStep = 0
      }
      contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      item.success = true
      successCount++
      resultItems.push(item)
    } catch (e: any) {
      item.error = e instanceof ApprovalPermissionException
        ? e.error
        : {
            code: 'INSUFFICIENT_PERMISSION',
            message: e.message || '审批失败，发生未知错误',
            contractId: id,
            stepOrder
          }
      resultItems.push(item)
    }
  }

  return {
    total: ids.length,
    successCount,
    failureCount: ids.length - successCount,
    items: resultItems
  }
}

export async function batchRejectContracts(
  ids: number[],
  reason: string
): Promise<BatchOperationResult> {
  await delay(500)
  const resultItems: BatchOperationResultItem[] = []
  let successCount = 0

  for (const id of ids) {
    const contract = contractsClone.find(c => c.id === id)
    const currentStep = contract?.approvalSteps.find(s => s.status === 'pending')
    const stepOrder = currentStep?.stepOrder || 0

    const item: BatchOperationResultItem = {
      contractId: id,
      contractNo: contract?.contractNo || '未知',
      userName: contract?.userName || '未知',
      success: false
    }

    try {
      const permissionError = validateApprovalPermission(contract, stepOrder, 'reject')
      if (permissionError) {
        item.error = permissionError
        resultItems.push(item)
        continue
      }

      if (!contract || !currentStep) {
        item.error = {
          code: contract ? 'NOT_PENDING' : 'CONTRACT_NOT_FOUND',
          message: contract ? '合同当前没有待处理的审批节点' : '合同不存在',
          contractId: id,
          stepOrder
        }
        resultItems.push(item)
        continue
      }

      currentStep.status = 'rejected'
      currentStep.comment = reason
      currentStep.approvedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')
      contract.status = 'rejected'
      contract.currentApprovalStep = 0
      contract.updatedAt = dayjs().format('YYYY-MM-DD HH:mm:ss')

      item.success = true
      successCount++
      resultItems.push(item)
    } catch (e: any) {
      item.error = e instanceof ApprovalPermissionException
        ? e.error
        : {
            code: 'INSUFFICIENT_PERMISSION',
            message: e.message || '驳回失败，发生未知错误',
            contractId: id,
            stepOrder
          }
      resultItems.push(item)
    }
  }

  return {
    total: ids.length,
    successCount,
    failureCount: ids.length - successCount,
    items: resultItems
  }
}

export function generateContractNo(): string {
  const year = dayjs().format('YYYY')
  const random = String(Math.floor(Math.random() * 90000) + 10000)
  return `HT${year}${random}`
}
