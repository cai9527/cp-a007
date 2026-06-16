<template>
  <div class="salary-statistics">
    <div class="page-header">
      <h2>工资统计分析</h2>
      <div class="filter-bar" style="margin-bottom: 0;">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          format="YYYY-MM"
          value-format="YYYY-MM"
          placeholder="选择月份"
          @change="handleMonthChange"
          style="width: 200px;"
        />
      </div>
    </div>

    <div class="stat-row">
      <div class="stat-card">
        <i class="el-icon-user-solid stat-icon" style="color: #409EFF;"></i>
        <div class="stat-label">员工总数</div>
        <div class="stat-value primary">{{ stats?.totalEmployees || 0 }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-circle-check stat-icon" style="color: #67C23A;"></i>
        <div class="stat-label">已发薪人数</div>
        <div class="stat-value success">{{ stats?.paidEmployees || 0 }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-money stat-icon" style="color: #E6A23C;"></i>
        <div class="stat-label">总基本工资</div>
        <div class="stat-value warning">¥{{ formatMoney(stats?.totalBaseSalary || 0) }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-trophy stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">总绩效工资</div>
        <div class="stat-value danger">¥{{ formatMoney(stats?.totalPerformanceSalary || 0) }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-wallet stat-icon" style="color: #909399;"></i>
        <div class="stat-label">总实发工资</div>
        <div class="stat-value info">¥{{ formatMoney(stats?.totalNetSalary || 0) }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-data-line stat-icon" style="color: #409EFF;"></i>
        <div class="stat-label">平均工资</div>
        <div class="stat-value primary">¥{{ formatMoney(stats?.avgNetSalary || 0) }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-top stat-icon" style="color: #67C23A;"></i>
        <div class="stat-label">最高工资</div>
        <div class="stat-value success">¥{{ formatMoney(stats?.maxNetSalary || 0) }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-bottom stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">最低工资</div>
        <div class="stat-value danger">¥{{ formatMoney(stats?.minNetSalary || 0) }}</div>
      </div>
    </div>

    <div class="chart-row">
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>月度工资趋势（近6个月）</h3>
        </div>
        <div class="chart-container" ref="trendChart"></div>
      </div>
    </div>

    <div class="chart-row">
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>部门工资对比</h3>
        </div>
        <div class="chart-container" ref="deptChart"></div>
      </div>
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>工资分布</h3>
        </div>
        <div class="chart-container" ref="distributionChart"></div>
      </div>
    </div>

    <div class="chart-row">
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>薪资构成</h3>
        </div>
        <div class="chart-container" ref="compositionChart"></div>
      </div>
      <div class="page-card chart-card">
        <div class="chart-header">
          <h3>部门工资统计</h3>
        </div>
        <el-table :data="stats?.departmentSalaryStats || []" style="width: 100%;" size="small">
          <el-table-column prop="departmentName" label="部门名称"></el-table-column>
          <el-table-column prop="employeeCount" label="员工数" width="80" align="center"></el-table-column>
          <el-table-column prop="totalNetSalary" label="总实发(元)" width="140">
            <template slot-scope="scope">
              <span style="color: #67C23A;">{{ formatMoney(scope.row.totalNetSalary) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgNetSalary" label="平均工资(元)" width="140">
            <template slot-scope="scope">
              <span style="color: #409EFF;">{{ formatMoney(scope.row.avgNetSalary) }}</span>
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
import { getSalaryStats } from '@/api/salary'
import { currentMonth } from '@/data/mockData'
import type { SalaryStatistics } from '@/types'
import { mapGetters } from 'vuex'

const chartColors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399', '#9c27b0', '#00bcd4', '#ff9800']

export default Vue.extend({
  name: 'SalaryStatistics',
  data() {
    return {
      selectedMonth: currentMonth,
      stats: null as SalaryStatistics | null,
      trendChart: null as echarts.ECharts | null,
      deptChart: null as echarts.ECharts | null,
      distributionChart: null as echarts.ECharts | null,
      compositionChart: null as echarts.ECharts | null
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin'])
  },
  created() {
    if (!this.$store.getters.isSalaryAdmin) {
      this.$message.error('您没有权限访问工资统计分析页面')
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
    this.loadData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    this.trendChart?.dispose()
    this.deptChart?.dispose()
    this.distributionChart?.dispose()
    this.compositionChart?.dispose()
  },
  methods: {
    async loadData() {
      try {
        this.stats = await getSalaryStats(this.selectedMonth)
        this.$nextTick(() => {
          this.initCharts()
        })
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
      }
    },
    handleMonthChange() {
      this.loadData()
    },
    handleResize() {
      this.trendChart?.resize()
      this.deptChart?.resize()
      this.distributionChart?.resize()
      this.compositionChart?.resize()
    },
    formatMoney(value: number): string {
      return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    initCharts() {
      this.initTrendChart()
      this.initDeptChart()
      this.initDistributionChart()
      this.initCompositionChart()
    },
    initTrendChart() {
      const el = this.$refs.trendChart as HTMLElement
      if (!el || !this.stats) return
      if (this.trendChart) {
        this.trendChart.dispose()
      }
      this.trendChart = echarts.init(el)

      const months = this.stats.monthlyTrend.map(t => t.month)
      const totalNetSalaries = this.stats.monthlyTrend.map(t => t.totalNetSalary)
      const avgNetSalaries = this.stats.monthlyTrend.map(t => t.avgNetSalary)

      this.trendChart.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
          let result = params[0].axisValue + '<br/>'
          params.forEach((item: any) => {
            result += `${item.marker} ${item.seriesName}: ¥${this.formatMoney(item.value)}<br/>`
          })
          return result
        }
      },
        legend: {
        data: ['总实发工资', '平均工资'],
        right: 20
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false
      },
      yAxis: [
        {
          type: 'value',
          name: '总实发工资',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(0) + '万'
              }
              return value
            }
          }
        },
        {
          type: 'value',
          name: '平均工资',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(0) + '万'
              }
              return value
            }
          }
        }
      ],
      series: [
        {
          name: '总实发工资',
          type: 'line',
          smooth: true,
          data: totalNetSalaries,
          itemStyle: { color: '#409EFF' },
          yAxisIndex: 0,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        },
        {
          name: '平均工资',
          type: 'line',
          smooth: true,
          data: avgNetSalaries,
          itemStyle: { color: '#67C23A' },
          yAxisIndex: 1,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ])
          }
        }
      ]
    })
    },
    initDeptChart() {
      const el = this.$refs.deptChart as HTMLElement
      if (!el || !this.stats) return
      if (this.deptChart) {
        this.deptChart.dispose()
      }
      this.deptChart = echarts.init(el)

      const deptNames = this.stats.departmentSalaryStats.map(d => d.departmentName)
      const avgSalaries = this.stats.departmentSalaryStats.map(d => d.avgNetSalary)
      const totalSalaries = this.stats.departmentSalaryStats.map(d => d.totalNetSalary)

      this.deptChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            let result = params[0].axisValue + '<br/>'
            params.forEach((item: any) => {
              result += `${item.marker} ${item.seriesName}: ¥${this.formatMoney(item.value)}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['平均工资', '总实发'],
          right: 20
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: deptNames,
          axisLabel: {
            interval: 0,
            rotate: 0
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              if (value >= 10000) {
                return (value / 10000).toFixed(0) + '万'
              }
              return value
            }
          }
        },
        series: [
          {
            name: '平均工资',
            type: 'bar',
            data: avgSalaries,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#409EFF' },
                { offset: 1, color: '#36cfc9' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '35%'
          },
          {
            name: '总实发',
            type: 'bar',
            data: totalSalaries,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#67C23A' },
                { offset: 1, color: '#95de64' }
              ]),
              borderRadius: [4, 4, 0, 0]
            },
            barWidth: '35%'
          }
        ]
      })
    },
    initDistributionChart() {
      const el = this.$refs.distributionChart as HTMLElement
      if (!el || !this.stats) return
      if (this.distributionChart) {
        this.distributionChart.dispose()
      }
      this.distributionChart = echarts.init(el)

      const data = this.stats.salaryDistribution.map((item, idx) => ({
        name: item.range,
        value: item.count,
        itemStyle: { color: chartColors[idx % chartColors.length] }
      }))

      this.distributionChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}人 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 20,
          top: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data
          }
        ]
      })
    },
    initCompositionChart() {
      const el = this.$refs.compositionChart as HTMLElement
      if (!el || !this.stats) return
      if (this.compositionChart) {
        this.compositionChart.dispose()
      }
      this.compositionChart = echarts.init(el)

      const data = [
        { name: '基本工资', value: this.stats.totalBaseSalary },
        { name: '绩效工资', value: this.stats.totalPerformanceSalary },
        { name: '加班费', value: this.stats.totalOvertimePay },
        { name: '奖金', value: this.stats.totalBonus },
        { name: '津贴补贴', value: this.stats.totalAllowance }
      ].map((item, idx) => ({
        ...item,
        itemStyle: { color: chartColors[idx % chartColors.length] }
      }))

      this.compositionChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            return `${params.marker} ${params.name}: ¥${this.formatMoney(params.value)} (${params.percent}%)`
          }
        },
        legend: {
          orient: 'vertical',
          right: 20,
          top: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data
          }
        ]
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.salary-statistics {
  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
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
}
</style>
