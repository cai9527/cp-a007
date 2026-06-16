<template>
  <div class="contract-reminders">
    <div class="page-card">
      <div class="page-header">
        <h2>合同到期提醒</h2>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-num expiring">{{ expiringCount }}</span>
            <span class="stat-label">即将到期</span>
          </div>
          <div class="stat-item">
            <span class="stat-num expired">{{ expiredCount }}</span>
            <span class="stat-label">已到期</span>
          </div>
          <div class="stat-item">
            <span class="stat-num probation">{{ probationCount }}</span>
            <span class="stat-label">试用期即将结束</span>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <el-radio-group v-model="filterType" @change="handleTypeChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="expiration">到期提醒</el-radio-button>
          <el-radio-button label="renewal">续签提醒</el-radio-button>
          <el-radio-button label="probation_end">试用期结束</el-radio-button>
        </el-radio-group>
        <div class="filter-right">
          <el-input v-model="filters.keyword" placeholder="搜索合同编号/员工姓名" clearable style="width: 220px;" @keyup.enter.native="loadData" />
          <el-checkbox v-model="showHandled" @change="loadData">显示已处理</el-checkbox>
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="提醒类型" width="130">
          <template slot-scope="scope">
            <el-tag :type="getReminderTagType(scope.row.type)" size="mini">
              {{ reminderTypeMap[scope.row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contractNo" label="合同编号" width="160">
          <template slot-scope="scope">
            <el-button type="text" @click="goToContractDetail(scope.row.contractId)">
              {{ scope.row.contractNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="员工姓名" width="100" />
        <el-table-column prop="departmentName" label="部门" width="140" />
        <el-table-column label="剩余天数" width="120" align="center">
          <template slot-scope="scope">
            <span :class="getDaysClass(scope.row.daysRemaining)">
              {{ scope.row.daysRemaining }}天
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="reminderDate" label="提醒日期" width="120" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.handled ? 'info' : 'warning'" size="mini">
              {{ scope.row.handled ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="生成时间" width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="goToContractDetail(scope.row.contractId)">查看合同</el-button>
            <el-button type="text" size="small" @click="handleRenew(scope.row)" v-if="scope.row.type !== 'probation_end'">续签</el-button>
            <el-button type="text" size="small" @click="handleMarkHandled(scope.row)" v-if="!scope.row.handled">标记已处理</el-button>
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
        <el-form-item label="合同编号">
          <span>{{ currentReminder?.contractNo }}</span>
        </el-form-item>
        <el-form-item label="员工姓名">
          <span>{{ currentReminder?.userName }}</span>
        </el-form-item>
        <el-form-item label="新合同到期日" required>
          <el-date-picker
            v-model="renewEndDate"
            type="date"
            placeholder="请选择新的到期日期"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import {
  getContractReminders,
  handleContractReminder,
  renewContract
} from '@/api/contract'
import type { ContractReminder } from '@/types'

export default Vue.extend({
  name: 'ContractReminders',
  data() {
    return {
      loading: false,
      tableData: [] as ContractReminder[],
      filterType: '',
      showHandled: false,
      filters: {
        keyword: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      expiringCount: 0,
      expiredCount: 0,
      probationCount: 0,
      
      reminderTypeMap: {
        expiration: '到期提醒',
        renewal: '续签提醒',
        probation_end: '试用期结束'
      },
      
      renewDialogVisible: false,
      currentReminder: null as ContractReminder | null,
      renewEndDate: '',
      renewRemark: ''
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission'])
  },
  created() {
    this.loadData()
    this.loadCounts()
  },
  methods: {
    getReminderTagType(type: string): string {
      const map: Record<string, string> = {
        expiration: 'danger',
        renewal: 'warning',
        probation_end: 'warning'
      }
      return map[type] || 'info'
    },
    getDaysClass(days: number): string {
      if (days <= 7) return 'days-danger'
      if (days <= 30) return 'days-warning'
      return 'days-normal'
    },
    loadCounts() {
      const allReminders = this.tableData
      this.expiringCount = allReminders.filter(r => r.type === 'expiration' && !r.handled).length
      this.expiredCount = allReminders.filter(r => r.type === 'renewal' && !r.handled).length
      this.probationCount = allReminders.filter(r => r.type === 'probation_end' && !r.handled).length
    },
    handleTypeChange() {
      this.pagination.page = 1
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getContractReminders({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          type: this.filterType || undefined,
          handled: this.showHandled ? undefined : false,
          keyword: this.filters.keyword || undefined
        })
        this.tableData = res.list
        this.pagination.total = res.total
        
        if (this.pagination.page === 1) {
          this.loadCounts()
        }
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
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
    goToContractDetail(contractId: number) {
      this.$router.push(`/contract/detail/${contractId}`)
    },
    handleRenew(row: ContractReminder) {
      this.currentReminder = row
      this.renewEndDate = dayjs().add(1, 'year').format('YYYY-MM-DD')
      this.renewRemark = ''
      this.renewDialogVisible = true
    },
    async confirmRenew() {
      if (!this.renewEndDate) {
        this.$message.warning('请选择新的到期日期')
        return
      }
      if (!this.currentReminder) return
      try {
        const res = await renewContract(this.currentReminder.contractId, this.renewEndDate)
        if (res) {
          this.$message.success('续签成功')
          this.renewDialogVisible = false
          this.loadData()
        }
      } catch (e) {
        this.$message.error('续签失败')
      }
    },
    handleMarkHandled(row: ContractReminder) {
      this.$confirm('确定标记该提醒为已处理吗？', '确认操作', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await handleContractReminder(row.id)
          if (res) {
            this.$message.success('已标记为已处理')
            this.loadData()
          }
        } catch (e) {
          this.$message.error('操作失败')
        }
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.contract-reminders {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  .header-stats {
    display: flex;
    gap: 30px;
  }
  .stat-item {
    text-align: center;
    .stat-num {
      display: block;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 4px;
      &.expiring { color: #F56C6C; }
      &.expired { color: #909399; }
      &.probation { color: #E6A23C; }
    }
    .stat-label {
      font-size: 13px;
      color: #909399;
    }
  }
  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    .filter-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  .days-danger {
    color: #F56C6C;
    font-weight: bold;
  }
  .days-warning {
    color: #E6A23C;
    font-weight: 500;
  }
  .days-normal {
    color: #67C23A;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
