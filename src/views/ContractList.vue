<template>
  <div class="contract-list">
    <div class="page-card">
      <div class="page-header">
        <h2>合同列表</h2>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate" v-if="canCreate">新建合同</el-button>
        </div>
      </div>

      <el-row :gutter="16" class="stats-row">
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">合同总数</div>
            <div class="stat-value total">{{ stats.total }}</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">履行中</div>
            <div class="stat-value active">{{ stats.active }}</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">待审核</div>
            <div class="stat-value pending">{{ stats.pending }}</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">已到期</div>
            <div class="stat-value expired">{{ stats.expired }}</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">即将到期</div>
            <div class="stat-value expiring">{{ stats.expiringSoon }}</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-card">
            <div class="stat-label">续签次数</div>
            <div class="stat-value renew">{{ totalRenewals }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="搜索合同编号/员工姓名/身份证" clearable style="width: 260px;" @keyup.enter.native="loadData" />
        <el-select v-model="filters.status" placeholder="合同状态" clearable style="width: 140px;">
          <el-option v-for="(label, key) in contractStatusMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.type" placeholder="合同类型" clearable style="width: 140px;">
          <el-option v-for="(label, key) in contractTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.departmentId" placeholder="部门" clearable style="width: 160px;">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
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
        <el-table-column label="部门/岗位" min-width="160">
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
        <el-table-column label="薪资" width="130" align="right">
          <template slot-scope="scope">
            ¥{{ scope.row.salaryInfo?.baseSalary?.toFixed(0) }}
          </template>
        </el-table-column>
        <el-table-column label="合同期限" min-width="200">
          <template slot-scope="scope">
            <div>{{ scope.row.startDate }} 至 {{ scope.row.endDate || '长期' }}</div>
            <div class="sub-text" v-if="scope.row.termMonths">
              {{ scope.row.termMonths }}个月
              <span v-if="scope.row.renewalCount > 0" class="renew-badge">
                已续签{{ scope.row.renewalCount }}次
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getTagType(scope.row.status)" size="mini">
              {{ contractStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goToDetail(scope.row.id)">详情</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)" v-if="canEdit && ['draft', 'rejected'].includes(scope.row.status)">编辑</el-button>
            <el-button type="text" size="small" @click="handleSubmitApproval(scope.row)" v-if="canSubmit && scope.row.status === 'draft'">提交审核</el-button>
            <el-button type="text" size="small" @click="handleRenew(scope.row)" v-if="canRenew && ['active', 'signed', 'expired'].includes(scope.row.status)">续签</el-button>
            <el-button type="text" size="small" style="color: #E6A23C;" @click="handleTerminate(scope.row)" v-if="canTerminate && ['active', 'signed'].includes(scope.row.status)">终止</el-button>
            <el-button type="text" size="small" style="color: #909399;" @click="handleArchive(scope.row)" v-if="canArchive && ['expired', 'terminated'].includes(scope.row.status)">归档</el-button>
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

    <el-dialog title="续签合同" :visible.sync="renewDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="原合同到期日">
          <span>{{ renewContract?.endDate }}</span>
        </el-form-item>
        <el-form-item label="新合同到期日" required>
          <el-date-picker
            v-model="renewEndDate"
            type="date"
            placeholder="请选择新的到期日期"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
            :picker-options="renewDatePickerOptions"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="renewRemark" placeholder="请输入备注信息" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="renewDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmRenew">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="终止合同" :visible.sync="terminateDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="终止原因" required>
          <el-input type="textarea" v-model="terminateReason" placeholder="请输入终止原因" :rows="4" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="terminateDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmTerminate">确认终止</el-button>
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
  getContractStats,
  submitContractForApproval,
  renewContract,
  terminateContract,
  archiveContract
} from '@/api/contract'
import {
  contractTypeMap,
  contractStatusMap,
  contractStatusTagMap,
  mockDepartments
} from '@/data/mockData'
import type { WorkerContract, ContractStatus, ContractType } from '@/types'

export default Vue.extend({
  name: 'ContractList',
  data() {
    return {
      loading: false,
      tableData: [] as WorkerContract[],
      departments: mockDepartments.filter(d => d.parentId !== null),
      stats: {
        total: 0,
        active: 0,
        pending: 0,
        expired: 0,
        expiringSoon: 0
      },
      totalRenewals: 0,
      filters: {
        keyword: '',
        status: '' as ContractStatus | '',
        type: '' as ContractType | '',
        departmentId: undefined as number | undefined,
        dateRange: [] as string[]
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      contractTypeMap,
      contractStatusMap,
      renewDialogVisible: false,
      renewContract: null as WorkerContract | null,
      renewEndDate: '',
      renewRemark: '',
      terminateDialogVisible: false,
      terminateContract: null as WorkerContract | null,
      terminateReason: '',
      renewDatePickerOptions: {
        disabledDate: (time: Date) => {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission']),
    canCreate(): boolean {
      return this.hasPermission('contract:create') || this.isSalaryAdmin
    },
    canEdit(): boolean {
      return this.hasPermission('contract:edit') || this.isSalaryAdmin
    },
    canSubmit(): boolean {
      return this.hasPermission('contract:submit') || this.isSalaryAdmin
    },
    canRenew(): boolean {
      return this.hasPermission('contract:renew') || this.isSalaryAdmin
    },
    canTerminate(): boolean {
      return this.hasPermission('contract:terminate') || this.isSalaryAdmin
    },
    canArchive(): boolean {
      return this.hasPermission('contract:archive') || this.isSalaryAdmin
    }
  },
  created() {
    this.loadData()
    this.loadStats()
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
    async loadStats() {
      try {
        const stats = await getContractStats()
        this.stats = stats as any
      } catch (e) {
        console.error('加载统计数据失败', e)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params: any = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.filters.keyword || undefined,
          status: this.filters.status || undefined,
          type: this.filters.type || undefined,
          departmentId: this.filters.departmentId
        }
        if (this.filters.dateRange && this.filters.dateRange.length === 2) {
          params.startDateFrom = this.filters.dateRange[0]
          params.startDateTo = this.filters.dateRange[1]
        }
        const res = await getContracts(params)
        this.tableData = res.list
        this.pagination.total = res.total
        this.totalRenewals = res.list.reduce((sum, c) => sum + (c.renewalCount || 0), 0)
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        keyword: '',
        status: '',
        type: '',
        departmentId: undefined,
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
    handleCreate() {
      this.$router.push('/contract/create')
    },
    handleEdit(row: WorkerContract) {
      this.$router.push(`/contract/edit/${row.id}`)
    },
    goToDetail(id: number) {
      this.$router.push(`/contract/detail/${id}`)
    },
    handleSubmitApproval(row: WorkerContract) {
      this.$confirm('确定提交该合同进入审核流程吗？', '提交审核', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await submitContractForApproval(row.id)
          if (res) {
            this.$message.success('提交成功')
            this.loadData()
            this.loadStats()
          }
        } catch (e) {
          this.$message.error('提交失败')
        }
      }).catch(() => {})
    },
    handleRenew(row: WorkerContract) {
      this.renewContract = row
      this.renewEndDate = row.endDate ? dayjs(row.endDate).add(1, 'year').format('YYYY-MM-DD') : ''
      this.renewRemark = ''
      this.renewDialogVisible = true
    },
    async confirmRenew() {
      if (!this.renewEndDate) {
        this.$message.warning('请选择新的到期日期')
        return
      }
      if (!this.renewContract) return
      try {
        const res = await renewContract(this.renewContract.id, this.renewEndDate)
        if (res) {
          this.$message.success('续签成功')
          this.renewDialogVisible = false
          this.loadData()
          this.loadStats()
        }
      } catch (e) {
        this.$message.error('续签失败')
      }
    },
    handleTerminate(row: WorkerContract) {
      this.terminateContract = row
      this.terminateReason = ''
      this.terminateDialogVisible = true
    },
    async confirmTerminate() {
      if (!this.terminateReason.trim()) {
        this.$message.warning('请输入终止原因')
        return
      }
      if (!this.terminateContract) return
      try {
        const res = await terminateContract(this.terminateContract.id, this.terminateReason)
        if (res) {
          this.$message.success('合同已终止')
          this.terminateDialogVisible = false
          this.loadData()
          this.loadStats()
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    handleArchive(row: WorkerContract) {
      this.$confirm('确定归档该合同吗？归档后将不能再编辑。', '归档确认', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await archiveContract(row.id)
          if (res) {
            this.$message.success('归档成功')
            this.loadData()
            this.loadStats()
          }
        } catch (e) {
          this.$message.error('归档失败')
        }
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.contract-list {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  .stats-row {
    margin-bottom: 16px;
  }
  .stat-card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    padding: 16px;
    text-align: center;
    &:hover {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
  .stat-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    &.total { color: #409EFF; }
    &.active { color: #67C23A; }
    &.pending { color: #E6A23C; }
    &.expired { color: #909399; }
    &.expiring { color: #F56C6C; }
    &.renew { color: #606266; }
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
  .renew-badge {
    margin-left: 8px;
    padding: 0 4px;
    background: #ecf5ff;
    color: #409EFF;
    border-radius: 2px;
    font-size: 11px;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
