<template>
  <div class="report-center">
    <div class="report-tabs">
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="月度分析" name="monthly" />
        <el-tab-pane label="部门汇总" name="department" />
        <el-tab-pane label="个人统计" name="personal" />
      </el-tabs>
    </div>

    <div v-show="activeTab === 'monthly'" class="monthly-report">
      <div class="filter-bar">
        <el-date-picker
          v-model="monthPicker"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 180px;"
          @change="loadMonthlyReport"
        />
        <el-button type="primary" icon="el-icon-download" @click="exportMonthly">导出报表</el-button>
      </div>

      <div class="stat-row" v-if="monthlyReport">
        <div class="stat-card">
          <i class="el-icon-user stat-icon" style="color: #409EFF;"></i>
          <div class="stat-label">员工总数</div>
          <div class="stat-value primary">{{ monthlyReport.totalEmployees }}</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-circle-check stat-icon" style="color: #67C23A;"></i>
          <div class="stat-label">平均出勤率</div>
          <div class="stat-value success">{{ monthlyReport.avgAttendanceRate }}%</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-warning stat-icon" style="color: #E6A23C;"></i>
          <div class="stat-label">总迟到人次</div>
          <div class="stat-value warning">{{ lateTotal }}</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-close stat-icon" style="color: #F56C6C;"></i>
          <div class="stat-label">总缺勤人次</div>
          <div class="stat-value danger">{{ absentTotal }}</div>
        </div>
      </div>

      <div class="chart-row">
        <div class="page-card chart-card">
          <h3 class="chart-title">迟到趋势</h3>
          <div class="chart-container" ref="lateTrendChart"></div>
        </div>
        <div class="page-card chart-card">
          <h3 class="chart-title">缺勤趋势</h3>
          <div class="chart-container" ref="absentTrendChart"></div>
        </div>
      </div>

      <div class="chart-row">
        <div class="page-card chart-card">
          <h3 class="chart-title">考勤状态分布</h3>
          <div class="chart-container" ref="statusPieChart"></div>
        </div>
        <div class="page-card chart-card">
          <h3 class="chart-title">部门出勤率排名</h3>
          <div class="chart-container" ref="deptRankChart"></div>
        </div>
      </div>

      <div class="page-card">
        <h3 class="chart-title">部门明细</h3>
        <el-table :data="monthlyReport?.departmentRank || []" border stripe style="width: 100%;">
          <el-table-column prop="rank" label="排名" width="80">
            <template slot-scope="scope">
              <span :class="['rank-badge', rankClass(scope.row.rank)]">{{ scope.row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="部门" />
          <el-table-column prop="attendanceRate" label="出勤率" width="120">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.attendanceRate >= 95 ? '#67C23A' : scope.row.attendanceRate >= 90 ? '#E6A23C' : '#F56C6C' }">
                {{ scope.row.attendanceRate }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-show="activeTab === 'department'" class="department-report">
      <div class="filter-bar">
        <el-select v-model="selectedDept" placeholder="选择部门" style="width: 200px;" @change="loadDeptReport">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-date-picker
          v-model="deptMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 180px;"
          @change="loadDeptReport"
        />
        <el-button type="primary" icon="el-icon-download" @click="exportDeptReport">导出报表</el-button>
      </div>

      <div class="stat-row" v-if="deptReport">
        <div class="stat-card">
          <i class="el-icon-user stat-icon" style="color: #409EFF;"></i>
          <div class="stat-label">部门人数</div>
          <div class="stat-value primary">{{ deptReport.totalEmployees }}</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-circle-check stat-icon" style="color: #67C23A;"></i>
          <div class="stat-label">平均出勤率</div>
          <div class="stat-value success">{{ deptReport.avgAttendanceRate }}%</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-warning stat-icon" style="color: #E6A23C;"></i>
          <div class="stat-label">迟到总次数</div>
          <div class="stat-value warning">{{ deptReport.totalLateCount }}</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-close stat-icon" style="color: #F56C6C;"></i>
          <div class="stat-label">缺勤总次数</div>
          <div class="stat-value danger">{{ deptReport.totalAbsentCount }}</div>
        </div>
        <div class="stat-card">
          <i class="el-icon-document stat-icon" style="color: #909399;"></i>
          <div class="stat-label">请假总天数</div>
          <div class="stat-value info">{{ deptReport.totalLeaveDays }}</div>
        </div>
      </div>

      <div class="page-card">
        <h3 class="chart-title">员工明细</h3>
        <el-table :data="deptReport?.employeeReports || []" border stripe style="width: 100%;" v-loading="deptLoading">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="userName" label="姓名" width="100" />
          <el-table-column prop="attendanceRate" label="出勤率" width="100">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.attendanceRate >= 95 ? '#67C23A' : scope.row.attendanceRate >= 90 ? '#E6A23C' : '#F56C6C' }">
                {{ scope.row.attendanceRate }}%
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="workDays" label="应出勤" width="80" />
          <el-table-column prop="actualDays" label="实出勤" width="80" />
          <el-table-column prop="normalDays" label="正常" width="70" />
          <el-table-column prop="lateDays" label="迟到" width="70">
            <template slot-scope="scope">
              <span v-if="scope.row.lateDays > 0" class="text-warning">{{ scope.row.lateDays }}</span>
              <span v-else>{{ scope.row.lateDays }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="earlyDays" label="早退" width="70">
            <template slot-scope="scope">
              <span v-if="scope.row.earlyDays > 0" class="text-warning">{{ scope.row.earlyDays }}</span>
              <span v-else>{{ scope.row.earlyDays }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="absentDays" label="缺勤" width="70">
            <template slot-scope="scope">
              <span v-if="scope.row.absentDays > 0" class="text-danger">{{ scope.row.absentDays }}</span>
              <span v-else>{{ scope.row.absentDays }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="leaveDays" label="请假" width="70" />
          <el-table-column prop="totalWorkHours" label="总工时(h)" width="100" />
          <el-table-column prop="avgWorkHours" label="日均工时(h)" width="100" />
        </el-table>
      </div>
    </div>

    <div v-show="activeTab === 'personal'" class="personal-report">
      <div class="filter-bar">
        <el-select v-model="selectedUserId" placeholder="选择员工" filterable style="width: 200px;" @change="loadPersonalReport" v-if="!isEmployee">
          <el-option v-for="user in userList" :key="user.id" :label="user.name" :value="user.id" />
        </el-select>
        <el-date-picker
          v-model="personalMonth"
          type="month"
          placeholder="选择月份"
          value-format="YYYY-MM"
          style="width: 180px;"
          @change="loadPersonalReport"
        />
        <el-button type="primary" icon="el-icon-download" @click="exportPersonal">导出报表</el-button>
      </div>

      <div class="stat-row" v-if="personalReport">
        <div class="stat-card">
          <div class="stat-label">姓名</div>
          <div class="stat-value primary" style="font-size: 22px;">{{ personalReport.userName }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">部门</div>
          <div class="stat-value" style="font-size: 22px;">{{ personalReport.departmentName }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">出勤率</div>
          <div class="stat-value success">{{ personalReport.attendanceRate }}%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">实际出勤</div>
          <div class="stat-value">{{ personalReport.actualDays }} / {{ personalReport.workDays }} 天</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">总工时</div>
          <div class="stat-value info">{{ personalReport.totalWorkHours }} 小时</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">日均工时</div>
          <div class="stat-value warning">{{ personalReport.avgWorkHours }} 小时</div>
        </div>
      </div>

      <div class="chart-row" v-if="personalReport">
        <div class="page-card chart-card">
          <h3 class="chart-title">考勤状态统计</h3>
          <div class="chart-container" ref="personalPieChart"></div>
        </div>
        <div class="page-card chart-card">
          <h3 class="chart-title">迟到/早退明细</h3>
          <div class="detail-list">
            <div class="detail-item">
              <span class="detail-label">迟到天数</span>
              <span class="detail-value warning">{{ personalReport.lateDays }} 天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">迟到总时长</span>
              <span class="detail-value warning">{{ personalReport.lateMinutes }} 分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">早退天数</span>
              <span class="detail-value warning">{{ personalReport.earlyDays }} 天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">早退总时长</span>
              <span class="detail-value warning">{{ personalReport.earlyMinutes }} 分钟</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">缺勤天数</span>
              <span class="detail-value danger">{{ personalReport.absentDays }} 天</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">请假天数</span>
              <span class="detail-value primary">{{ personalReport.leaveDays }} 天</span>
            </div>
          </div>
        </div>
      </div>

      <div class="page-card">
        <h3 class="chart-title">每日明细</h3>
        <el-table :data="personalReport?.dailyRecords || []" border stripe style="width: 100%;" v-loading="personalLoading">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <span :class="['status-tag', 'status-' + scope.row.status]">
                {{ statusMap[scope.row.status] }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="checkInTime" label="上班打卡" width="160">
            <template slot-scope="scope">{{ scope.row.checkInTime ? formatTime(scope.row.checkInTime) : '-' }}</template>
          </el-table-column>
          <el-table-column prop="checkOutTime" label="下班打卡" width="160">
            <template slot-scope="scope">{{ scope.row.checkOutTime ? formatTime(scope.row.checkOutTime) : '-' }}</template>
          </el-table-column>
          <el-table-column prop="workHours" label="工作时长" width="100">
            <template slot-scope="scope">{{ scope.row.workHours ? scope.row.workHours + 'h' : '-' }}</template>
          </el-table-column>
          <el-table-column label="迟到/早退" width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.lateMinutes > 0" class="text-warning">迟{{ scope.row.lateMinutes }}分</span>
              <span v-else-if="scope.row.earlyMinutes > 0" class="text-warning">早{{ scope.row.earlyMinutes }}分</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as echarts from 'echarts'
import { mapState, mapGetters } from 'vuex'
import dayjs from 'dayjs'
import type { MonthlyReport, DepartmentReport, PersonalReport, Department, User } from '@/types'
import { getMonthlyReport, getDepartmentReport, getPersonalReport, exportCSV } from '@/api/report'
import { getDepartments, getUsers } from '@/api/user'
import { currentMonth } from '@/data/mockData'
import { statusMap, formatTime } from '@/utils'

export default Vue.extend({
  name: 'ReportCenter',
  data() {
    return {
      activeTab: 'monthly',
      monthPicker: currentMonth,
      monthlyReport: null as MonthlyReport | null,
      departments: [] as Department[],
      userList: [] as User[],
      selectedDept: null as number | null,
      deptMonth: currentMonth,
      deptReport: null as DepartmentReport | null,
      deptLoading: false,
      selectedUserId: null as number | null,
      personalMonth: currentMonth,
      personalReport: null as PersonalReport | null,
      personalLoading: false,
      statusMap,
      lateTrendChart: null as echarts.ECharts | null,
      absentTrendChart: null as echarts.ECharts | null,
      statusPieChart: null as echarts.ECharts | null,
      deptRankChart: null as echarts.ECharts | null,
      personalPieChart: null as echarts.ECharts | null
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isEmployee', 'isManager']),
    lateTotal(): number {
      return this.monthlyReport?.lateTrend.reduce((sum, d) => sum + d.count, 0) || 0
    },
    absentTotal(): number {
      return this.monthlyReport?.absentTrend.reduce((sum, d) => sum + d.count, 0) || 0
    }
  },
  mounted() {
    this.loadDepartments()
    this.loadMonthlyReport()
    this.loadUserList()
    if (this.isEmployee && this.user) {
      this.selectedUserId = this.user.id
      this.loadPersonalReport()
    }
  },
  methods: {
    formatTime,
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
        if (this.departments.length > 0) {
          this.selectedDept = this.departments[1]?.id || this.departments[0].id
        }
      } catch (e) {
        // ignore
      }
    },
    async loadUserList() {
      try {
        const res = await getUsers({ page: 1, pageSize: 100, status: 'active' })
        this.userList = res.list
      } catch (e) {
        // ignore
      }
    },
    handleTabClick() {
      this.$nextTick(() => {
        if (this.activeTab === 'monthly' && this.monthlyReport) {
          this.initMonthlyCharts()
        } else if (this.activeTab === 'personal' && this.personalReport) {
          this.initPersonalChart()
        }
      })
    },
    async loadMonthlyReport() {
      try {
        this.monthlyReport = await getMonthlyReport(this.monthPicker)
        this.$nextTick(() => {
          this.initMonthlyCharts()
        })
      } catch (e: any) {
        this.$message.error(e.message || '加载月度报表失败')
      }
    },
    initMonthlyCharts() {
      if (!this.monthlyReport) return

      const lateEl = this.$refs.lateTrendChart as HTMLElement
      if (lateEl) {
        if (this.lateTrendChart) this.lateTrendChart.dispose()
        this.lateTrendChart = echarts.init(lateEl)
        const dates = this.monthlyReport.lateTrend.filter((_, i) => i % 3 === 0).map(d => dayjs(d.date).format('MM-DD'))
        const counts = this.monthlyReport.lateTrend.filter((_, i) => i % 3 === 0).map(d => d.count)
        this.lateTrendChart.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'category', data: dates },
          yAxis: { type: 'value', minInterval: 1 },
          series: [{
            type: 'line',
            smooth: true,
            data: counts,
            itemStyle: { color: '#E6A23C' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
              { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
            ])}
          }]
        })
      }

      const absentEl = this.$refs.absentTrendChart as HTMLElement
      if (absentEl) {
        if (this.absentTrendChart) this.absentTrendChart.dispose()
        this.absentTrendChart = echarts.init(absentEl)
        const dates = this.monthlyReport.absentTrend.filter((_, i) => i % 3 === 0).map(d => dayjs(d.date).format('MM-DD'))
        const counts = this.monthlyReport.absentTrend.filter((_, i) => i % 3 === 0).map(d => d.count)
        this.absentTrendChart.setOption({
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: { type: 'category', data: dates },
          yAxis: { type: 'value', minInterval: 1 },
          series: [{
            type: 'line',
            smooth: true,
            data: counts,
            itemStyle: { color: '#F56C6C' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
            ])}
          }]
        })
      }

      const pieEl = this.$refs.statusPieChart as HTMLElement
      if (pieEl) {
        if (this.statusPieChart) this.statusPieChart.dispose()
        this.statusPieChart = echarts.init(pieEl)
        this.statusPieChart.setOption({
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: { orient: 'vertical', right: 20, top: 'center' },
          series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: this.monthlyReport.statusDistribution.map((item, idx) => ({
              ...item,
              itemStyle: {
                color: ['#67C23A', '#E6A23C', '#faad14', '#F56C6C', '#409EFF'][idx]
              }
            }))
          }]
        })
      }

      const rankEl = this.$refs.deptRankChart as HTMLElement
      if (rankEl) {
        if (this.deptRankChart) this.deptRankChart.dispose()
        this.deptRankChart = echarts.init(rankEl)
        const data = [...this.monthlyReport.departmentRank].reverse()
        this.deptRankChart.setOption({
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { left: '3%', right: '10%', bottom: '3%', containLabel: true },
          xAxis: { type: 'value', max: 100 },
          yAxis: { type: 'category', data: data.map(d => d.departmentName) },
          series: [{
            type: 'bar',
            data: data.map(d => ({
              value: d.attendanceRate,
              itemStyle: {
                color: d.attendanceRate >= 95 ? '#67C23A' : d.attendanceRate >= 90 ? '#E6A23C' : '#F56C6C'
              }
            })),
            label: {
              show: true,
              position: 'right',
              formatter: '{c}%'
            }
          }]
        })
      }
    },
    async loadDeptReport() {
      if (!this.selectedDept) return
      this.deptLoading = true
      try {
        this.deptReport = await getDepartmentReport(this.selectedDept, this.deptMonth)
      } catch (e: any) {
        this.$message.error(e.message || '加载部门报表失败')
      } finally {
        this.deptLoading = false
      }
    },
    async loadPersonalReport() {
      if (!this.selectedUserId) return
      this.personalLoading = true
      try {
        this.personalReport = await getPersonalReport(this.selectedUserId, this.personalMonth)
        this.$nextTick(() => {
          this.initPersonalChart()
        })
      } catch (e: any) {
        this.$message.error(e.message || '加载个人报表失败')
      } finally {
        this.personalLoading = false
      }
    },
    initPersonalChart() {
      if (!this.personalReport) return
      const el = this.$refs.personalPieChart as HTMLElement
      if (!el) return
      if (this.personalPieChart) this.personalPieChart.dispose()
      this.personalPieChart = echarts.init(el)
      const data = [
        { name: '正常', value: this.personalReport.normalDays, color: '#67C23A' },
        { name: '迟到', value: this.personalReport.lateDays, color: '#E6A23C' },
        { name: '早退', value: this.personalReport.earlyDays, color: '#faad14' },
        { name: '缺勤', value: this.personalReport.absentDays, color: '#F56C6C' },
        { name: '请假', value: this.personalReport.leaveDays, color: '#409EFF' }
      ].filter(d => d.value > 0)
      this.personalPieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}天 ({d}%)' },
        legend: { orient: 'vertical', right: 20, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: data.map(d => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          }))
        }]
      })
    },
    rankClass(rank: number): string {
      if (rank === 1) return 'rank-first'
      if (rank === 2) return 'rank-second'
      if (rank === 3) return 'rank-third'
      return ''
    },
    exportMonthly() {
      if (!this.monthlyReport) return
      const data = this.monthlyReport.departmentRank.map(d => ({
        排名: d.rank,
        部门: d.departmentName,
        出勤率: d.attendanceRate + '%'
      }))
      exportCSV(data, `月度考勤报表_${this.monthPicker}`)
      this.$message.success('导出成功')
    },
    exportDeptReport() {
      if (!this.deptReport) return
      const data = this.deptReport.employeeReports.map(r => ({
        姓名: r.userName,
        出勤率: r.attendanceRate + '%',
        应出勤: r.workDays,
        实出勤: r.actualDays,
        正常: r.normalDays,
        迟到: r.lateDays,
        早退: r.earlyDays,
        缺勤: r.absentDays,
        请假: r.leaveDays,
        总工时: r.totalWorkHours
      }))
      exportCSV(data, `部门考勤报表_${this.deptReport.departmentName}_${this.deptMonth}`)
      this.$message.success('导出成功')
    },
    exportPersonal() {
      if (!this.personalReport) return
      const data = this.personalReport.dailyRecords.map(r => ({
        日期: r.date,
        状态: statusMap[r.status],
        上班打卡: r.checkInTime || '',
        下班打卡: r.checkOutTime || '',
        工作时长: r.workHours ? r.workHours + 'h' : '',
        迟到分钟: r.lateMinutes,
        早退分钟: r.earlyMinutes
      }))
      exportCSV(data, `个人考勤报表_${this.personalReport.userName}_${this.personalMonth}`)
      this.$message.success('导出成功')
    }
  },
  beforeDestroy() {
    this.lateTrendChart?.dispose()
    this.absentTrendChart?.dispose()
    this.statusPieChart?.dispose()
    this.deptRankChart?.dispose()
    this.personalPieChart?.dispose()
  }
})
</script>

<style lang="scss" scoped>
.report-center {
  .report-tabs {
    margin-bottom: 16px;

    ::v-deep .el-tabs__item {
      height: 40px;
      line-height: 40px;
      font-size: 14px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    align-items: center;
  }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .chart-card {
      .chart-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
      }
    }
  }

  .chart-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }

  .text-warning {
    color: #E6A23C;
  }

  .text-danger {
    color: #F56C6C;
  }

  .rank-badge {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: #f4f4f5;
    font-size: 12px;
    font-weight: 600;
    color: #606266;

    &.rank-first {
      background: linear-gradient(135deg, #ffd700, #ffb700);
      color: #fff;
    }

    &.rank-second {
      background: linear-gradient(135deg, #c0c4cc, #909399);
      color: #fff;
    }

    &.rank-third {
      background: linear-gradient(135deg, #d4a76a, #b8860b);
      color: #fff;
    }
  }

  .detail-list {
    padding: 10px 0;

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 20px;
      border-bottom: 1px solid #f4f4f5;

      &:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: #909399;
      }

      .detail-value {
        font-weight: 500;

        &.warning { color: #E6A23C; }
        &.danger { color: #F56C6C; }
        &.primary { color: #409EFF; }
      }
    }
  }
}
</style>
