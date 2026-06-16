<template>
  <div class="contract-approval">
    <div class="page-card">
      <div class="page-header">
        <h2>合同审核</h2>
        <div class="header-tabs">
          <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
            <el-tab-pane label="待我审批" name="pending">
              <span slot="label">
                <i class="el-icon-time"></i> 待我审批
                <el-badge :value="pendingCount" class="badge" v-if="pendingCount > 0"></el-badge>
              </span>
            </el-tab-pane>
            <el-tab-pane label="已审批" name="approved">
              <span slot="label">
                <i class="el-icon-check"></i> 已审批
              </span>
            </el-tab-pane>
            <el-tab-pane label="全部" name="all">
              <span slot="label">
                <i class="el-icon-document"></i> 全部
              </span>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <el-row :gutter="16" class="stats-cards">
        <el-col :span="6">
          <div class="stat-card stat-pending">
            <div class="stat-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">待我审批</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-approved">
            <div class="stat-icon">
              <i class="el-icon-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ approvedToday }}</div>
              <div class="stat-label">今日已审批</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-overdue">
            <div class="stat-icon">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overdueCount }}</div>
              <div class="stat-label">超时未审</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card stat-expiring">
            <div class="stat-icon">
              <i class="el-icon-alarm-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ expiringCount }}</div>
              <div class="stat-label">即将到期(24h)</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="搜索合同编号/员工姓名" clearable style="width: 240px;" @keyup.enter.native="loadData" />
        <el-select v-model="filters.role" placeholder="审批角色" clearable style="width: 140px;">
          <el-option v-for="(label, key) in approvalRoleMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.type" placeholder="合同类型" clearable style="width: 140px;">
          <el-option v-for="(label, key) in contractTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.salaryRange" placeholder="薪资范围" clearable style="width: 140px;">
          <el-option label="8000以下" value="0-8000" />
          <el-option label="8000-12000" value="8000-12000" />
          <el-option label="12000-20000" value="12000-20000" />
          <el-option label="20000-30000" value="20000-30000" />
          <el-option label="30000以上" value="30000+" />
        </el-select>
        <el-select v-model="filters.urgency" placeholder="紧急程度" clearable style="width: 140px;">
          <el-option label="超时预警" value="overdue" />
          <el-option label="临近超时" value="expiring" />
          <el-option label="正常" value="normal" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="提交开始"
          end-placeholder="提交结束"
          style="width: 240px;"
          value-format="yyyy-MM-dd"
        />
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <div class="batch-toolbar" v-if="activeTab === 'pending'">
        <el-checkbox v-model="isAllSelected" @change="handleSelectAll" :indeterminate="isIndeterminate">
          全选
        </el-checkbox>
        <span class="selected-count">已选择 {{ selectedContractIds.length }} 项</span>
        <el-button type="success" icon="el-icon-check" :disabled="selectedContractIds.length === 0" @click="handleBatchApprove">
          批量通过
        </el-button>
        <el-button type="danger" icon="el-icon-close" :disabled="selectedContractIds.length === 0" @click="handleBatchReject">
          批量驳回
        </el-button>
        <el-button type="warning" icon="el-icon-download" :disabled="selectedContractIds.length === 0" @click="handleBatchExport">
          批量导出
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" v-if="activeTab === 'pending'" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractNo" label="合同编号" width="160">
          <template slot-scope="scope">
            <div class="contract-no-cell">
              <el-button type="text" @click="goToDetail(scope.row.id)">{{ scope.row.contractNo }}</el-button>
              <el-tag v-if="getUrgencyTag(scope.row)" type="danger" size="mini" effect="dark">
                {{ getUrgencyTag(scope.row) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="员工姓名" width="100" />
        <el-table-column label="部门/岗位" min-width="140">
          <template slot-scope="scope">
            <div>{{ scope.row.workInfo?.departmentName }}</div>
            <div class="sub-text">{{ scope.row.workInfo?.position }}</div>
          </template>
        </el-table-column>
        <el-table-column label="合同类型" width="110">
          <template slot-scope="scope">
            <el-tag size="mini">{{ contractTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="薪资" width="120" align="right">
          <template slot-scope="scope">
            ¥{{ scope.row.salaryInfo?.baseSalary?.toFixed(0) }}
          </template>
        </el-table-column>
        <el-table-column label="当前节点" width="140">
          <template slot-scope="scope">
            <el-tag type="primary" size="mini">{{ getCurrentNodeName(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="到期时间" width="170">
          <template slot-scope="scope">
            <div :class="{ 'text-danger': isOverdue(scope.row), 'text-warning': isExpiring(scope.row) }">
              {{ getCurrentDeadline(scope.row) || '-' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="条件标签" min-width="140">
          <template slot-scope="scope">
            <div class="condition-tags">
              <el-tag
                v-for="(tag, idx) in getConditionTags(scope.row)"
                :key="idx"
                type="info"
                size="mini"
                effect="plain"
                style="margin-right: 4px; margin-bottom: 4px;"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="合同期限" width="200">
          <template slot-scope="scope">
            {{ scope.row.startDate }} 至 {{ scope.row.endDate || '长期' }}
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.status)" size="mini">
              {{ contractStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批进度" min-width="180">
          <template slot-scope="scope">
            <el-steps :active="getCurrentStepIndex(scope.row)" finish-status="success" size="mini">
              <el-step
                v-for="(step, idx) in scope.row.approvalSteps"
                :key="step.id"
                :title="'第' + step.stepOrder + '级'"
              />
            </el-steps>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170" />
        <el-table-column label="操作" width="320" fixed="right" v-if="activeTab === 'pending'">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goToDetail(scope.row.id)">查看</el-button>
            <el-button type="text" size="small" @click="handleApprove(scope.row)" style="color: #67C23A;">通过</el-button>
            <el-button type="text" size="small" @click="handleReject(scope.row)" style="color: #F56C6C;">驳回</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleDelegate(scope.row)"
              v-if="canDelegate(scope.row)"
              style="color: #E6A23C;"
            >委托</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleReturn(scope.row)"
              v-if="canReturn(scope.row)"
              style="color: #909399;"
            >退回</el-button>
            <el-button
              type="text"
              size="small"
              @click="handleAddSign(scope.row)"
              v-if="canAddSign(scope.row)"
              style="color: #409EFF;"
            >加签</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" v-else>
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goToDetail(scope.row.id)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog title="审批通过" :visible.sync="approveDialogVisible" width="480px">
      <el-form label-width="80px">
        <el-form-item label="合同编号">
          <span>{{ currentContract?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentContract?.userName }}</span>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input type="textarea" v-model="approveComment" :rows="3" placeholder="请输入审批意见（可选）" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="approveDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmApprove">确认通过</el-button>
      </div>
    </el-dialog>

    <el-dialog title="审批驳回" :visible.sync="rejectDialogVisible" width="480px">
      <el-form label-width="80px">
        <el-form-item label="合同编号">
          <span>{{ currentContract?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentContract?.userName }}</span>
        </el-form-item>
        <el-form-item label="驳回原因" required>
          <el-input type="textarea" v-model="rejectReason" :rows="4" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="batchAction === 'approve' ? '批量通过' : '批量驳回'" :visible.sync="batchDialogVisible" width="500px">
      <el-alert
        :title="'确定要' + (batchAction === 'approve' ? '通过' : '驳回') + '选中的 ' + selectedContractIds.length + ' 份合同吗？'"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px;"
      />
      <el-form label-width="80px">
        <el-form-item :label="batchAction === 'approve' ? '审批意见' : '驳回原因'" required>
          <el-input
            type="textarea"
            v-model="batchComment"
            :rows="4"
            :placeholder="batchAction === 'approve' ? '请输入审批意见（可选）' : '请输入驳回原因'"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="batchDialogVisible = false">取 消</el-button>
        <el-button :type="batchAction === 'approve' ? 'primary' : 'danger'" @click="confirmBatchAction">
          确认{{ batchAction === 'approve' ? '通过' : '驳回' }}
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="委托审批" :visible.sync="delegateDialogVisible" width="480px">
      <el-form label-width="80px">
        <el-form-item label="合同编号">
          <span>{{ currentContract?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentContract?.userName }}</span>
        </el-form-item>
        <el-form-item label="委托给" required>
          <el-select v-model="delegateForm.userId" placeholder="请选择委托人" style="width: 100%;">
            <el-option v-for="user in delegateUsers" :key="user.id" :label="user.name + ' (' + user.departmentName + ')'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="委托原因">
          <el-input type="textarea" v-model="delegateForm.reason" :rows="3" placeholder="请输入委托原因（可选）" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delegateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDelegate">确认委托</el-button>
      </div>
    </el-dialog>

    <el-dialog title="退回审批" :visible.sync="returnDialogVisible" width="480px">
      <el-form label-width="80px">
        <el-form-item label="合同编号">
          <span>{{ currentContract?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentContract?.userName }}</span>
        </el-form-item>
        <el-form-item label="退回到" required>
          <el-select v-model="returnForm.stepOrder" placeholder="请选择退回节点" style="width: 100%;">
            <el-option
              v-for="step in returnableSteps"
              :key="step.stepOrder"
              :label="'第' + step.stepOrder + '级 - ' + step.stepName"
              :value="step.stepOrder"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退回原因" required>
          <el-input type="textarea" v-model="returnForm.reason" :rows="4" placeholder="请输入退回原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnDialogVisible = false">取 消</el-button>
        <el-button type="warning" @click="confirmReturn">确认退回</el-button>
      </div>
    </el-dialog>

    <el-dialog title="加签审批" :visible.sync="addSignDialogVisible" width="480px">
      <el-form label-width="80px">
        <el-form-item label="合同编号">
          <span>{{ currentContract?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentContract?.userName }}</span>
        </el-form-item>
        <el-form-item label="加签人" required>
          <el-select v-model="addSignForm.userId" placeholder="请选择加签人" style="width: 100%;">
            <el-option v-for="user in addSignUsers" :key="user.id" :label="user.name + ' (' + user.departmentName + ')'" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="加签意见">
          <el-input type="textarea" v-model="addSignForm.comment" :rows="3" placeholder="请输入加签意见（可选）" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addSignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddSign">确认加签</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="batchResultAction === 'approve' ? '批量审批结果' : '批量驳回结果'"
      :visible.sync="batchResultDialogVisible"
      width="680px"
    >
      <div v-if="batchResultData" class="batch-result-container">
        <el-row :gutter="16" class="result-stats">
          <el-col :span="8">
            <div class="stat-item stat-total">
              <i class="el-icon-document"></i>
              <el-statistic title="处理总数" :value="batchResultData.total" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item stat-success">
              <i class="el-icon-circle-check"></i>
              <el-statistic title="成功数量" :value="batchResultData.successCount" />
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-item stat-failure">
              <i class="el-icon-circle-close"></i>
              <el-statistic title="失败数量" :value="batchResultData.failureCount" />
            </div>
          </el-col>
        </el-row>

        <el-alert
          v-if="batchResultData.failureCount === 0"
          type="success"
          :title="'全部' + (batchResultAction === 'approve' ? '审批' : '驳回') + '成功！'"
          :closable="false"
          show-icon
          style="margin-top: 16px;"
        />

        <div v-else class="failure-list">
          <div class="failure-list-title">
            <i class="el-icon-warning-outline"></i>
            失败详情（{{ batchResultData.failureCount }} 项）
          </div>
          <el-table :data="batchResultData.items.filter(i => !i.success)" border stripe style="width: 100%; margin-top: 12px;">
            <el-table-column prop="contractNo" label="合同编号" width="160" />
            <el-table-column prop="userName" label="员工姓名" width="100" />
            <el-table-column label="错误类型" width="120">
              <template slot-scope="scope">
                <el-tag :type="getErrorTagType(scope.row.error?.code || '')" size="small">
                  {{ getErrorCodeText(scope.row.error?.code || '') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="error.message" label="错误详情" />
          </el-table>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="batchResultDialogVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import {
  getContracts,
  approveContract,
  rejectContract,
  delegateApproval,
  returnApproval,
  addSignatory,
  batchApproveContracts,
  batchRejectContracts,
  ApprovalPermissionException
} from '@/api/contract'
import {
  contractTypeMap,
  contractStatusMap,
  approvalRoleMap,
  approvalModeMap,
  mockUsers
} from '@/data/mockData'
import type {
  WorkerContract,
  ContractStatus,
  ContractType,
  ApprovalStep,
  BatchOperationResult,
  ApprovalPermissionError
} from '@/types'

export default Vue.extend({
  name: 'ContractApproval',
  data() {
    return {
      loading: false,
      tableData: [] as WorkerContract[],
      activeTab: 'pending',
      pendingCount: 0,
      approvedToday: 0,
      overdueCount: 0,
      expiringCount: 0,
      filters: {
        keyword: '',
        role: '',
        type: '' as ContractType | '',
        salaryRange: '',
        urgency: '',
        dateRange: [] as string[]
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      contractTypeMap,
      contractStatusMap,
      approvalRoleMap,
      approvalModeMap,

      selectedContractIds: [] as number[],
      selection: [] as WorkerContract[],
      isAllSelected: false,
      isIndeterminate: false,

      approveDialogVisible: false,
      rejectDialogVisible: false,
      batchDialogVisible: false,
      delegateDialogVisible: false,
      returnDialogVisible: false,
      addSignDialogVisible: false,
      batchResultDialogVisible: false,
      batchResultData: null as BatchOperationResult | null,
      batchResultAction: '' as 'approve' | 'reject' | '',

      currentContract: null as WorkerContract | null,
      approveComment: '',
      rejectReason: '',

      batchAction: 'approve' as 'approve' | 'reject',
      batchComment: '',

      delegateForm: {
        userId: null as number | null,
        reason: ''
      },
      returnForm: {
        stepOrder: null as number | null,
        reason: ''
      },
      addSignForm: {
        userId: null as number | null,
        comment: ''
      },

      delegateUsers: mockUsers.filter(u => u.role !== 'employee'),
      addSignUsers: mockUsers.filter(u => u.role !== 'employee')
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission']),
    returnableSteps(): ApprovalStep[] {
      if (!this.currentContract) return []
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) return []
      return this.currentContract.approvalSteps.filter(s => s.stepOrder < currentStep.stepOrder)
    }
  },
  created() {
    this.loadData()
    this.loadStatistics()
  },
  methods: {
    getErrorCodeText(code: string): string {
      const map: Record<string, string> = {
        NOT_APPROVER: '非审批人',
        NOT_PENDING: '状态异常',
        CONTRACT_NOT_FOUND: '合同不存在',
        STEP_NOT_FOUND: '节点不存在',
        ALREADY_PROCESSED: '已处理',
        INSUFFICIENT_PERMISSION: '权限不足'
      }
      return map[code] || '未知错误'
    },
    getErrorTagType(code: string): string {
      const map: Record<string, string> = {
        NOT_APPROVER: 'warning',
        NOT_PENDING: 'info',
        CONTRACT_NOT_FOUND: 'danger',
        STEP_NOT_FOUND: 'danger',
        ALREADY_PROCESSED: 'info',
        INSUFFICIENT_PERMISSION: 'danger'
      }
      return map[code] || 'warning'
    },
    getTagType(status: ContractStatus): string {
      const map: Record<string, string> = {
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
      return map[status] || 'info'
    },
    getCurrentStepIndex(contract: WorkerContract): number {
      if (!contract.approvalSteps || contract.approvalSteps.length === 0) return 0
      if (contract.status === 'rejected') {
        const rejectedStep = contract.approvalSteps.find(s => s.status === 'rejected')
        if (rejectedStep) return rejectedStep.stepOrder - 1
      }
      if (contract.status === 'approved' || contract.status === 'signed' || contract.status === 'active') {
        return contract.approvalSteps.length
      }
      if (contract.status === 'pending_approval') {
        const pendingStep = contract.approvalSteps.find(s => s.status === 'pending')
        if (pendingStep) return pendingStep.stepOrder - 1
      }
      return 0
    },
    isOverdue(contract: WorkerContract): boolean {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      if (!currentStep?.deadline) return false
      return dayjs(currentStep.deadline).isBefore(dayjs())
    },
    isExpiring(contract: WorkerContract): boolean {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      if (!currentStep?.deadline) return false
      const deadline = dayjs(currentStep.deadline)
      const now = dayjs()
      return deadline.isAfter(now) && deadline.diff(now, 'hour') < 24
    },
    getUrgencyTag(contract: WorkerContract): string {
      if (this.isOverdue(contract)) return '已超时'
      if (this.isExpiring(contract)) return '紧急'
      return ''
    },
    getCurrentNodeName(contract: WorkerContract): string {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      if (!currentStep) {
        if (contract.status === 'approved' || contract.status === 'signed') return '已完成'
        if (contract.status === 'rejected') return '已驳回'
        return '-'
      }
      return currentStep.stepName || currentStep.approverRoleName || '审批中'
    },
    getCurrentDeadline(contract: WorkerContract): string {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      return currentStep?.deadline || ''
    },
    getConditionTags(contract: WorkerContract): string[] {
      const tags: string[] = []
      const baseSalary = contract.salaryInfo?.baseSalary || 0
      if (baseSalary >= 20000) tags.push(`薪资≥20000`)
      if (baseSalary >= 30000) tags.push(`薪资≥30000`)
      if (contract.type === 'open_ended') tags.push('无固定期限')
      if (contract.workInfo?.probationPeriod && contract.workInfo.probationPeriod > 0) {
        tags.push(`试用期${contract.workInfo.probationPeriod}个月`)
      }
      if (contract.type === 'project') tags.push('项目制')
      return tags
    },
    canDelegate(contract: WorkerContract): boolean {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      return currentStep?.canDelegate !== false
    },
    canReturn(contract: WorkerContract): boolean {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      return currentStep?.canReturn !== false && (currentStep?.stepOrder || 0) > 1
    },
    canAddSign(contract: WorkerContract): boolean {
      const currentStep = contract.approvalSteps?.find(s => s.status === 'pending')
      return currentStep?.canAddSign !== false
    },
    async loadStatistics() {
      try {
        const [pendingRes, allRes] = await Promise.all([
          getContracts({ page: 1, pageSize: 1000, status: 'pending_approval' }),
          getContracts({ page: 1, pageSize: 1000 })
        ])

        this.pendingCount = pendingRes.total

        const today = dayjs().format('YYYY-MM-DD')
        this.approvedToday = allRes.list.filter(c => {
          const approvedStep = c.approvalSteps?.find(s =>
            s.status === 'approved' && s.approvedAt?.startsWith(today)
          )
          return !!approvedStep
        }).length

        this.overdueCount = pendingRes.list.filter(c => this.isOverdue(c)).length
        this.expiringCount = pendingRes.list.filter(c => this.isExpiring(c)).length
      } catch (e) {
        console.error('加载统计数据失败', e)
      }
    },
    handleTabClick() {
      this.pagination.page = 1
      this.selectedContractIds = []
      this.selection = []
      this.isAllSelected = false
      this.isIndeterminate = false
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const params: any = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.filters.keyword || undefined,
          type: this.filters.type || undefined
        }

        if (this.activeTab === 'pending') {
          params.status = 'pending_approval'
        } else if (this.activeTab === 'approved') {
          params.status = 'approved'
        }

        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
          params.startDateFrom = this.filters.dateRange[0]
          params.startDateTo = this.filters.dateRange[1]
        }

        const res = await getContracts(params)
        let list = res.list

        if (this.filters.role) {
          list = list.filter(c => {
            const currentStep = c.approvalSteps?.find(s => s.status === 'pending')
            return currentStep?.approverRole === this.filters.role
          })
        }

        if (this.filters.salaryRange) {
          const [min, max] = this.filters.salaryRange.split('-')
          list = list.filter(c => {
            const salary = c.salaryInfo?.baseSalary || 0
            if (max === '+') return salary >= parseInt(min)
            return salary >= parseInt(min) && salary <= parseInt(max)
          })
        }

        if (this.filters.urgency) {
          list = list.filter(c => {
            if (this.filters.urgency === 'overdue') return this.isOverdue(c)
            if (this.filters.urgency === 'expiring') return this.isExpiring(c)
            return !this.isOverdue(c) && !this.isExpiring(c)
          })
        }

        this.tableData = list
        this.pagination.total = list.length
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        role: '',
        type: '',
        salaryRange: '',
        urgency: '',
        dateRange: []
      }
      this.pagination.page = 1
      this.loadData()
    },
    handleSizeChange(size: number) {
      this.pagination.pageSize = size
      this.pagination.page = 1
      this.loadData()
    },
    handlePageChange(page: number) {
      this.pagination.page = page
      this.loadData()
    },
    goToDetail(id: number) {
      this.$router.push(`/contract/detail/${id}`)
    },
    handleSelectionChange(selection: WorkerContract[]) {
      this.selection = selection
      this.selectedContractIds = selection.map(s => s.id)
      this.isAllSelected = selection.length === this.tableData.length && this.tableData.length > 0
      this.isIndeterminate = selection.length > 0 && selection.length < this.tableData.length
    },
    handleSelectAll(val: boolean) {
      const table = this.$refs.table as any
      if (table) {
        table.toggleAllSelection()
      }
    },
    handleBatchApprove() {
      if (this.selectedContractIds.length === 0) {
        this.$message.warning('请先选择要操作的合同')
        return
      }
      this.batchAction = 'approve'
      this.batchComment = ''
      this.batchDialogVisible = true
    },
    handleBatchReject() {
      if (this.selectedContractIds.length === 0) {
        this.$message.warning('请先选择要操作的合同')
        return
      }
      this.batchAction = 'reject'
      this.batchComment = ''
      this.batchDialogVisible = true
    },
    async confirmBatchAction() {
      if (this.batchAction === 'reject' && !this.batchComment.trim()) {
        this.$message.warning('请输入驳回原因')
        return
      }

      try {
        let result: BatchOperationResult
        if (this.batchAction === 'approve') {
          result = await batchApproveContracts(this.selectedContractIds, this.batchComment)
        } else {
          result = await batchRejectContracts(this.selectedContractIds, this.batchComment)
        }
        this.batchResultData = result
        this.batchResultAction = this.batchAction
        this.batchResultDialogVisible = true
        this.batchDialogVisible = false
        this.selectedContractIds = []
        this.selection = []
        this.isAllSelected = false
        this.isIndeterminate = false
        this.loadData()
        this.loadStatistics()
      } catch (e) {
        this.$message.error('批量操作失败')
      }
    },
    handleBatchExport() {
      if (this.selectedContractIds.length === 0) {
        this.$message.warning('请先选择要导出的合同')
        return
      }
      this.$message.success(`正在导出 ${this.selectedContractIds.length} 份合同...`)
    },
    handleApprove(row: WorkerContract) {
      this.currentContract = row
      this.approveComment = ''
      this.approveDialogVisible = true
    },
    async confirmApprove() {
      if (!this.currentContract) return
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) {
        this.$message.warning('没有待审批的步骤')
        return
      }
      try {
        const res = await approveContract(this.currentContract.id, currentStep.stepOrder, this.approveComment)
        if (res) {
          this.$message.success('审批通过')
          this.approveDialogVisible = false
          this.loadData()
          this.loadStatistics()
        }
      } catch (e) {
        if (e instanceof ApprovalPermissionException) {
          this.$message.error(e.error.message)
        } else {
          this.$message.error('操作失败')
        }
      }
    },
    handleReject(row: WorkerContract) {
      this.currentContract = row
      this.rejectReason = ''
      this.rejectDialogVisible = true
    },
    async confirmReject() {
      if (!this.rejectReason.trim()) {
        this.$message.warning('请输入驳回原因')
        return
      }
      if (!this.currentContract) return
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) {
        this.$message.warning('没有待审批的步骤')
        return
      }
      try {
        const res = await rejectContract(this.currentContract.id, currentStep.stepOrder, this.rejectReason)
        if (res) {
          this.$message.success('已驳回')
          this.rejectDialogVisible = false
          this.loadData()
          this.loadStatistics()
        }
      } catch (e) {
        if (e instanceof ApprovalPermissionException) {
          this.$message.error(e.error.message)
        } else {
          this.$message.error('操作失败')
        }
      }
    },
    handleDelegate(row: WorkerContract) {
      this.currentContract = row
      this.delegateForm = { userId: null, reason: '' }
      this.delegateDialogVisible = true
    },
    async confirmDelegate() {
      if (!this.delegateForm.userId) {
        this.$message.warning('请选择委托人')
        return
      }
      if (!this.currentContract) return
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) {
        this.$message.warning('没有待审批的步骤')
        return
      }
      const delegateUser = this.delegateUsers.find(u => u.id === this.delegateForm.userId)
      if (!delegateUser) return

      try {
        const res = await delegateApproval(
          this.currentContract.id,
          currentStep.stepOrder,
          delegateUser.id,
          delegateUser.name,
          this.delegateForm.reason
        )
        if (res) {
          this.$message.success('委托成功')
          this.delegateDialogVisible = false
          this.loadData()
        }
      } catch (e) {
        if (e instanceof ApprovalPermissionException) {
          this.$message.error(e.error.message)
        } else {
          this.$message.error('操作失败')
        }
      }
    },
    handleReturn(row: WorkerContract) {
      this.currentContract = row
      this.returnForm = { stepOrder: null, reason: '' }
      this.returnDialogVisible = true
    },
    async confirmReturn() {
      if (!this.returnForm.stepOrder) {
        this.$message.warning('请选择退回节点')
        return
      }
      if (!this.returnForm.reason.trim()) {
        this.$message.warning('请输入退回原因')
        return
      }
      if (!this.currentContract) return
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) {
        this.$message.warning('没有待审批的步骤')
        return
      }

      try {
        const res = await returnApproval(
          this.currentContract.id,
          currentStep.stepOrder,
          this.returnForm.stepOrder,
          this.returnForm.reason
        )
        if (res) {
          this.$message.success('退回成功')
          this.returnDialogVisible = false
          this.loadData()
        }
      } catch (e) {
        if (e instanceof ApprovalPermissionException) {
          this.$message.error(e.error.message)
        } else {
          this.$message.error('操作失败')
        }
      }
    },
    handleAddSign(row: WorkerContract) {
      this.currentContract = row
      this.addSignForm = { userId: null, comment: '' }
      this.addSignDialogVisible = true
    },
    async confirmAddSign() {
      if (!this.addSignForm.userId) {
        this.$message.warning('请选择加签人')
        return
      }
      if (!this.currentContract) return
      const currentStep = this.currentContract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) {
        this.$message.warning('没有待审批的步骤')
        return
      }
      const addSignUser = this.addSignUsers.find(u => u.id === this.addSignForm.userId)
      if (!addSignUser) return

      try {
        const res = await addSignatory(
          this.currentContract.id,
          currentStep.stepOrder,
          addSignUser.id,
          addSignUser.name,
          this.addSignForm.comment
        )
        if (res) {
          this.$message.success('加签成功')
          this.addSignDialogVisible = false
          this.loadData()
        }
      } catch (e) {
        if (e instanceof ApprovalPermissionException) {
          this.$message.error(e.error.message)
        } else {
          this.$message.error('操作失败')
        }
      }
    }
  }
})
</script>

<style lang="scss">
.contract-approval {
  .page-header {
    margin-bottom: 16px;
    h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #303133;
    }
  }
  .header-tabs {
    .el-tabs__item {
      height: 36px;
      line-height: 36px;
    }
    .badge {
      margin-left: 6px;
    }
  }
  .stats-cards {
    margin-bottom: 16px;
    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        margin-right: 16px;
        i {
          color: #fff;
        }
      }
      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          line-height: 1.2;
        }
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
      &.stat-pending .stat-icon {
        background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      }
      &.stat-approved .stat-icon {
        background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
      }
      &.stat-overdue .stat-icon {
        background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
      }
      &.stat-expiring .stat-icon {
        background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
      }
    }
  }
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    align-items: center;
  }
  .batch-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: #ecf5ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    .selected-count {
      color: #409EFF;
      font-weight: 500;
    }
  }
  .contract-no-cell {
    display: flex;
    align-items: center;
    gap: 6px;
    .el-tag {
      flex-shrink: 0;
    }
  }
  .condition-tags {
    display: flex;
    flex-wrap: wrap;
  }
  .sub-text {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
  .text-danger {
    color: #F56C6C;
    font-weight: 500;
  }
  .text-warning {
    color: #E6A23C;
    font-weight: 500;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  .batch-result-container {
    .result-stats {
      .stat-item {
        display: flex;
        align-items: center;
        padding: 20px;
        border-radius: 8px;
        background: #f5f7fa;

        i {
          font-size: 32px;
          margin-right: 12px;
        }

        .el-statistic {
          .el-statistic__head {
            font-size: 13px;
            color: #606266;
          }
          .el-statistic__content {
            font-size: 24px;
            font-weight: bold;
          }
        }

        &.stat-total {
          background: #ecf5ff;
          i {
            color: #409EFF;
          }
          .el-statistic__content {
            color: #409EFF;
          }
        }

        &.stat-success {
          background: #f0f9eb;
          i {
            color: #67C23A;
          }
          .el-statistic__content {
            color: #67C23A;
          }
        }

        &.stat-failure {
          background: #fef0f0;
          i {
            color: #F56C6C;
          }
          .el-statistic__content {
            color: #F56C6C;
          }
        }
      }
    }

    .failure-list {
      margin-top: 20px;

      .failure-list-title {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: #303133;

        i {
          font-size: 18px;
          color: #E6A23C;
          margin-right: 6px;
        }
      }
    }
  }
}
</style>
