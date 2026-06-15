<template>
  <div class="salary-calculation">
    <div class="page-card">
      <div class="page-header">
        <h2>薪资计算</h2>
      </div>

      <el-form :inline="true" :model="calcForm" class="calc-form">
        <el-form-item label="计算月份">
          <el-date-picker
            v-model="calcForm.month"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择月份"
            style="width: 160px;"
          />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="calcForm.departmentId" placeholder="全部部门" clearable style="width: 160px;">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工">
          <el-select
            v-model="calcForm.userId" placeholder="全部员工" clearable style="width: 160px;"
            filterable
          >
            <el-option v-for="user in filteredUsers" :key="user.id" :label="user.name" :value="user.id" />
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-calculator" :loading="calculating" @click="handleCalculate">
            计算薪资
          </el-button>
        </el-form-item>
      </el-form>

      <div class="filter-bar">
        <el-date-picker
          v-model="filters.month"
          type="month"
          value-format="YYYY-MM"
          placeholder="选择月份"
          clearable
          style="width: 160px;"
          @change="loadData"
        />
        <el-select v-model="filters.departmentId" placeholder="选择部门" clearable style="width: 160px;" @change="loadData">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px;" @change="loadData">
          <el-option label="草稿" value="draft" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已发放" value="paid" />
        </el-select>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <div class="batch-actions" v-if="selectedIds.length > 0">
        <el-button type="success" :disabled="!canConfirm" @click="handleBatchConfirm">
          <i class="el-icon-check"></i> 确认薪资
        </el-button>
        <el-button type="warning" :disabled="!canMarkPaid" @click="handleBatchMarkPaid">
          <i class="el-icon-money"></i> 标记已发放
        </el-button>
        <span class="selected-count">已选择 {{ selectedIds.length }} 条记录</span>
      </div>

      <el-table
        :data="tableData" v-loading="loading" border stripe style="width: 100%;" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="userName" label="员工姓名" width="100" />
        <el-table-column prop="departmentName" label="部门" width="100" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="month" label="月份" width="100" />
        <el-table-column prop="baseSalary" label="基本工资" width="100" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.baseSalary) }}</template>
        </el-table-column>
        <el-table-column prop="performanceSalary" label="绩效工资" width="100" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.performanceSalary) }}</template>
        </el-table-column>
        <el-table-column prop="overtimePay" label="加班费" width="90" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.overtimePay) }}</template>
        </el-table-column>
        <el-table-column prop="bonus" label="奖金" width="90" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.bonus) }}</template>
        </el-table-column>
        <el-table-column prop="allowance" label="津贴" width="90" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.allowance) }}</template>
        </el-table-column>
        <el-table-column prop="totalEarnings" label="总收入" width="100" align="right">
          <template slot-scope="scope">
            <span class="text-primary font-medium">{{ formatMoney(scope.row.totalEarnings) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="socialSecurityPersonal" label="社保个人" width="100" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.socialSecurityPersonal) }}</template>
        </el-table-column>
        <el-table-column prop="housingFundPersonal" label="公积金个人" width="100" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.housingFundPersonal) }}</template>
        </el-table-column>
        <el-table-column prop="personalIncomeTax" label="个税" width="90" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.personalIncomeTax) }}</template>
        </el-table-column>
        <el-table-column prop="totalDeductions" label="总扣除" width="100" align="right">
          <template slot-scope="scope">
            <span class="text-danger">{{ formatMoney(scope.row.totalDeductions) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="netSalary" label="实发工资" width="100" align="right">
          <template slot-scope="scope">
            <span class="text-success font-bold">{{ formatMoney(scope.row.netSalary) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)" size="mini">
              {{ statusMap[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="actualWorkDays" label="出勤天数" width="90" align="center" />
        <el-table-column prop="standardWorkDays" label="标准天数" width="90" align="center" />
        <el-table-column prop="attendanceRate" label="出勤率" width="80" align="center">
          <template slot-scope="scope">{{ scope.row.attendanceRate }}%</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleViewDetail(scope.row)">详情</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)" :disabled="scope.row.status !== 'draft'">编辑</el-button>
            <el-button type="text" size="small" @click="handleExport(scope.row)">导出</el-button>
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
      title="编辑薪资"
      :visible.sync="editDialogVisible"
      width="700px"
      :close-on-click-modal="false"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editForm"
        :model="editFormData"
        :rules="editFormRules"
        label-width="120px"
        v-if="editDialogVisible && currentEditRecord"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工姓名">
              <el-input :value="currentEditRecord.userName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份">
              <el-input :value="currentEditRecord.month" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">收入项</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基本工资" prop="baseSalary">
              <el-input-number v-model="editFormData.baseSalary" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绩效工资" prop="performanceSalary">
              <el-input-number v-model="editFormData.performanceSalary" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="加班费" prop="overtimePay">
              <el-input-number v-model="editFormData.overtimePay" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖金" prop="bonus">
              <el-input-number v-model="editFormData.bonus" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="津贴补贴" prop="allowance">
              <el-input-number v-model="editFormData.allowance" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他收入" prop="otherEarnings">
              <el-input-number v-model="editFormData.otherEarnings" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">扣除项</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社保个人" prop="socialSecurityPersonal">
              <el-input-number v-model="editFormData.socialSecurityPersonal" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公积金个人" prop="housingFundPersonal">
              <el-input-number v-model="editFormData.housingFundPersonal" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="个人所得税" prop="personalIncomeTax">
              <el-input-number v-model="editFormData.personalIncomeTax" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="其他扣款" prop="otherDeductions">
              <el-input-number v-model="editFormData.otherDeductions" :min="0" :precision="2" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="总收入">
              <el-input :value="formatMoney(calcEditTotalEarnings)" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总扣除">
              <el-input :value="formatMoney(calcEditTotalDeductions)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实发工资">
              <el-input :value="formatMoney(calcEditNetSalary)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleEditSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="薪资详情"
      :visible.sync="detailDialogVisible"
      width="600px"
    >
      <div class="salary-detail" v-if="currentDetailRecord">
        <div class="detail-header">
          <div class="detail-title">
          <h3>{{ currentDetailRecord.userName }}</h3>
          <p>{{ currentDetailRecord.departmentName }} · {{ currentDetailRecord.position }}</p>
          <p class="detail-month">{{ currentDetailRecord.month }}</p>
        </div>
        <el-tag :type="statusTagType(currentDetailRecord.status)" size="small">
          {{ statusMap[currentDetailRecord.status] }}
        </el-tag>
      </div>

      <el-descriptions :column="2" border size="small" class="detail-desc">
        <el-descriptions-item label="出勤天数">{{ currentDetailRecord.actualWorkDays }} / {{ currentDetailRecord.standardWorkDays }}</el-descriptions-item>
        <el-descriptions-item label="出勤率">{{ currentDetailRecord.attendanceRate }}%</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">收入明细</el-divider>
      <el-table :data="earningDetails" border size="small">
        <el-table-column prop="itemName" label="项目" />
        <el-table-column prop="amount" label="金额" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.amount) }}</template>
        </el-table-column>
      </el-table>
      <div class="detail-total">
        <span>总收入：</span>
        <span class="text-primary font-bold">{{ formatMoney(currentDetailRecord.totalEarnings) }}</span>
      </div>

      <el-divider content-position="left">扣除明细</el-divider>
      <el-table :data="deductionDetails" border size="small">
        <el-table-column prop="itemName" label="项目" />
        <el-table-column prop="amount" label="金额" align="right">
          <template slot-scope="scope">{{ formatMoney(scope.row.amount) }}</template>
        </el-table-column>
      </el-table>
      <div class="detail-total">
        <span>总扣除：</span>
        <span class="text-danger font-bold">{{ formatMoney(currentDetailRecord.totalDeductions) }}</span>
      </div>

      <el-divider />
      <div class="detail-net">
        <span>实发工资：</span>
        <span class="text-success font-bold">{{ formatMoney(currentDetailRecord.netSalary) }}</span>
      </div>
    </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { FormRules } from 'element-ui'
import type { SalaryRecord, Department, User, PaginatedResponse } from '@/types'
import {
  getSalaryRecords,
  calculateSalary,
  confirmSalary,
  markAsPaid,
  updateSalaryRecord,
  exportPayslip
} from '@/api/salary'
import { getDepartments } from '@/api/user'
import { currentMonth, mockUsers } from '@/data/mockData'
import { mapState, mapGetters } from 'vuex'
import type { RootState } from '@/store'

export default Vue.extend({
  name: 'SalaryCalculation',
  data() {
    return {
      loading: false,
      calculating: false,
      submitting: false,
      tableData: [] as SalaryRecord[],
      departments: [] as Department[],
      users: [] as User[],
      calcForm: {
        month: currentMonth,
        departmentId: null as number | null,
        userId: null as number | null
      },
      filters: {
        month: '',
        departmentId: null as number | null,
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      selectedIds: [] as number[],
      editDialogVisible: false,
      detailDialogVisible: false,
      currentEditRecord: null as SalaryRecord | null,
      currentDetailRecord: null as SalaryRecord | null,
      editFormData: {
        id: null as number | null,
        baseSalary: 0,
        performanceSalary: 0,
        overtimePay: 0,
        bonus: 0,
        allowance: 0,
        otherEarnings: 0,
        socialSecurityPersonal: 0,
        housingFundPersonal: 0,
        personalIncomeTax: 0,
        otherDeductions: 0
      },
      editFormRules: {
        baseSalary: [{ required: true, message: '请输入基本工资', trigger: 'blur' }]
      } as FormRules,
      statusMap: {
        draft: '草稿',
        confirmed: '已确认',
        paid: '已发放'
      } as Record<string, string>
    }
  },
  computed: {
    ...mapState({
      user: (state: RootState) => state.user
    }),
    ...mapGetters(['hasPermission', 'isAdmin']),
    filteredUsers(): User[] {
      if (this.calcForm.departmentId) {
        return this.users.filter(u => u.departmentId === this.calcForm.departmentId && u.status === 'active')
      }
      return this.users.filter(u => u.status === 'active')
    },
    canConfirm(): boolean {
      return this.selectedIds.length > 0 &&
        this.selectedRecords.every(id => {
          const record = this.tableData.find(r => r.id === id)
          return record?.status === 'draft'
        })
    },
    canMarkPaid(): boolean {
      return this.selectedIds.length > 0 &&
        this.selectedRecords.every(id => {
          const record = this.tableData.find(r => r.id === id)
          return record?.status === 'confirmed'
        })
    },
    selectedRecords(): SalaryRecord[] {
      return this.tableData.filter(r => this.selectedIds.includes(r.id))
    },
    calcEditTotalEarnings(): number {
      return Math.round((
        this.editFormData.baseSalary +
        this.editFormData.performanceSalary +
        this.editFormData.overtimePay +
        this.editFormData.bonus +
        this.editFormData.allowance +
        this.editFormData.otherEarnings
      ) * 100) / 100
    },
    calcEditTotalDeductions(): number {
      return Math.round((
        this.editFormData.socialSecurityPersonal +
        this.editFormData.housingFundPersonal +
        this.editFormData.personalIncomeTax +
        this.editFormData.otherDeductions
      ) * 100) / 100
    },
    calcEditNetSalary(): number {
      return Math.round((this.calcEditTotalEarnings - this.calcEditTotalDeductions) * 100) / 100
    },
    earningDetails() {
      if (!this.currentDetailRecord) return []
      return this.currentDetailRecord.details.filter(d => d.type === 'earning')
    },
    deductionDetails() {
      if (!this.currentDetailRecord) return []
      return this.currentDetailRecord.details.filter(d => d.type === 'deduction')
    }
  },
  mounted() {
    this.loadDepartments()
    this.loadUsers()
    this.loadData()
  },
  methods: {
    formatMoney(value: number): string {
      return value.toFixed(2)
    },
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
      } catch (e: any) {
        this.$message.error(e.message || '加载部门数据失败')
      }
    },
    loadUsers() {
      this.users = mockUsers.filter(u => u.role !== 'super_admin')
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getSalaryRecords({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          month: this.filters.month || undefined,
          departmentId: this.filters.departmentId || undefined,
          status: this.filters.status || undefined
        })
        this.tableData = res.list
        this.pagination.total = res.total
        this.selectedIds = []
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = {
        month: '',
        departmentId: null,
        status: ''
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
    statusTagType(status: string): string {
      const map: Record<string, string> = {
        draft: 'info',
        confirmed: 'warning',
        paid: 'success'
      }
      return map[status] || 'info'
    },
    handleSelectionChange(selection: SalaryRecord[]) {
      this.selectedIds = selection.map(r => r.id)
    },
    async handleCalculate() {
      if (!this.calcForm.month) {
        this.$message.warning('请选择计算月份')
        return
      }
      this.calculating = true
      try {
        await calculateSalary({
          month: this.calcForm.month,
          departmentId: this.calcForm.departmentId || undefined,
          userId: this.calcForm.userId || undefined
        })
        this.$message.success('薪资计算成功')
        this.loadData()
      } catch (e: any) {
        this.$message.error(e.message || '薪资计算失败')
      } finally {
        this.calculating = false
      }
    },
    async handleBatchConfirm() {
      if (this.selectedIds.length === 0) return
      const records = this.selectedRecords
      const month = records[0]?.month
      if (!month) return

      this.$confirm(`确定要确认选中的 ${this.selectedIds.length} 条薪资记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
          try {
            await confirmSalary(month, this.user?.id || 1)
            this.$message.success('确认成功')
            this.loadData()
          } catch (e: any) {
            this.$message.error(e.message || '确认失败')
          }
        }).catch(() => {})
    },
    async handleBatchMarkPaid() {
      if (this.selectedIds.length === 0) return
      const records = this.selectedRecords
      const month = records[0]?.month
      if (!month) return

      this.$confirm(`确定要将选中的 ${this.selectedIds.length} 条薪资记录标记为已发放吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
          try {
            await markAsPaid(month)
            this.$message.success('标记成功')
            this.loadData()
          } catch (e: any) {
            this.$message.error(e.message || '标记失败')
          }
        }).catch(() => {})
    },
    handleViewDetail(row: SalaryRecord) {
      this.currentDetailRecord = row
      this.detailDialogVisible = true
    },
    handleEdit(row: SalaryRecord) {
      if (row.status !== 'draft') {
        this.$message.warning('只有草稿状态的记录才能编辑')
        return
      }
      this.currentEditRecord = row
      this.editFormData = {
        id: row.id,
        baseSalary: row.baseSalary,
        performanceSalary: row.performanceSalary,
        overtimePay: row.overtimePay,
        bonus: row.bonus,
        allowance: row.allowance,
        otherEarnings: row.otherEarnings,
        socialSecurityPersonal: row.socialSecurityPersonal,
        housingFundPersonal: row.housingFundPersonal,
        personalIncomeTax: row.personalIncomeTax,
        otherDeductions: row.otherDeductions
      }
      this.editDialogVisible = true
    },
    handleEditDialogClose() {
      ;(this.$refs.editForm as any)?.resetFields()
    },
    async handleEditSubmit() {
      const form = this.$refs.editForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        this.submitting = true
        try {
          if (this.editFormData.id) {
            await updateSalaryRecord(this.editFormData.id, {
              baseSalary: this.editFormData.baseSalary,
              performanceSalary: this.editFormData.performanceSalary,
              overtimePay: this.editFormData.overtimePay,
              bonus: this.editFormData.bonus,
              allowance: this.editFormData.allowance,
              otherEarnings: this.editFormData.otherEarnings,
              socialSecurityPersonal: this.editFormData.socialSecurityPersonal,
              housingFundPersonal: this.editFormData.housingFundPersonal,
              personalIncomeTax: this.editFormData.personalIncomeTax,
              otherDeductions: this.editFormData.otherDeductions,
              totalEarnings: this.calcEditTotalEarnings,
              totalDeductions: this.calcEditTotalDeductions,
              netSalary: this.calcEditNetSalary
            })
            this.$message.success('编辑成功')
            this.editDialogVisible = false
            this.loadData()
          }
        } catch (e: any) {
            this.$message.error(e.message || '编辑失败')
          } finally {
            this.submitting = false
          }
        })
    },
    async handleExport(row: SalaryRecord) {
      try {
        const res = await exportPayslip(row.userId, row.month)
        if (res.success && res.url) {
          this.$message.success('导出成功')
          window.open(res.url, '_blank')
        }
      } catch (e: any) {
        this.$message.error(e.message || '导出失败')
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.salary-calculation {
  .calc-form {
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }

  .batch-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
    padding: 12px 16px;
    background: #ecf5ff;
    border-radius: 4px;

    .selected-count {
      margin-left: auto;
      color: #606266;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .text-primary {
    color: #409EFF;
  }

  .text-success {
    color: #67C23A;
  }

  .text-danger {
    color: #F56C6C;
  }

  .font-medium {
    font-weight: 500;
  }

  .font-bold {
    font-weight: 600;
  }

  .salary-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .detail-title {
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
        }
        p {
          margin: 0 0 4px 0;
          color: #606266;
        }
        .detail-month {
          color: #909399;
          font-size: 13px;
        }
      }
    }

    .detail-desc {
      margin-bottom: 20px;
    }

    .detail-total {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      font-size: 14px;
      margin-top: 12px 0;
    }

    .detail-net {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;
      font-size: 16px;
    }
  }
}
</style>
