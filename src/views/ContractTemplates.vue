<template>
  <div class="contract-templates">
    <div class="page-card">
      <div class="page-header">
        <h2>合同模板管理</h2>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-if="canCreate">新增模板</el-button>
      </div>

      <div class="filter-bar">
        <el-input v-model="filters.keyword" placeholder="搜索模板名称/编码" clearable style="width: 220px;" @keyup.enter.native="loadData" />
        <el-select v-model="filters.type" placeholder="合同类型" clearable style="width: 140px;">
          <el-option label="固定期限" value="fixed_term" />
          <el-option label="无固定期限" value="open_ended" />
          <el-option label="非全日制" value="part_time" />
          <el-option label="试用期" value="probation" />
          <el-option label="项目制" value="project" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px;">
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column prop="code" label="模板编码" width="160" />
        <el-table-column label="合同类型" width="120">
          <template slot-scope="scope">
            <el-tag size="mini">{{ contractTypeMap[scope.row.type] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本号" width="100" />
        <el-table-column label="占位字段数" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.placeholderFields?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="是否默认" width="100" align="center">
          <template slot-scope="scope">
            <i :class="scope.row.isDefault ? 'el-icon-circle-check' : 'el-icon-circle-close'"
               :style="{ color: scope.row.isDefault ? '#67C23A' : '#C0C4CC', fontSize: '18px' }"></i>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdByName" label="创建人" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" v-if="canEdit || canDelete || canView">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
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
      width="720px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="templateForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-if="dialogVisible"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入模板名称" maxlength="50" show-word-limit :disabled="isViewMode" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板编码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入模板编码" maxlength="30" show-word-limit :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择合同类型" style="width: 100%;" :disabled="isViewMode">
                <el-option label="固定期限" value="fixed_term" />
                <el-option label="无固定期限" value="open_ended" />
                <el-option label="非全日制" value="part_time" />
                <el-option label="试用期" value="probation" />
                <el-option label="项目制" value="project" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="formData.version" placeholder="请输入版本号，如 v1.0" maxlength="20" :disabled="isViewMode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="模板内容" prop="content">
          <el-input
            type="textarea"
            v-model="formData.content"
            placeholder="请输入合同模板内容，可使用占位符如 {员工姓名}、{岗位} 等"
            :rows="12"
            maxlength="5000"
            show-word-limit
            :disabled="isViewMode"
          />
        </el-form-item>
        <el-form-item label="占位字段">
          <div class="placeholder-tags" v-if="formData.placeholderFields && formData.placeholderFields.length > 0">
            <el-tag v-for="(field, idx) in formData.placeholderFields" :key="idx" style="margin: 4px 8px 4px 0;">
              {{ field }}
              <i class="el-icon-close" v-if="!isViewMode" @click="removePlaceholder(idx)"></i>
            </el-tag>
          </div>
          <div class="placeholder-input" v-if="!isViewMode">
            <el-input v-model="newPlaceholder" placeholder="输入占位字段名，回车添加" style="width: 200px;" @keyup.enter.native="addPlaceholder" />
            <el-button size="small" @click="addPlaceholder">添加</el-button>
            <span class="placeholder-tip">占位字段将在创建合同时自动填充</span>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="!isViewMode">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="设为默认" v-if="!isViewMode">
          <el-switch v-model="formData.isDefault" />
          <span class="form-tip">设为默认后，新建合同时将自动选用此模板</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ isViewMode ? '关闭' : '取 消' }}</el-button>
        <el-button type="primary" @click="handleSubmit" v-if="!isViewMode">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import {
  getContractTemplates,
  createContractTemplate,
  updateContractTemplate,
  deleteContractTemplate
} from '@/api/contract'
import { contractTypeMap } from '@/data/mockData'
import { formatDateTime } from '@/utils'
import type { ContractTemplate, ContractType } from '@/types'

export default Vue.extend({
  name: 'ContractTemplates',
  data() {
    return {
      loading: false,
      tableData: [] as ContractTemplate[],
      filters: {
        keyword: '',
        type: '',
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增模板',
      isViewMode: false,
      isEditMode: false,
      currentId: 0,
      newPlaceholder: '',
      formData: {
        name: '',
        code: '',
        type: 'fixed_term' as ContractType,
        version: 'v1.0',
        content: '',
        placeholderFields: [] as string[],
        isDefault: false,
        status: 'active' as 'active' | 'inactive',
        createdBy: 1,
        createdByName: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
        code: [{ required: true, message: '请输入模板编码', trigger: 'blur' }],
        type: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
        content: [{ required: true, message: '请输入模板内容', trigger: 'blur' }]
      },
      contractTypeMap
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission']),
    canCreate(): boolean {
      return this.hasPermission('contract:template:create') || this.isSalaryAdmin
    },
    canEdit(): boolean {
      return this.hasPermission('contract:template:edit') || this.isSalaryAdmin
    },
    canDelete(): boolean {
      return this.hasPermission('contract:template:delete') || this.isSalaryAdmin
    },
    canView(): boolean {
      return this.hasPermission('contract:template:view') || this.isSalaryAdmin
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatDateTime,
    async loadData() {
      this.loading = true
      try {
        const res = await getContractTemplates({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.filters.keyword || undefined,
          type: this.filters.type || undefined,
          status: this.filters.status || undefined
        })
        this.tableData = res.list
        this.pagination.total = res.total
      } catch (e) {
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = { keyword: '', type: '', status: '' }
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
      this.isViewMode = false
      this.isEditMode = false
      this.dialogTitle = '新增模板'
      this.currentId = 0
      this.formData = {
        name: '',
        code: '',
        type: 'fixed_term',
        version: 'v1.0',
        content: '',
        placeholderFields: [],
        isDefault: false,
        status: 'active',
        createdBy: 1,
        createdByName: ''
      }
      this.newPlaceholder = ''
      this.dialogVisible = true
    },
    handleView(row: ContractTemplate) {
      this.isViewMode = true
      this.isEditMode = true
      this.dialogTitle = '查看模板'
      this.currentId = row.id
      this.formData = { ...row }
      this.dialogVisible = true
    },
    handleEdit(row: ContractTemplate) {
      this.isViewMode = false
      this.isEditMode = true
      this.dialogTitle = '编辑模板'
      this.currentId = row.id
      this.formData = { ...row, placeholderFields: [...(row.placeholderFields || [])] }
      this.newPlaceholder = ''
      this.dialogVisible = true
    },
    handleDelete(row: ContractTemplate) {
      this.$confirm(`确定要删除模板「${row.name}」吗？`, '确认删除', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteContractTemplate(row.id)
          if (res) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    addPlaceholder() {
      const val = this.newPlaceholder.trim()
      if (!val) return
      if (this.formData.placeholderFields?.includes(val)) {
        this.$message.warning('该占位字段已存在')
        return
      }
      this.formData.placeholderFields?.push(val)
      this.newPlaceholder = ''
    },
    removePlaceholder(idx: number) {
      this.formData.placeholderFields?.splice(idx, 1)
    },
    handleDialogClose() {
      (this.$refs.templateForm as any)?.resetFields()
    },
    async handleSubmit() {
      const form = this.$refs.templateForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        try {
          if (this.isEditMode) {
            await updateContractTemplate(this.currentId, this.formData)
            this.$message.success('更新成功')
          } else {
            await createContractTemplate(this.formData as any)
            this.$message.success('创建成功')
          }
          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('操作失败')
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.contract-templates {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
  .placeholder-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 8px;
    .el-icon-close {
      cursor: pointer;
      margin-left: 4px;
      &:hover {
        color: #F56C6C;
      }
    }
  }
  .placeholder-input {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .placeholder-tip {
    font-size: 12px;
    color: #909399;
  }
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }
}
</style>
