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

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="搜索合同编号/员工姓名" clearable style="width: 240px;" @keyup.enter.native="loadData" />
        <el-select v-model="filters.type" placeholder="合同类型" clearable style="width: 140px;">
          <el-option v-for="(label, key) in contractTypeMap" :key="key" :label="label" :value="key" />
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

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="contractNo" label="合同编号" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="goToDetail(scope.row.id)">{{ scope.row.contractNo }}</el-button>
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
        <el-table-column label="操作" width="200" fixed="right" v-if="activeTab === 'pending'">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goToDetail(scope.row.id)">查看</el-button>
            <el-button type="text" size="small" @click="handleApprove(scope.row)" style="color: #67C23A;">通过</el-button>
            <el-button type="text" size="small" @click="handleReject(scope.row)" style="color: #F56C6C;">驳回</el-button>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { getContracts, approveContract, rejectContract } from '@/api/contract'
import { contractTypeMap, contractStatusMap } from '@/data/mockData'
import type { WorkerContract, ContractStatus, ContractType } from '@/types'

export default Vue.extend({
  name: 'ContractApproval',
  data() {
    return {
      loading: false,
      tableData: [] as WorkerContract[],
      activeTab: 'pending',
      pendingCount: 0,
      filters: {
        keyword: '',
        type: '' as ContractType | '',
        dateRange: [] as string[]
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      contractTypeMap,
      contractStatusMap,
      
      approveDialogVisible: false,
      rejectDialogVisible: false,
      currentContract: null as WorkerContract | null,
      approveComment: '',
      rejectReason: ''
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission'])
  },
  created() {
    this.loadData()
    this.loadPendingCount()
  },
  methods: {
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
    async loadPendingCount() {
      try {
        const res = await getContracts({
          page: 1,
          pageSize: 1,
          status: 'pending_approval' as ContractStatus
        })
        this.pendingCount = res.total
      } catch (e) {
        console.error('加载待审批数量失败', e)
      }
    },
    handleTabClick() {
      this.pagination.page = 1
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
        this.tableData = res.list
        this.pagination.total = res.total
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        type: '',
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
          this.loadPendingCount()
        }
      } catch (e) {
        this.$message.error('操作失败')
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
          this.loadPendingCount()
        }
      } catch (e) {
        this.$message.error('操作失败')
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
  .sub-text {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
