<template>
  <div class="alert-center">
    <div class="stat-row">
      <div class="stat-card">
        <i class="el-icon-warning-outline stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">待处理预警</div>
        <div class="stat-value danger">{{ pendingCount }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-circle-check stat-icon" style="color: #67C23A;"></i>
        <div class="stat-label">已处理预警</div>
        <div class="stat-value success">{{ handledCount }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-alarm-clock stat-icon" style="color: #E6A23C;"></i>
        <div class="stat-label">迟到预警</div>
        <div class="stat-value warning">{{ lateCount }}</div>
      </div>
      <div class="stat-card">
        <i class="el-icon-close stat-icon" style="color: #F56C6C;"></i>
        <div class="stat-label">缺勤预警</div>
        <div class="stat-value danger">{{ absentCount }}</div>
      </div>
    </div>

    <div class="page-card">
      <div class="page-header">
        <h2>预警列表</h2>
        <div>
          <el-button
            type="primary"
            icon="el-icon-check"
            @click="handleBatchHandle"
            :disabled="selectedIds.length === 0"
            v-if="canHandle"
          >
            批量处理
          </el-button>
        </div>
      </div>

      <div class="filter-bar">
        <el-radio-group v-model="filterHandled" @change="loadData">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="pending">待处理</el-radio-button>
          <el-radio-button label="handled">已处理</el-radio-button>
        </el-radio-group>
        <el-select v-model="filters.type" placeholder="预警类型" clearable style="width: 140px;" @change="loadData">
          <el-option v-for="(label, key) in alertTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-input
          v-model="filters.keyword"
          placeholder="搜索员工姓名"
          prefix-icon="el-icon-search"
          style="width: 200px;"
          clearable
          @keyup.enter.native="loadData"
        />
      </div>

      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" v-if="canHandle" />
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="预警类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="alertTypeTag(scope.row.type)" size="mini">
              {{ alertTypeMap[scope.row.type] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="员工" width="150">
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
        <el-table-column prop="date" label="预警日期" width="120" />
        <el-table-column prop="description" label="预警描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.handled ? 'info' : 'warning'" size="mini">
              {{ scope.row.handled ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="处理人" width="100" v-if="canHandle">
          <template slot-scope="scope">{{ scope.row.handledBy ? '管理员' : '-' }}</template>
        </el-table-column>
        <el-table-column prop="handledAt" label="处理时间" width="160">
          <template slot-scope="scope">{{ scope.row.handledAt ? formatDateTime(scope.row.handledAt) : '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" v-if="canHandle">
          <template slot-scope="scope">
            <el-button
              v-if="!scope.row.handled"
              type="text"
              size="small"
              style="color: #67C23A;"
              @click="handleAlert(scope.row)"
            >处理</el-button>
            <span v-else class="text-disabled">已处理</span>
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
import type { AlertRecord } from '@/types'
import { getAlerts, handleAlert } from '@/api/attendance'
import { alertTypeMap, getInitials, formatDateTime } from '@/utils'

export default Vue.extend({
  name: 'AlertCenter',
  data() {
    return {
      loading: false,
      tableData: [] as AlertRecord[],
      pendingCount: 0,
      handledCount: 0,
      lateCount: 0,
      absentCount: 0,
      selectedIds: [] as number[],
      filterHandled: 'all',
      filters: {
        type: '',
        keyword: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      alertTypeMap
    }
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['isAdmin', 'isManager']),
    canHandle(): boolean {
      return this.isAdmin || this.isManager
    }
  },
  mounted() {
    this.loadData()
    this.loadStats()
  },
  methods: {
    getInitials,
    formatDateTime,
    async loadStats() {
      try {
        const [pendingRes, handledRes, lateRes, absentRes] = await Promise.all([
          getAlerts({ page: 1, pageSize: 1, handled: false }),
          getAlerts({ page: 1, pageSize: 1, handled: true }),
          getAlerts({ page: 1, pageSize: 1, type: 'late' }),
          getAlerts({ page: 1, pageSize: 1, type: 'absent' })
        ])
        this.pendingCount = pendingRes.total
        this.handledCount = handledRes.total
        this.lateCount = lateRes.total
        this.absentCount = absentRes.total
      } catch (e) {
        // ignore
      }
    },
    async loadData() {
      this.loading = true
      try {
        const params: any = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        if (this.filterHandled === 'pending') {
          params.handled = false
        } else if (this.filterHandled === 'handled') {
          params.handled = true
        }
        if (this.filters.type) {
          params.type = this.filters.type
        }
        const res = await getAlerts(params)
        let list = res.list
        if (this.filters.keyword) {
          const kw = this.filters.keyword.toLowerCase()
          list = list.filter(a => a.userName.toLowerCase().includes(kw))
        }
        this.tableData = list
        this.pagination.total = res.total
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
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
    alertTypeTag(type: string): string {
      const map: Record<string, string> = {
        late: 'warning',
        early: 'warning',
        absent: 'danger',
        continuous_absent: 'danger'
      }
      return map[type] || 'info'
    },
    handleSelectionChange(selection: AlertRecord[]) {
      this.selectedIds = selection.filter(s => !s.handled).map(s => s.id)
    },
    async handleAlert(row: AlertRecord) {
      if (!this.user?.id) return
      this.$confirm(`确定处理这条预警吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async () => {
        try {
          await handleAlert(row.id, this.user!.id)
          this.$message.success('处理成功')
          this.loadData()
          this.loadStats()
        } catch (e: any) {
          this.$message.error(e.message || '处理失败')
        }
      }).catch(() => {})
    },
    handleBatchHandle() {
      this.$confirm(`确定批量处理选中的 ${this.selectedIds.length} 条预警吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }).then(async () => {
        if (!this.user?.id) return
        try {
          for (const id of this.selectedIds) {
            await handleAlert(id, this.user.id)
          }
          this.$message.success('批量处理成功')
          this.loadData()
          this.loadStats()
        } catch (e: any) {
          this.$message.error(e.message || '处理失败')
        }
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.alert-center {
  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
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

  .text-disabled {
    color: #c0c4cc;
    font-size: 12px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
