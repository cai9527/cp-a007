<template>
  <div class="salary-items">
    <div class="page-card">
      <div class="page-header">
        <h2>工资项目配置</h2>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-if="canCreate">新增项目</el-button>
      </div>

      <div class="filter-bar">
        <el-select v-model="filters.type" placeholder="项目类型" clearable style="width: 140px;">
          <el-option label="收入" value="earning" />
          <el-option label="扣除" value="deduction" />
        </el-select>
        <el-select v-model="filters.status" placeholder="项目状态" clearable style="width: 140px;">
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="项目名称" min-width="140" />
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'earning' ? 'success' : 'danger'" size="mini">
              {{ scope.row.type === 'earning' ? '收入' : '扣除' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否计税" width="100" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.isTaxable ? 'el-icon-circle-check' : 'el-icon-circle-close'"
               :style="{ color: scope.row.isTaxable ? '#67C23A' : '#F56C6C', fontSize: '18px' }"></i>
          </template>
        </el-table-column>
        <el-table-column label="是否固定" width="100" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.isFixed ? 'el-icon-circle-check' : 'el-icon-circle-close'"
               :style="{ color: scope.row.isFixed ? '#67C23A' : '#F56C6C', fontSize: '18px' }"></i>
          </template>
        </el-table-column>
        <el-table-column prop="defaultValue" label="默认值" width="120" align="right">
          <template slot-scope="scope">{{ scope.row.defaultValue.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="160" fixed="right" v-if="canEdit || canDelete">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleEdit(scope.row)" v-if="canEdit">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)" v-if="canDelete">删除</el-button>
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
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="560px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="salaryItemForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-if="dialogVisible"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入项目名称" maxlength="30" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入项目编码" maxlength="30" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目类型" prop="type">
              <el-radio-group v-model="formData.type">
                <el-radio label="earning">收入</el-radio>
                <el-radio label="deduction">扣除</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认值" prop="defaultValue">
              <el-input-number v-model="formData.defaultValue" :min="0" :precision="2" :step="100" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否计税" prop="isTaxable">
              <el-radio-group v-model="formData.isTaxable">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否固定" prop="isFixed">
              <el-radio-group v-model="formData.isFixed">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status" v-if="formData.id">
              <el-radio-group v-model="formData.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" :max="999" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { FormRules } from 'element-ui'
import type { SalaryItem, PaginatedResponse } from '@/types'
import {
  getSalaryItems,
  createSalaryItem,
  updateSalaryItem,
  deleteSalaryItem
} from '@/api/salary'
import { mapGetters } from 'vuex'

export default Vue.extend({
  name: 'SalaryItems',
  data() {
    return {
      loading: false,
      submitting: false,
      tableData: [] as SalaryItem[],
      filters: {
        type: '',
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      isEdit: false,
      formData: {
        id: null as number | null,
        name: '',
        code: '',
        type: 'earning' as SalaryItem['type'],
        description: '',
        isTaxable: true,
        isFixed: false,
        defaultValue: 0,
        status: 'active' as SalaryItem['status'],
        sort: 0
      },
      formRules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入项目编码', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
        defaultValue: [{ required: true, message: '请输入默认值', trigger: 'blur' }],
        isTaxable: [{ required: true, message: '请选择是否计税', trigger: 'change' }],
        isFixed: [{ required: true, message: '请选择是否固定', trigger: 'change' }],
        sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
      } as FormRules
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission']),
    canEdit(): boolean {
      return this.hasPermission('salary:item:edit')
    },
    canCreate(): boolean {
      return this.hasPermission('salary:item:create')
    },
    canDelete(): boolean {
      return this.hasPermission('salary:item:delete')
    },
    dialogTitle(): string {
      return this.isEdit ? '编辑工资项目' : '新增工资项目'
    }
  },
  created() {
    if (!this.$store.getters.isSalaryAdmin) {
      this.$message.error('您没有权限访问工资项目配置页面')
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
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res: PaginatedResponse<SalaryItem> = await getSalaryItems({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          type: this.filters.type || undefined,
          status: this.filters.status || undefined
        })
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
    handleAdd() {
      this.isEdit = false
      this.formData = {
        id: null,
        name: '',
        code: '',
        type: 'earning',
        description: '',
        isTaxable: true,
        isFixed: false,
        defaultValue: 0,
        status: 'active',
        sort: 0
      }
      this.dialogVisible = true
    },
    handleEdit(row: SalaryItem) {
      this.isEdit = true
      this.formData = {
        id: row.id,
        name: row.name,
        code: row.code,
        type: row.type,
        description: row.description,
        isTaxable: row.isTaxable,
        isFixed: row.isFixed,
        defaultValue: row.defaultValue,
        status: row.status,
        sort: row.sort
      }
      this.dialogVisible = true
    },
    handleDelete(row: SalaryItem) {
      this.$confirm(`确定要删除工资项目 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteSalaryItem(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (e: any) {
          this.$message.error(e.message || '删除失败')
        }
      }).catch(() => {})
    },
    handleDialogClose() {
      ;(this.$refs.salaryItemForm as any)?.resetFields()
    },
    async handleSubmit() {
      const form = this.$refs.salaryItemForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        this.submitting = true
        try {
          if (this.isEdit && this.formData.id) {
            await updateSalaryItem(this.formData.id, {
              name: this.formData.name,
              code: this.formData.code,
              type: this.formData.type,
              description: this.formData.description,
              isTaxable: this.formData.isTaxable,
              isFixed: this.formData.isFixed,
              defaultValue: this.formData.defaultValue,
              status: this.formData.status,
              sort: this.formData.sort
            })
            this.$message.success('编辑成功')
          } else {
            await createSalaryItem({
              name: this.formData.name,
              code: this.formData.code,
              type: this.formData.type,
              description: this.formData.description,
              isTaxable: this.formData.isTaxable,
              isFixed: this.formData.isFixed,
              defaultValue: this.formData.defaultValue,
              status: 'active',
              sort: this.formData.sort
            })
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.loadData()
        } catch (e: any) {
          this.$message.error(e.message || '操作失败')
        } finally {
          this.submitting = false
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.salary-items {
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
