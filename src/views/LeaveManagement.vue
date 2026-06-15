<template>
  <div class="leave-management">
    <div class="page-card">
      <div class="page-header">
        <h2>请假管理</h2>
        <el-button type="primary" icon="el-icon-edit" @click="handleApply" v-if="canApply">申请请假</el-button>
      </div>

      <div class="filter-bar">
        <el-select v-model="filters.type" placeholder="请假类型" clearable style="width: 120px;">
          <el-option v-for="(label, key) in leaveTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.status" placeholder="审批状态" clearable style="width: 120px;">
          <el-option v-for="(label, key) in leaveStatusMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.departmentId" placeholder="选择部门" clearable style="width: 140px;" v-if="isManager">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="申请人" min-width="150" v-if="!isEmployee">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <span class="avatar-placeholder" style="width: 32px; height: 32px; font-size: 12px;">
                {{ getInitials(scope.row.userName) }}
              </span>
              <div class="user-detail">
                <div class="user-name">{{ scope.row.userName }}</div>
                <div class="user-dept">{{ scope.row.departmentName }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="请假类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="leaveTypeTag(scope.row.type)" size="mini">{{ leaveTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="请假时间" width="220">
          <template slot-scope="scope">
            <div>{{ scope.row.startDate }}</div>
            <div style="color: #909399; font-size: 12px;">至 {{ scope.row.endDate }} (共{{ scope.row.days }}天)</div>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="请假原因" show-overflow-tooltip min-width="150" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="leaveStatusTag(scope.row.status)" size="mini">
              {{ leaveStatusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="100" v-if="!isEmployee">
          <template slot-scope="scope">{{ scope.row.approvedByName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">详情</el-button>
            <el-button
              v-if="canApprove && scope.row.status === 'pending'"
              type="text"
              size="small"
              style="color: #67C23A;"
              @click="handleApprove(scope.row)"
            >通过</el-button>
            <el-button
              v-if="canApprove && scope.row.status === 'pending'"
              type="text"
              size="small"
              style="color: #F56C6C;"
              @click="handleReject(scope.row)"
            >拒绝</el-button>
            <el-button
              v-if="scope.row.status === 'pending' && (isEmployee || scope.row.userId === user?.id)"
              type="text"
              size="small"
              style="color: #909399;"
              @click="handleCancel(scope.row)"
            >撤销</el-button>
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

    <el-dialog
      title="申请请假"
      :visible.sync="applyVisible"
      width="500px"
      :close-on-click-modal="false"
      @close="handleApplyClose"
    >
      <el-form ref="applyForm" :model="applyForm" :rules="applyRules" label-width="100px" v-if="applyVisible">
        <el-form-item label="请假类型" prop="type">
          <el-select v-model="applyForm.type" placeholder="请选择请假类型" style="width: 100%;">
            <el-option v-for="(label, key) in leaveTypeMap" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="applyForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
            @change="calcDays"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="applyForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
            @change="calcDays"
          />
        </el-form-item>
        <el-form-item label="请假天数">
          <span style="color: #409EFF; font-weight: 500;">{{ applyDays }} 天</span>
          <span style="color: #909399; font-size: 12px; margin-left: 8px;">（按工作日计算）</span>
        </el-form-item>
        <el-form-item label="请假原因" prop="reason">
          <el-input
            type="textarea"
            v-model="applyForm.reason"
            placeholder="请输入请假原因"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="applyVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleApplySubmit">提交申请</el-button>
      </div>
    </el-dialog>

    <el-dialog title="请假详情" :visible.sync="detailVisible" width="500px">
      <div v-if="currentLeave" class="leave-detail">
        <div class="detail-status" :class="'status-' + currentLeave.status">
          <i :class="statusIcon(currentLeave.status)"></i>
          {{ leaveStatusMap[currentLeave.status] }}
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="申请人">{{ currentLeave.userName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentLeave.departmentName }}</el-descriptions-item>
          <el-descriptions-item label="请假类型">
            <el-tag :type="leaveTypeTag(currentLeave.type)" size="mini">
              {{ leaveTypeMap[currentLeave.type] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="请假天数">{{ currentLeave.days }} 天</el-descriptions-item>
          <el-descriptions-item label="开始日期" :span="2">{{ currentLeave.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期" :span="2">{{ currentLeave.endDate }}</el-descriptions-item>
          <el-descriptions-item label="请假原因" :span="2">{{ currentLeave.reason }}</el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ formatDateTime(currentLeave.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="审批人" v-if="currentLeave.approvedByName">
            {{ currentLeave.approvedByName }}
          </el-descriptions-item>
          <el-descriptions-item label="审批时间" v-if="currentLeave.approvedAt">
            {{ formatDateTime(currentLeave.approvedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="拒绝原因" v-if="currentLeave.rejectReason" :span="2">
            <span style="color: #F56C6C;">{{ currentLeave.rejectReason }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <el-dialog
      title="拒绝申请"
      :visible.sync="rejectVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-input
            type="textarea"
            v-model="rejectForm.reason"
            placeholder="请输入拒绝原因"
            :rows="4"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="rejectVisible = false">取 消</el-button>
        <el-button type="danger" :loading="rejecting" @click="handleRejectSubmit">确认拒绝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import type { FormRules } from 'element-ui'
import type { LeaveApplication, Department, LeaveType, LeaveStatus } from '@/types'
import {
  getLeaveApplications,
  applyLeave,
  approveLeave
} from '@/api/attendance'
import { getDepartments } from '@/api/user'
import {
  leaveTypeMap,
  leaveStatusMap,
  getInitials,
  formatDateTime,
  calcWorkDays
} from '@/utils'

export default Vue.extend({
  name: 'LeaveManagement',
  data() {
    return {
      loading: false,
      submitting: false,
      rejecting: false,
      tableData: [] as LeaveApplication[],
      departments: [] as Department[],
      filters: {
        type: '' as LeaveType | '',
        status: '' as LeaveStatus | '',
        departmentId: null as number | null
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      applyVisible: false,
      detailVisible: false,
      rejectVisible: false,
      currentLeave: null as LeaveApplication | null,
      rejectId: null as number | null,
      applyForm: {
        type: 'annual' as LeaveType,
        startDate: '',
        endDate: '',
        reason: ''
      },
      applyRules: {
        type: [{ required: true, message: '请选择请假类型', trigger: 'change' }],
        startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
        reason: [
          { required: true, message: '请输入请假原因', trigger: 'blur' },
          { min: 2, message: '请假原因至少2个字符', trigger: 'blur' }
        ]
      } as FormRules,
      rejectForm: {
        reason: ''
      },
      leaveTypeMap,
      leaveStatusMap
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isEmployee', 'isManager', 'isAdmin']),
    canApply(): boolean {
      return true
    },
    canApprove(): boolean {
      return this.isManager || this.isAdmin
    },
    applyDays(): number {
      if (this.applyForm.startDate && this.applyForm.endDate) {
        return calcWorkDays(this.applyForm.startDate, this.applyForm.endDate)
      }
      return 0
    }
  },
  mounted() {
    this.loadDepartments()
    this.loadData()
  },
  methods: {
    getInitials,
    formatDateTime,
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
      } catch (e) {
        // ignore
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params: any = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          type: this.filters.type || undefined,
          status: this.filters.status || undefined
        }
        if (this.isEmployee && this.user) {
          params.userId = this.user.id
        } else if (this.filters.departmentId) {
          params.departmentId = this.filters.departmentId
        }
        const res = await getLeaveApplications(params)
        this.tableData = res.list
        this.pagination.total = res.total
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        type: '',
        status: '',
        departmentId: null
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
    leaveTypeTag(type: LeaveType): string {
      const map: Record<LeaveType, string> = {
        annual: '',
        sick: 'danger',
        personal: 'warning',
        maternity: 'success',
        paternity: 'primary',
        marriage: 'warning',
        funeral: 'info'
      }
      return map[type] || 'info'
    },
    leaveStatusTag(status: LeaveStatus): string {
      const map: Record<LeaveStatus, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return map[status]
    },
    statusIcon(status: LeaveStatus): string {
      const map: Record<LeaveStatus, string> = {
        pending: 'el-icon-time',
        approved: 'el-icon-circle-check',
        rejected: 'el-icon-circle-close'
      }
      return map[status]
    },
    handleApply() {
      this.applyForm = {
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      }
      this.applyVisible = true
    },
    handleApplyClose() {
      ;(this.$refs.applyForm as any)?.resetFields()
    },
    calcDays() {
      // 天数会在computed中自动计算
    },
    async handleApplySubmit() {
      const form = this.$refs.applyForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        if (this.applyDays <= 0) {
          this.$message.warning('请假天数不能为0')
          return
        }
        if (!this.user?.id) return
        this.submitting = true
        try {
          await applyLeave(this.user.id, {
            type: this.applyForm.type,
            startDate: this.applyForm.startDate,
            endDate: this.applyForm.endDate,
            days: this.applyDays,
            reason: this.applyForm.reason
          })
          this.$message.success('申请提交成功')
          this.applyVisible = false
          this.loadData()
        } catch (e: any) {
          this.$message.error(e.message || '提交失败')
        } finally {
          this.submitting = false
        }
      })
    },
    handleView(row: LeaveApplication) {
      this.currentLeave = row
      this.detailVisible = true
    },
    handleApprove(row: LeaveApplication) {
      this.$confirm(`确定通过 ${row.userName} 的${leaveTypeMap[row.type]}申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async () => {
        if (!this.user?.id) return
        try {
          await approveLeave(row.id, this.user.id, 'approved')
          this.$message.success('审批通过')
          this.loadData()
        } catch (e: any) {
          this.$message.error(e.message || '操作失败')
        }
      }).catch(() => {})
    },
    handleReject(row: LeaveApplication) {
      this.rejectId = row.id
      this.rejectForm.reason = ''
      this.rejectVisible = true
    },
    async handleRejectSubmit() {
      if (!this.rejectForm.reason.trim()) {
        this.$message.warning('请输入拒绝原因')
        return
      }
      if (!this.user?.id || !this.rejectId) return
      this.rejecting = true
      try {
        await approveLeave(this.rejectId, this.user.id, 'rejected', this.rejectForm.reason)
        this.$message.success('已拒绝申请')
        this.rejectVisible = false
        this.loadData()
      } catch (e: any) {
        this.$message.error(e.message || '操作失败')
      } finally {
        this.rejecting = false
      }
    },
    handleCancel(row: LeaveApplication) {
      this.$confirm(`确定撤销这条请假申请吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('撤销成功')
        this.loadData()
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.leave-management {
  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-detail {
      .user-name {
        font-weight: 500;
        color: #303133;
      }
      .user-dept {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .leave-detail {
    .detail-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;

      &.status-pending {
        background: #fdf6ec;
        color: #E6A23C;
      }

      &.status-approved {
        background: #f0f9eb;
        color: #67C23A;
      }

      &.status-rejected {
        background: #fef0f0;
        color: #F56C6C;
      }

      i {
        font-size: 24px;
      }
    }
  }
}
</style>
