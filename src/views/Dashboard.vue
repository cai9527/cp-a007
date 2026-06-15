<template>
  <div class="dashboard">
    <div class="stat-row">
      <div class="stat-card" @click="goToPage('users')">
        <i class="el-icon-user-solid stat-icon" style="color: #409EFF;"></i>
        <div class="stat-label">员工总数</div>
        <div class="stat-value primary">{{ stats?.totalEmployees || 0 }}</div>
      </div>
      <div class="stat-card" @click="goToPage('attendance')">
        <i class="el-icon-time stat-icon" style="color: #67C23A;"></i>
        <div class="stat-label">今日已打卡</div>
        <div class="stat-value success">{{ stats?.todayCheckIn || 0 }}</div>
      </div>
      <div class="stat-card" @click="goToPage('alerts')">
        <i class="el-icon-warning stat-icon" style="color: #E6A23C;"></i>
        <div class="stat-label">今日迟到</div>
        <div class="stat-value warning">{{ stats?.todayLate || 0 }}</div>
      </div>
      <div class="stat-card" @click="goToPage('alerts')">
        <i class="el-icon-close stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">今日缺勤</div>
        <div class="stat-value danger">{{ stats?.todayAbsent || 0 }}</div>
      </div>
      <div class="stat-card" @click="goToPage('leaves')">
        <i class="el-icon-document stat-icon" style="color: #909399;"></i>
        <div class="stat-label">待审批请假</div>
        <div class="stat-value info">{{ stats?.pendingLeaves || 0 }}</div>
      </div>
      <div class="stat-card" @click="goToPage('alerts')">
        <i class="el-icon-bell stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">待处理预警</div>
        <div class="stat-value danger">{{ stats?.todayAlerts || 0 }}</div>
      </div>
    </div>

    <div class="stat-row attendance-rate-row">
      <div class="stat-card rate-card">
        <div class="rate-info">
          <div class="stat-label">本月出勤率</div>
          <div class="stat-value primary" style="font-size: 42px;">{{ stats?.monthAttendanceRate || 0 }}%</div>
          <div class="rate-desc">本月应出勤 {{ stats?.thisMonthWorkDays || 0 }} 天</div>
        </div>
        <div class="rate-chart" ref="rateChart"></div>
      </div>
    </div>

    <div class="chart-row">
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>考勤趋势（近7天）</h3>
        </div>
        <div class="chart-container" ref="trendChart"></div>
      </div>
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>考勤状态分布</h3>
        </div>
        <div class="chart-container" ref="pieChart"></div>
      </div>
    </div>

    <div class="data-row">
      <div class="page-card data-card">
        <div class="chart-header">
          <h3>部门考勤排名</h3>
          <el-button type="text" size="small" @click="goToPage('reports')">查看更多 →</el-button>
        </div>
        <el-table :data="deptRankData" style="width: 100%;" size="small">
          <el-table-column prop="rank" label="排名" width="60">
            <template slot-scope="scope">
              <span :class="['rank-badge', rankClass(scope.row.rank)]">{{ scope.row.rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="departmentName" label="部门"></el-table-column>
          <el-table-column prop="attendanceRate" label="出勤率" width="100">
            <template slot-scope="scope">
              <span :style="{ color: scope.row.attendanceRate >= 95 ? '#67C23A' : scope.row.attendanceRate >= 90 ? '#E6A23C' : '#F56C6C' }">
                {{ scope.row.attendanceRate }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-card data-card">
        <div class="chart-header">
          <h3>最新预警</h3>
          <el-button type="text" size="small" @click="goToPage('alerts')">查看更多 →</el-button>
        </div>
        <el-table :data="recentAlerts" style="width: 100%;" size="small">
          <el-table-column prop="userName" label="员工" width="80"></el-table-column>
          <el-table-column prop="type" label="类型" width="100">
            <template slot-scope="scope">
              <el-tag :type="alertTypeTag(scope.row.type)" size="mini">
                {{ alertTypeMap[scope.row.type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
          <el-table-column prop="date" label="日期" width="100"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { getDashboardStats, getMonthlyReport } from '@/api/report'
import { getAlerts } from '@/api/attendance'
import { alertTypeMap, formatDate } from '@/utils'
import type { DashboardStats, AlertRecord, MonthlyReport } from '@/types'
import { currentMonth } from '@/data/mockData'

export default Vue.extend({
  name: 'Dashboard',
  data() {
    return {
      stats: null as DashboardStats | null,
      recentAlerts: [] as AlertRecord[],
      deptRankData: [] as { departmentName: string; attendanceRate: number; rank: number }[],
      alertTypeMap,
      trendChart: null as echarts.ECharts | null,
      pieChart: null as echarts.ECharts | null,
      rateChart: null as echarts.ECharts | null
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        this.stats = await getDashboardStats()
        const [alertsRes, monthlyReport] = await Promise.all([
          getAlerts({ page: 1, pageSize: 5 }),
          getMonthlyReport(currentMonth)
        ])
        this.recentAlerts = alertsRes.list
        this.deptRankData = monthlyReport.departmentRank.slice(0, 6)
        this.$nextTick(() => {
          this.initTrendChart(monthlyReport)
          this.initPieChart(monthlyReport)
          this.initRateChart()
        })
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
      }
    },
    initTrendChart(report: MonthlyReport) {
      const el = this.$refs.trendChart as HTMLElement
      if (!el) return
      this.trendChart = echarts.init(el)
      const last7Days = report.lateTrend.slice(-7)
      const dates = last7Days.map(d => dayjs(d.date).format('MM-DD'))
      const lateCounts = last7Days.map(d => d.count)
      const absentCounts = report.absentTrend.slice(-7).map(d => d.count)
      this.trendChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['迟到', '缺勤'], right: 20 },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: dates,
          boundaryGap: false
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            name: '迟到',
            type: 'line',
            smooth: true,
            data: lateCounts,
            itemStyle: { color: '#E6A23C' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
              { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
            ])}
          },
          {
            name: '缺勤',
            type: 'line',
            smooth: true,
            data: absentCounts,
            itemStyle: { color: '#F56C6C' },
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
            ])}
          }
        ]
      })
    },
    initPieChart(report: MonthlyReport) {
      const el = this.$refs.pieChart as HTMLElement
      if (!el) return
      this.pieChart = echarts.init(el)
      this.pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', right: 20, top: 'center' },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 14, fontWeight: 'bold' }
          },
          labelLine: { show: false },
          data: report.statusDistribution.map((item, idx) => ({
            ...item,
            itemStyle: {
              color: ['#67C23A', '#E6A23C', '#faad14', '#F56C6C', '#409EFF'][idx]
            }
          }))
        }]
      })
    },
    initRateChart() {
      const el = this.$refs.rateChart as HTMLElement
      if (!el || !this.stats) return
      this.rateChart = echarts.init(el)
      this.rateChart.setOption({
        series: [{
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#36cfc9' },
                  { offset: 1, color: '#409EFF' }
                ]
              }
            }
          },
          axisLine: { lineStyle: { width: 12, color: [[1, '#f0f2f5']] } },
          splitLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          data: [{ value: this.stats.monthAttendanceRate }],
          detail: { show: false }
        }]
      })
    },
    rankClass(rank: number): string {
      if (rank === 1) return 'rank-first'
      if (rank === 2) return 'rank-second'
      if (rank === 3) return 'rank-third'
      return ''
    },
    alertTypeTag(type: string): string {
      const map: Record<string, string> = {
        late: 'warning',
        early: 'warning',
        absent: 'danger',
        continuous_absent: 'danger'
      }
      return map[type] || 'info'
    },
    goToPage(path: string) {
      this.$router.push('/' + path)
    }
  },
  beforeDestroy() {
    this.trendChart?.dispose()
    this.pieChart?.dispose()
    this.rateChart?.dispose()
  }
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .attendance-rate-row {
    grid-template-columns: 1fr;

    .rate-card {
      display: flex;
      align-items: center;
      padding: 30px 40px;
    }

    .rate-info {
      flex: 1;

      .rate-desc {
        color: #909399;
        font-size: 13px;
        margin-top: 8px;
      }
    }

    .rate-chart {
      width: 180px;
      height: 180px;
    }
  }

  .chart-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
      }
    }
  }

  .data-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    .data-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
      }
    }
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
}
</style>
