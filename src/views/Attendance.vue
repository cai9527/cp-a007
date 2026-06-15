<template>
  <div class="attendance-page">
    <div class="checkin-section">
      <div class="checkin-card">
        <div class="checkin-header">
          <div class="date-info">
            <div class="date">{{ todayDate }}</div>
            <div class="weekday">{{ todayWeekday }}</div>
          </div>
          <div class="current-time">{{ currentTime }}</div>
        </div>
        <div class="checkin-status">
          <div class="status-item">
            <div class="status-label">上班打卡</div>
            <div class="status-time" :class="{ active: todayRecord?.checkInTime }">
              {{ todayRecord?.checkInTime ? formatTime(todayRecord.checkInTime) : '--:--:--' }}
            </div>
            <el-tag v-if="todayRecord?.checkInTime" :type="todayRecord.status === 'late' ? 'warning' : 'success'" size="mini">
              {{ todayRecord.status === 'late' ? '迟到' : '正常' }}
            </el-tag>
            <span v-else class="status-tip">未打卡</span>
          </div>
          <div class="status-divider">
            <i class="el-icon-right"></i>
          </div>
          <div class="status-item">
            <div class="status-label">下班打卡</div>
            <div class="status-time" :class="{ active: todayRecord?.checkOutTime }">
              {{ todayRecord?.checkOutTime ? formatTime(todayRecord.checkOutTime) : '--:--:--' }}
            </div>
            <el-tag v-if="todayRecord?.checkOutTime" :type="earlyLeave ? 'warning' : 'success'" size="mini">
              {{ earlyLeave ? '早退' : '正常' }}
            </el-tag>
            <span v-else class="status-tip">未打卡</span>
          </div>
        </div>
        <div class="checkin-actions">
          <el-button
            type="primary"
            size="large"
            icon="el-icon-location"
            :loading="checkingIn"
            :disabled="!!todayRecord?.checkInTime"
            class="checkin-btn checkin-in"
            @click="handleCheckIn"
          >
            {{ todayRecord?.checkInTime ? '已上班打卡' : '上班打卡' }}
          </el-button>
          <el-button
            type="success"
            size="large"
            icon="el-icon-location-outline"
            :loading="checkingOut"
            :disabled="!todayRecord?.checkInTime || !!todayRecord?.checkOutTime"
            class="checkin-btn checkin-out"
            @click="handleCheckOut"
          >
            {{ todayRecord?.checkOutTime ? '已下班打卡' : '下班打卡' }}
          </el-button>
        </div>
        <div class="work-hours" v-if="todayRecord?.checkInTime">
          <i class="el-icon-time"></i>
          今日工作时长：<span class="hours">{{ todayRecord.workHours.toFixed(1) }}</span> 小时
        </div>
      </div>
      <div class="rule-card">
        <h3>考勤规则</h3>
        <div class="rule-item">
          <span class="rule-label">上班时间</span>
          <span class="rule-value">{{ rule?.workStartTime || '09:00' }}</span>
        </div>
        <div class="rule-item">
          <span class="rule-label">下班时间</span>
          <span class="rule-value">{{ rule?.workEndTime || '18:00' }}</span>
        </div>
        <div class="rule-item">
          <span class="rule-label">迟到阈值</span>
          <span class="rule-value">{{ rule?.lateThreshold || 15 }} 分钟</span>
        </div>
        <div class="rule-item">
          <span class="rule-label">早退阈值</span>
          <span class="rule-value">{{ rule?.earlyThreshold || 15 }} 分钟</span>
        </div>
        <div class="rule-item">
          <span class="rule-label">工作日</span>
          <span class="rule-value">周一至周五</span>
        </div>
      </div>
    </div>

    <div class="page-card">
      <div class="page-header">
        <h2>考勤记录</h2>
      </div>

      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px;"
        />
        <el-select v-model="filters.departmentId" placeholder="选择部门" clearable style="width: 140px;" v-if="isManager">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-select v-model="filters.status" placeholder="考勤状态" clearable style="width: 120px;">
          <el-option v-for="(label, key) in statusMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="员工" min-width="150" v-if="!isEmployee">
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
        <el-table-column prop="date" label="日期" width="110" />
        <el-table-column prop="checkInTime" label="上班打卡" width="160">
          <template slot-scope="scope">
            <span :class="{ 'text-warning': scope.row.status === 'late' }">
              {{ scope.row.checkInTime ? formatTime(scope.row.checkInTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="checkOutTime" label="下班打卡" width="160">
          <template slot-scope="scope">
            <span :class="{ 'text-warning': scope.row.status === 'early' }">
              {{ scope.row.checkOutTime ? formatTime(scope.row.checkOutTime) : '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <span :class="['status-tag', 'status-' + scope.row.status]">
              {{ statusMap[scope.row.status] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="工作时长" width="100">
          <template slot-scope="scope">{{ scope.row.workHours ? scope.row.workHours + 'h' : '-' }}</template>
        </el-table-column>
        <el-table-column label="迟到/早退" width="120">
          <template slot-scope="scope">
            <span v-if="scope.row.lateMinutes > 0" class="text-warning">迟到{{ scope.row.lateMinutes }}分钟</span>
            <span v-else-if="scope.row.earlyMinutes > 0" class="text-warning">早退{{ scope.row.earlyMinutes }}分钟</span>
            <span v-else class="text-success">-</span>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import type { Attendance, AttendanceRule, Department } from '@/types'
import {
  getAttendanceList,
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceRule
} from '@/api/attendance'
import { getDepartments } from '@/api/user'
import { statusMap, formatTime, getInitials } from '@/utils'

export default Vue.extend({
  name: 'Attendance',
  data() {
    return {
      currentTime: '',
      todayDate: '',
      todayWeekday: '',
      todayRecord: null as Attendance | null,
      rule: null as AttendanceRule | null,
      departments: [] as Department[],
      checkingIn: false,
      checkingOut: false,
      loading: false,
      tableData: [] as Attendance[],
      dateRange: [] as string[],
      filters: {
        departmentId: null as number | null,
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      statusMap,
      timer: null as number | null
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isEmployee', 'isManager', 'isAdmin']),
    earlyLeave(): boolean {
      if (!this.todayRecord?.checkOutTime || !this.rule) return false
      const checkOut = dayjs(this.todayRecord.checkOutTime)
      const workEnd = dayjs(this.todayRecord.date + ' ' + this.rule.workEndTime)
      return checkOut.isBefore(workEnd.subtract(this.rule.earlyThreshold, 'minute'))
    }
  },
  mounted() {
    this.updateTime()
    this.timer = window.setInterval(() => this.updateTime(), 1000)
    this.loadTodayRecord()
    this.loadRule()
    this.loadDepartments()
    this.initDateRange()
    this.loadData()
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    formatTime,
    getInitials,
    updateTime() {
      const now = dayjs()
      this.currentTime = now.format('HH:mm:ss')
      this.todayDate = now.format('YYYY年MM月DD日')
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      this.todayWeekday = weekdays[now.day()]
    },
    initDateRange() {
      const end = dayjs()
      const start = end.subtract(30, 'day')
      this.dateRange = [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')]
    },
    async loadTodayRecord() {
      if (!this.user?.id) return
      try {
        this.todayRecord = await getTodayAttendance(this.user.id)
      } catch (e) {
        // ignore
      }
    },
    async loadRule() {
      try {
        this.rule = await getAttendanceRule()
      } catch (e) {
        // ignore
      }
    },
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
      } catch (e) {
        // ignore
      }
    },
    async handleCheckIn() {
      if (!this.user?.id) return
      this.checkingIn = true
      try {
        const record = await checkIn(this.user.id)
        if (record) {
          this.todayRecord = record
          if (record.status === 'late') {
            this.$message.warning('打卡成功，但您已迟到')
          } else {
            this.$message.success('上班打卡成功')
          }
          this.loadData()
        }
      } catch (e: any) {
        this.$message.error(e.message || '打卡失败')
      } finally {
        this.checkingIn = false
      }
    },
    async handleCheckOut() {
      if (!this.user?.id) return
      this.checkingOut = true
      try {
        const record = await checkOut(this.user.id)
        if (record) {
          this.todayRecord = record
          if (this.earlyLeave) {
            this.$message.warning('打卡成功，但您已早退')
          } else {
            this.$message.success('下班打卡成功')
          }
          this.loadData()
        }
      } catch (e: any) {
        this.$message.error(e.message || '打卡失败')
      } finally {
        this.checkingOut = false
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params: any = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          status: this.filters.status || undefined
        }
        if (this.isEmployee && this.user) {
          params.userId = this.user.id
        } else if (this.filters.departmentId) {
          params.departmentId = this.filters.departmentId
        }
        if (this.dateRange?.length === 2) {
          params.startDate = this.dateRange[0]
          params.endDate = this.dateRange[1]
        }
        const res = await getAttendanceList(params)
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
        departmentId: null,
        status: ''
      }
      this.initDateRange()
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
    }
  }
})
</script>

<style lang="scss" scoped>
.attendance-page {
  .checkin-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .checkin-card {
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;

    .checkin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;

      .date-info {
        .date {
          font-size: 20px;
          font-weight: 600;
        }
        .weekday {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 4px;
        }
      }

      .current-time {
        font-size: 36px;
        font-weight: 600;
        font-family: 'Courier New', monospace;
      }
    }

    .checkin-status {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      margin-bottom: 30px;

      .status-item {
        text-align: center;

        .status-label {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 8px;
        }

        .status-time {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;

          &.active {
            color: #fff;
          }

          &:not(.active) {
            opacity: 0.6;
          }
        }

        .status-tip {
          font-size: 12px;
          opacity: 0.7;
        }
      }

      .status-divider {
        font-size: 24px;
        opacity: 0.5;
      }
    }

    .checkin-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;

      .checkin-btn {
        min-width: 160px;
        height: 48px;
        font-size: 16px;

        &.checkin-in {
          background: #52c41a;
          border-color: #52c41a;

          &:hover {
            background: #73d13d;
            border-color: #73d13d;
          }
        }

        &.checkin-out {
          background: #1890ff;
          border-color: #1890ff;

          &:hover {
            background: #40a9ff;
            border-color: #40a9ff;
          }
        }
      }
    }

    .work-hours {
      text-align: center;
      font-size: 14px;
      opacity: 0.9;

      .hours {
        font-size: 18px;
        font-weight: 600;
        margin: 0 4px;
      }
    }
  }

  .rule-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
    }

    .rule-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;

      .rule-label {
        color: #909399;
      }

      .rule-value {
        font-weight: 500;
        color: #303133;
      }
    }
  }

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

  .text-warning {
    color: #E6A23C;
  }

  .text-success {
    color: #67C23A;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
