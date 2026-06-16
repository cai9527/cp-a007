<template>
  <div class="salary-report">
    <div class="page-card">
      <div class="page-header">
        <h2>工资报表</h2>
        <div class="header-actions">
          <el-button type="primary" icon="el-icon-download" @click="handleExportReport" v-if="canExportReport">
            导出工资报表
          </el-button>
          <el-button icon="el-icon-document" @click="handleBatchExportPayslips" v-if="canExportPayslip">
            批量导出工资条
          </el-button>
        </div>
      </div>

      <div class="filter-bar">
        <el-date-picker
          v-model="filters.month"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 180px;"
          @change="handleFilterChange"
        />
        <el-select
          v-model="filters.departmentId"
          placeholder="选择部门"
          clearable
          style="width: 160px;"
          @change="handleFilterChange"
          v-if="!isEmployee"
        >
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-select
          v-model="filters.userId"
          placeholder="选择员工"
          filterable
          clearable
          style="width: 160px;"
          @change="handleFilterChange"
          v-if="!isEmployee"
        >
          <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <div class="salary-tabs">
        <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
          <el-tab-pane label="工资记录" name="records" />
          <el-tab-pane label="薪资档案" name="profiles" v-if="canViewProfile" />
        </el-tabs>
      </div>

      <div v-show="activeTab === 'records'" class="records-tab">
        <el-table :data="recordsData" v-loading="recordsLoading" border stripe style="width: 100%;">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="userName" label="员工姓名" width="100" />
          <el-table-column prop="departmentName" label="部门" width="120" />
          <el-table-column prop="position" label="职位" width="100" />
          <el-table-column prop="month" label="月份" width="100" />
          <el-table-column prop="baseSalary" label="基本工资" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.baseSalary) }}</template>
          </el-table-column>
          <el-table-column prop="performanceSalary" label="绩效工资" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.performanceSalary) }}</template>
          </el-table-column>
          <el-table-column prop="allowance" label="津贴" width="90" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.allowance) }}</template>
          </el-table-column>
          <el-table-column prop="totalEarnings" label="收入合计" width="110" align="right">
            <template slot-scope="scope">
              <span class="text-success">{{ formatMoney(scope.row.totalEarnings) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalDeductions" label="扣款合计" width="110" align="right">
            <template slot-scope="scope">
              <span class="text-danger">{{ formatMoney(scope.row.totalDeductions) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="netSalary" label="实发工资" width="110" align="right">
            <template slot-scope="scope">
              <span class="text-primary font-bold">{{ formatMoney(scope.row.netSalary) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template slot-scope="scope">
              <el-tag :type="statusTagType(scope.row.status)" size="mini">{{ statusMap[scope.row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="viewPayslip(scope.row)">查看工资条</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model="recordsPagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="recordsPagination.pageSize"
            :total="recordsPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleRecordsSizeChange"
            @current-change="handleRecordsPageChange"
          />
        </div>
      </div>

      <div v-show="activeTab === 'profiles'" class="profiles-tab" v-if="canViewProfile">
        <el-table :data="profilesData" v-loading="profilesLoading" border stripe style="width: 100%;">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="userName" label="员工姓名" width="100" />
          <el-table-column prop="departmentName" label="部门" width="120" />
          <el-table-column prop="position" label="职位" width="100" />
          <el-table-column prop="baseSalary" label="基本工资" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.baseSalary) }}</template>
          </el-table-column>
          <el-table-column prop="performanceSalary" label="绩效工资" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.performanceSalary) }}</template>
          </el-table-column>
          <el-table-column prop="allowance" label="津贴" width="90" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.allowance) }}</template>
          </el-table-column>
          <el-table-column prop="socialSecurityBase" label="社保基数" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.socialSecurityBase) }}</template>
          </el-table-column>
          <el-table-column prop="housingFundBase" label="公积金基数" width="110" align="right">
            <template slot-scope="scope">{{ formatMoney(scope.row.housingFundBase) }}</template>
          </el-table-column>
          <el-table-column prop="effectiveDate" label="生效日期" width="110" />
          <el-table-column label="状态" width="80">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
                {{ scope.row.status === 'active' ? '在职' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right" v-if="canEditProfile">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleEditProfile(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            v-model="profilesPagination.page"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="profilesPagination.pageSize"
            :total="profilesPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleProfilesSizeChange"
            @current-change="handleProfilesPageChange"
          />
        </div>
      </div>
    </div>

    <el-dialog
      title="编辑薪资档案"
      :visible.sync="profileDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      @close="handleProfileDialogClose"
    >
      <el-form
        ref="profileForm"
        :model="profileFormData"
        :rules="profileFormRules"
        label-width="120px"
        v-if="profileDialogVisible"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工姓名">
              <el-input v-model="profileFormData.userName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门">
              <el-input v-model="profileFormData.departmentName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="profileFormData.position" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="profileFormData.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                value-format="YYYY-MM-DD"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基本工资" prop="baseSalary">
              <el-input-number
                v-model="profileFormData.baseSalary"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绩效工资" prop="performanceSalary">
              <el-input-number
                v-model="profileFormData.performanceSalary"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="津贴" prop="allowance">
              <el-input-number
                v-model="profileFormData.allowance"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="个税起征额" prop="taxFreeAmount">
              <el-input-number
                v-model="profileFormData.taxFreeAmount"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社保基数" prop="socialSecurityBase">
              <el-input-number
                v-model="profileFormData.socialSecurityBase"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公积金基数" prop="housingFundBase">
              <el-input-number
                v-model="profileFormData.housingFundBase"
                :min="0"
                :precision="2"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="profileFormData.status">
            <el-radio label="active">在职</el-radio>
            <el-radio label="inactive">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="profileDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="profileSubmitting" @click="handleProfileSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="工资条详情"
      :visible.sync="payslipDialogVisible"
      width="650px"
      :close-on-click-modal="false"
      custom-class="payslip-dialog"
    >
      <div class="payslip-container" v-if="currentPayslip">
        <div class="payslip-header">
          <div class="company-name">XX科技有限公司</div>
          <div class="payslip-title">员工工资条</div>
          <div class="payslip-month">{{ currentPayslip.month }}</div>
        </div>

        <div class="payslip-employee-info">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ currentPayslip.userName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">部门：</span>
              <span class="info-value">{{ currentPayslip.departmentName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">职位：</span>
              <span class="info-value">{{ currentPayslip.position }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">出勤天数：</span>
              <span class="info-value">{{ currentPayslip.actualWorkDays }} / {{ currentPayslip.standardWorkDays }} 天</span>
            </div>
            <div class="info-item">
              <span class="info-label">出勤率：</span>
              <span class="info-value">{{ currentPayslip.attendanceRate }}%</span>
            </div>
            <div class="info-item">
              <span class="info-label">状态：</span>
              <el-tag :type="statusTagType(currentPayslip.status)" size="mini">{{ statusMap[currentPayslip.status] }}</el-tag>
            </div>
          </div>
        </div>

        <div class="payslip-details">
          <div class="details-section">
            <div class="section-title">
              <i class="el-icon-circle-plus-outline" style="color: #67C23A;"></i>
              <span>收入明细</span>
            </div>
            <div class="details-table">
              <div
                class="detail-row"
                v-for="item in earningsItems"
                :key="item.itemCode"
              >
                <span class="detail-name">{{ item.itemName }}</span>
                <span class="detail-amount earning">{{ formatMoney(item.amount) }}</span>
              </div>
            </div>
            <div class="section-total">
              <span class="total-label">收入合计</span>
              <span class="total-amount earning">{{ formatMoney(currentPayslip.totalEarnings) }}</span>
            </div>
          </div>

          <div class="details-section">
            <div class="section-title">
              <i class="el-icon-circle-minus-outline" style="color: #F56C6C;"></i>
              <span>扣除明细</span>
            </div>
            <div class="details-table">
              <div
                class="detail-row"
                v-for="item in deductionItems"
                :key="item.itemCode"
              >
                <span class="detail-name">{{ item.itemName }}</span>
                <span class="detail-amount deduction">{{ formatMoney(item.amount) }}</span>
              </div>
            </div>
            <div class="section-total">
              <span class="total-label">扣除合计</span>
              <span class="total-amount deduction">{{ formatMoney(currentPayslip.totalDeductions) }}</span>
            </div>
          </div>
        </div>

        <div class="payslip-summary">
          <div class="summary-item">
            <span class="summary-label">实发工资</span>
            <span class="summary-value">{{ formatMoney(currentPayslip.netSalary) }}</span>
          </div>
        </div>

        <div class="payslip-footer">
          <div class="footer-note">注：本工资条为系统自动生成，如有疑问请联系人力资源部</div>
          <div class="footer-time">生成时间：{{ currentPayslip.updatedAt }}</div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="payslipDialogVisible = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { FormRules } from 'element-ui'
import type {
  EmployeeSalaryProfile,
  SalaryRecord,
  Department,
  User,
  PaginatedResponse
} from '@/types'
import {
  getSalaryProfiles,
  getSalaryRecords,
  updateSalaryProfile,
  exportSalaryReport,
  batchExportPayslips,
  getSalaryRecord
} from '@/api/salary'
import { getDepartments, getUsers } from '@/api/user'
import { currentMonth } from '@/data/mockData'
import { mapGetters } from 'vuex'

export default Vue.extend({
  name: 'SalaryReport',
  data() {
    return {
      activeTab: 'records',
      departments: [] as Department[],
      userList: [] as User[],
      statusMap: {
        draft: '待确认',
        confirmed: '已确认',
        paid: '已发放'
      } as Record<string, string>,

      filters: {
        month: currentMonth,
        departmentId: null as number | null,
        userId: null as number | null
      },

      recordsLoading: false,
      recordsData: [] as SalaryRecord[],
      recordsPagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },

      profilesLoading: false,
      profilesData: [] as EmployeeSalaryProfile[],
      profilesPagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },

      profileDialogVisible: false,
      profileSubmitting: false,
      profileFormData: {
        id: null as number | null,
        userId: null as number | null,
        userName: '',
        departmentName: '',
        position: '',
        baseSalary: 0,
        performanceSalary: 0,
        allowance: 0,
        socialSecurityBase: 0,
        housingFundBase: 0,
        taxFreeAmount: 5000,
        effectiveDate: '',
        status: 'active' as 'active' | 'inactive'
      },
      profileFormRules: {
        baseSalary: [
          { required: true, message: '请输入基本工资', trigger: 'blur' }
        ],
        performanceSalary: [
          { required: true, message: '请输入绩效工资', trigger: 'blur' }
        ],
        allowance: [
          { required: true, message: '请输入津贴', trigger: 'blur' }
        ],
        socialSecurityBase: [
          { required: true, message: '请输入社保基数', trigger: 'blur' }
        ],
        housingFundBase: [
          { required: true, message: '请输入公积金基数', trigger: 'blur' }
        ],
        effectiveDate: [
          { required: true, message: '请选择生效日期', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      } as FormRules,

      payslipDialogVisible: false,
      currentPayslip: null as SalaryRecord | null
    }
  },
  computed: {
    ...mapGetters(['isEmployee', 'isSalaryAdmin', 'hasPermission']),
    canViewProfile(): boolean {
      return this.hasPermission('salary:profile:view')
    },
    canEditProfile(): boolean {
      return this.hasPermission('salary:profile:edit')
    },
    canViewPayslip(): boolean {
      return this.hasPermission('salary:payslip:view') || this.hasPermission('salary:payslip:view:self')
    },
    canExportReport(): boolean {
      return this.hasPermission('salary:report:export')
    },
    canExportPayslip(): boolean {
      return this.hasPermission('salary:payslip:export')
    },
    earningsItems() {
      return this.currentPayslip?.details.filter(d => d.type === 'earning') || []
    },
    deductionItems() {
      return this.currentPayslip?.details.filter(d => d.type === 'deduction') || []
    }
  },
  created() {
    if (!this.$store.getters.isSalaryAdmin) {
      this.$message.error('您没有权限访问工资报表页面')
      this.$router.replace('/dashboard')
      return
    }
    const role = this.$store.state.user?.role
    if (role !== 'super_admin' && role !== 'hr_admin') {
      this.$message.error('您没有权限访问工资管理模块')
      this.$router.replace('/dashboard')
    }
  },
  mounted() {
    this.loadDepartments()
    this.loadUserList()
    this.loadData()
  },
  methods: {
    formatMoney(value: number): string {
      return value.toFixed(2)
    },
    statusTagType(status: string): string {
      const map: Record<string, string> = {
        draft: 'info',
        confirmed: 'warning',
        paid: 'success'
      }
      return map[status] || 'info'
    },
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
      } catch (e: any) {
        this.$message.error(e.message || '加载部门数据失败')
      }
    },
    async loadUserList() {
      try {
        const res = await getUsers({ page: 1, pageSize: 100, status: 'active' })
        this.userList = res.list
      } catch (e: any) {
        this.$message.error(e.message || '加载员工数据失败')
      }
    },
    handleFilterChange() {
      this.recordsPagination.page = 1
      this.profilesPagination.page = 1
    },
    handleTabClick() {
      this.loadData()
    },
    loadData() {
      if (this.activeTab === 'records') {
        this.loadRecords()
      } else if (this.activeTab === 'profiles') {
        this.loadProfiles()
      }
    },
    async loadRecords() {
      this.recordsLoading = true
      try {
        const params = {
          page: this.recordsPagination.page,
          pageSize: this.recordsPagination.pageSize,
          month: this.filters.month,
          departmentId: this.filters.departmentId || undefined,
          userId: this.filters.userId || undefined
        }
        if (this.isEmployee && this.$store.state.user) {
          params.userId = this.$store.state.user.id
        }
        const res = await getSalaryRecords(params)
        this.recordsData = res.list
        this.recordsPagination.total = res.total
      } catch (e: any) {
        this.$message.error(e.message || '加载工资记录失败')
      } finally {
        this.recordsLoading = false
      }
    },
    async loadProfiles() {
      this.profilesLoading = true
      try {
        const params = {
          page: this.profilesPagination.page,
          pageSize: this.profilesPagination.pageSize,
          departmentId: this.filters.departmentId || undefined,
          keyword: this.filters.userId
            ? this.userList.find(u => u.id === this.filters.userId)?.name || ''
            : undefined
        }
        const res = await getSalaryProfiles(params)
        this.profilesData = res.list
        this.profilesPagination.total = res.total
      } catch (e: any) {
        this.$message.error(e.message || '加载薪资档案失败')
      } finally {
        this.profilesLoading = false
      }
    },
    resetFilters() {
      this.filters = {
        month: currentMonth,
        departmentId: null,
        userId: null
      }
      this.recordsPagination.page = 1
      this.profilesPagination.page = 1
      this.loadData()
    },
    handleRecordsSizeChange(size: number) {
      this.recordsPagination.pageSize = size
      this.recordsPagination.page = 1
      this.loadRecords()
    },
    handleRecordsPageChange(page: number) {
      this.recordsPagination.page = page
      this.loadRecords()
    },
    handleProfilesSizeChange(size: number) {
      this.profilesPagination.pageSize = size
      this.profilesPagination.page = 1
      this.loadProfiles()
    },
    handleProfilesPageChange(page: number) {
      this.profilesPagination.page = page
      this.loadProfiles()
    },
    handleEditProfile(row: EmployeeSalaryProfile) {
      this.profileFormData = {
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        departmentName: row.departmentName,
        position: row.position,
        baseSalary: row.baseSalary,
        performanceSalary: row.performanceSalary,
        allowance: row.allowance,
        socialSecurityBase: row.socialSecurityBase,
        housingFundBase: row.housingFundBase,
        taxFreeAmount: row.taxFreeAmount,
        effectiveDate: row.effectiveDate,
        status: row.status
      }
      this.profileDialogVisible = true
    },
    handleProfileDialogClose() {
      ;(this.$refs.profileForm as any)?.resetFields()
    },
    async handleProfileSubmit() {
      const form = this.$refs.profileForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        this.profileSubmitting = true
        try {
          if (this.profileFormData.userId) {
            await updateSalaryProfile(this.profileFormData.userId, {
              baseSalary: this.profileFormData.baseSalary,
              performanceSalary: this.profileFormData.performanceSalary,
              allowance: this.profileFormData.allowance,
              socialSecurityBase: this.profileFormData.socialSecurityBase,
              housingFundBase: this.profileFormData.housingFundBase,
              taxFreeAmount: this.profileFormData.taxFreeAmount,
              effectiveDate: this.profileFormData.effectiveDate,
              status: this.profileFormData.status
            })
            this.$message.success('编辑成功')
            this.profileDialogVisible = false
            this.loadProfiles()
          }
        } catch (e: any) {
          this.$message.error(e.message || '操作失败')
        } finally {
          this.profileSubmitting = false
        }
      })
    },
    async viewPayslip(row: SalaryRecord) {
      try {
        const record = await getSalaryRecord(row.id)
        if (record) {
          this.currentPayslip = record
          this.payslipDialogVisible = true
        }
      } catch (e: any) {
        this.$message.error(e.message || '加载工资条失败')
      }
    },
    async handleExportReport() {
      try {
        this.$message.success('正在导出工资报表，请稍候...')
        const res = await exportSalaryReport(this.filters.month)
        if (res.success) {
          this.$message.success('导出成功')
        }
      } catch (e: any) {
        this.$message.error(e.message || '导出失败')
      }
    },
    async handleBatchExportPayslips() {
      try {
        this.$message.success('正在批量导出工资条，请稍候...')
        const res = await batchExportPayslips(this.filters.month)
        if (res.success) {
          this.$message.success('批量导出成功')
        }
      } catch (e: any) {
        this.$message.error(e.message || '批量导出失败')
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.salary-report {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .salary-tabs {
    margin-bottom: 16px;

    ::v-deep .el-tabs__item {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .text-success {
    color: #67C23A;
  }

  .text-danger {
    color: #F56C6C;
  }

  .text-primary {
    color: #409EFF;
  }

  .font-bold {
    font-weight: 600;
  }

  ::v-deep .el-table td,
  ::v-deep .el-table th {
    padding: 10px 8px;
  }

  .payslip-dialog {
    ::v-deep .el-dialog__body {
      padding: 0;
    }
  }

  .payslip-container {
    padding: 30px;
    background: #fff;

    .payslip-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #409EFF;
      margin-bottom: 20px;

      .company-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .payslip-title {
        font-size: 24px;
        font-weight: bold;
        color: #409EFF;
        margin-bottom: 8px;
      }

      .payslip-month {
        font-size: 14px;
        color: #909399;
      }
    }

    .payslip-employee-info {
      background: #f5f7fa;
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 20px;

      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .info-item {
        flex: 1;

        .info-label {
          color: #909399;
          font-size: 13px;
        }

        .info-value {
          color: #303133;
          font-weight: 500;
          font-size: 13px;
        }
      }
    }

    .payslip-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;

      .details-section {
        border: 1px solid #ebeef5;
        border-radius: 8px;
        overflow: hidden;

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f5f7fa;
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }

        .details-table {
          padding: 8px 0;

          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 16px;
            font-size: 13px;

            &:hover {
              background: #f5f7fa;
            }

            .detail-name {
              color: #606266;
            }

            .detail-amount {
              font-weight: 500;
              font-family: 'Consolas', 'Monaco', monospace;

              &.earning {
                color: #67C23A;
              }

              &.deduction {
                color: #F56C6C;
              }
            }
          }
        }

        .section-total {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #fafafa;
          border-top: 1px solid #ebeef5;
          font-weight: 600;

          .total-label {
            color: #303133;
          }

          .total-amount {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 14px;

            &.earning {
              color: #67C23A;
            }

            &.deduction {
              color: #F56C6C;
            }
          }
        }
      }
    }

    .payslip-summary {
      background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 20px;

      .summary-item {
        .summary-label {
          display: block;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          margin-bottom: 8px;
        }

        .summary-value {
          display: block;
          color: #fff;
          font-size: 32px;
          font-weight: bold;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }
    }

    .payslip-footer {
      padding-top: 16px;
      border-top: 1px solid #ebeef5;
      text-align: center;

      .footer-note {
        color: #909399;
        font-size: 12px;
        margin-bottom: 6px;
      }

      .footer-time {
        color: #c0c4cc;
        font-size: 12px;
      }
    }
  }
}
</style>
