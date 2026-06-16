<template>
  <div class="approval-flow-config">
    <div class="page-card">
      <div class="page-header">
      <h2>审核流程配置</h2>
      <div class="header-actions">
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-if="canCreate">新增流程</el-button>
      </div>
    </div>

      <div class="filter-bar">
        <el-select v-model="filters.contractType" placeholder="合同类型" clearable style="width: 160px;">
          <el-option v-for="(label, key) in contractTypeMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px;">
          <el-option label="启用" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="流程名称" min-width="180" />
        <el-table-column label="合同类型" width="120">
          <template slot-scope="scope">
            <el-tag size="mini">{{ contractTypeMap[scope.row.contractType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核节点数" width="100" align="center">
          <template slot-scope="scope">{{ scope.row.steps?.length || 0 }}</template>
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
        <el-table-column label="操作" width="200" fixed="right">
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
          :page-sizes="[10, 20, 50]"
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
      width="900px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
      class="flow-config-dialog"
    >
      <div v-if="dialogVisible">
        <el-form
          ref="flowForm"
          :model="formData"
          :rules="formRules"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="流程名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入流程名称" maxlength="50" show-word-limit :disabled="isViewMode" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="合同类型" prop="contractType">
                <el-select v-model="formData.contractType" placeholder="请选择合同类型" style="width: 100%;" :disabled="isViewMode">
                  <el-option v-for="(label, key) in contractTypeMap" :key="key" :label="label" :value="key" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="流程描述" prop="description">
            <el-input type="textarea" v-model="formData.description" placeholder="请输入流程描述" :rows="2" maxlength="200" show-word-limit :disabled="isViewMode" />
          </el-form-item>
          <el-form-item label="设为默认" v-if="!isViewMode">
            <el-switch v-model="formData.isDefault" />
            <span class="form-tip">同一合同类型只能有一个默认流程</span>
          </el-form-item>
          <el-form-item label="状态" prop="status" v-if="!isViewMode">
            <el-radio-group v-model="formData.status">
              <el-radio label="active">启用</el-radio>
              <el-radio label="inactive">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-divider content-position="left">
            <span class="divider-title">审核节点配置</span>
          </el-divider>

          <div class="steps-config">
            <div v-if="isViewMode || formData.steps.length === 0" class="empty-steps">
              <el-empty description="暂无审核节点" :image-size="80" />
            </div>
            <div v-else class="steps-list">
              <div v-for="(step, index) in formData.steps" :key="index" class="step-item">
                <div class="step-header">
                  <span class="step-order">第{{ index + 1 }}级</span>
                  <span class="step-name">{{ step.stepName }}</span>
                  <span class="step-role">{{ step.roleName }}</span>
                  <el-tag size="mini" type="info">{{ approvalModeMap[step.mode] }}</el-tag>
                  <div class="step-actions" v-if="!isViewMode">
                    <el-button type="text" size="mini" icon="el-icon-top" @click="moveStepUp(index)" :disabled="index === 0">上移</el-button>
                    <el-button type="text" size="mini" icon="el-icon-bottom" @click="moveStepDown(index)" :disabled="index === formData.steps.length - 1">下移</el-button>
                    <el-button type="text" size="mini" icon="el-icon-edit" @click="editStep(index)">编辑</el-button>
                    <el-button type="text" size="mini" icon="el-icon-delete" style="color: #F56C6C;" @click="removeStep(index)">删除</el-button>
                  </div>
                </div>
                <div class="step-conditions" v-if="step.conditions && step.conditions.length > 0">
                  <el-tag v-for="(cond, condIdx) in step.conditions" :key="condIdx" size="mini" class="condition-tag">
                    <i class="el-icon-warning" style="margin-right: 4px;"></i>
                    {{ formatCondition(cond) }}
                  </el-tag>
                </div>
                <div class="step-config-summary">
                  <span v-if="step.requireComment"><i class="el-icon-document"></i> 必须填写意见</span>
                  <span v-if="step.deadlineHours"><i class="el-icon-time"></i> {{ step.deadlineHours }}小时内完成</span>
                  <span v-if="step.canDelegate"><i class="el-icon-user"></i> 可委托</span>
                  <span v-if="step.canReturn"><i class="el-icon-refresh-left"></i> 可退回</span>
                  <span v-if="step.canAddSign"><i class="el-icon-plus"></i> 可加签</span>
                </div>
              </div>
            </div>
            <el-button v-if="!isViewMode" type="dashed" style="width: 100%; margin-top: 12px;" icon="el-icon-plus" @click="handleAddStep">添加审核节点</el-button>
          </div>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ isViewMode ? '关闭' : '取 消' }}</el-button>
        <el-button type="primary" @click="handleSubmit" v-if="!isViewMode">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="配置审核节点" :visible.sync="stepDialogVisible" width="600px">
      <el-form ref="stepForm" :model="stepFormData" :rules="stepFormRules" label-width="100px" v-if="stepDialogVisible">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="节点名称" prop="stepName">
            <el-input v-model="stepFormData.stepName" placeholder="如：部门经理审核" maxlength="30" show-word-limit />
          </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批角色" prop="role">
            <el-select v-model="stepFormData.role" placeholder="请选择审批角色" style="width: 100%;" @change="handleRoleChange">
              <el-option v-for="(label, key) in approvalRoleMap" :key="key" :label="label" :value="key" />
            </el-select>
          </el-form-item>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="审批模式" prop="mode">
            <el-select v-model="stepFormData.mode" placeholder="请选择审批模式" style="width: 100%;">
              <el-option label="依次审批" value="sequential" />
              <el-option label="会签审批" value="countersign" />
              <el-option label="或签审批" value="any_sign" />
            </el-select>
          </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审批时限(小时)">
            <el-input-number v-model="stepFormData.deadlineHours" :min="0" :max="168" placeholder="0表示不限制" style="width: 100%;" />
          </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">
          <span class="divider-title">触发条件（满足条件才进入此节点）</span>
        </el-divider>

        <div v-if="stepFormData.conditions.length === 0" class="empty-conditions">
          <span style="color: #909399;">无条件，所有该类型合同都会经过此节点</span>
          <el-button type="text" @click="addCondition">+ 添加条件</el-button>
        </div>
        <div v-else class="conditions-list">
          <div v-for="(cond, index) in stepFormData.conditions" :key="index" class="condition-row">
            <span class="logic">
              <el-tag v-if="index > 0" size="mini">且</el-tag>
            </span>
            <el-select v-model="cond.type" placeholder="条件类型" style="width: 120px;">
              <el-option v-for="(label, key) in approvalConditionTypeMap" :key="key" :label="label" :value="key" />
            </el-select>
            <el-select v-model="cond.operator" placeholder="运算符" style="width: 100px;">
              <el-option v-for="(label, key) in approvalOperatorMap" :key="key" :label="label" :value="key" />
            </el-select>
            <el-input v-model="cond.value" placeholder="值" style="width: 150px;" />
            <el-button type="text" icon="el-icon-delete" style="color: #F56C6C;" @click="removeCondition(index)"></el-button>
          </div>
          <el-button type="text" @click="addCondition" style="margin-top: 8px;">+ 添加条件</el-button>
        </div>

        <el-divider content-position="left">
          <span class="divider-title">高级设置</span>
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="必填意见">
            <el-switch v-model="stepFormData.requireComment" />
          </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="可委托">
            <el-switch v-model="stepFormData.canDelegate" />
          </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="可退回">
            <el-switch v-model="stepFormData.canReturn" />
          </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="可加签">
            <el-switch v-model="stepFormData.canAddSign" />
          </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="stepDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleStepSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import {
  getContractApprovalFlows,
  createContractApprovalFlow,
  updateContractApprovalFlow,
  deleteContractApprovalFlow
} from '@/api/contract'
import {
  contractTypeMap,
  approvalRoleMap,
  approvalModeMap,
  approvalConditionTypeMap,
  approvalOperatorMap
} from '@/data/mockData'
import { formatDateTime } from '@/utils'
import type {
  ContractApprovalFlowConfig,
  ContractType,
  ApprovalCondition
} from '@/types'

export default Vue.extend({
  name: 'ContractApprovalFlowConfig',
  data() {
    return {
      loading: false,
      tableData: [] as ContractApprovalFlowConfig[],
      filters: {
        contractType: '' as ContractType | '',
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增流程',
      isViewMode: false,
      isEditMode: false,
      currentId: 0,
      editingStepIndex: -1,
      stepDialogVisible: false,
      formData: {
        name: '',
        contractType: 'fixed_term' as ContractType,
        description: '',
        steps: [] as any[],
        isDefault: false,
        status: 'active' as 'active' | 'inactive',
        createdBy: 1,
        createdByName: ''
      },
      formRules: {
        name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }],
        contractType: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
        steps: [{ required: true, message: '请添加至少一个审核节点', trigger: 'change' }]
      },
      stepFormData: {
        stepOrder: 1,
        stepName: '',
        role: '',
        roleName: '',
        mode: 'sequential' as const,
        conditions: [] as ApprovalCondition[],
        requireComment: false,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      },
      stepFormRules: {
        stepName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
        role: [{ required: true, message: '请选择审批角色', trigger: 'change' }],
        mode: [{ required: true, message: '请选择审批模式', trigger: 'change' }]
      },
      contractTypeMap,
      approvalRoleMap,
      approvalModeMap,
      approvalConditionTypeMap,
      approvalOperatorMap
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission']),
    canCreate(): boolean {
      return this.hasPermission('contract:flow:create') || this.isSalaryAdmin
    },
    canEdit(): boolean {
      return this.hasPermission('contract:flow:edit') || this.isSalaryAdmin
    },
    canDelete(): boolean {
      return this.hasPermission('contract:flow:delete') || this.isSalaryAdmin
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    formatDateTime,
    formatCondition(cond: any): string {
      const typeText = this.approvalConditionTypeMap[cond.type] || cond.type
      const opText = this.approvalOperatorMap[cond.operator] || cond.operator
      const valueText = typeof cond.value === 'object' 
        ? (Array.isArray(cond.value) ? cond.value.join(',') : cond.value)
        : cond.value
      return `${typeText} ${opText} ${valueText}`
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getContractApprovalFlows({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          contractType: this.filters.contractType || undefined,
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
      this.filters = { contractType: '', status: '' }
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
      this.dialogTitle = '新增流程'
      this.currentId = 0
      this.formData = {
        name: '',
        contractType: 'fixed_term',
        description: '',
        steps: [],
        isDefault: false,
        status: 'active',
        createdBy: 1,
        createdByName: ''
      }
      this.dialogVisible = true
    },
    handleView(row: ContractApprovalFlowConfig) {
      this.isViewMode = true
      this.isEditMode = true
      this.dialogTitle = '查看流程'
      this.currentId = row.id
      this.formData = { ...row, steps: JSON.parse(JSON.stringify(row.steps)) }
      this.dialogVisible = true
    },
    handleEdit(row: ContractApprovalFlowConfig) {
      this.isViewMode = false
      this.isEditMode = true
      this.dialogTitle = '编辑流程'
      this.currentId = row.id
      this.formData = { ...row, steps: JSON.parse(JSON.stringify(row.steps)) }
      this.dialogVisible = true
    },
    handleDelete(row: ContractApprovalFlowConfig) {
      this.$confirm(`确定要删除流程「${row.name}」吗？`, '确认删除', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await deleteContractApprovalFlow(row.id)
          if (res) {
            this.$message.success('删除成功')
            this.loadData()
          }
        } catch (e) {
          this.$message.error('删除失败')
        }
      }).catch(() => {})
    },
    handleDialogClose() {
      (this.$refs.flowForm as any)?.resetFields()
    },
    async handleSubmit() {
      const form = this.$refs.flowForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        if (this.formData.steps.length === 0) {
          this.$message.warning('请添加至少一个审核节点')
          return
        }
        try {
          if (this.isEditMode) {
            await updateContractApprovalFlow(this.currentId, this.formData as any)
            this.$message.success('更新成功')
          } else {
            await createContractApprovalFlow(this.formData as any)
            this.$message.success('创建成功')
          }
          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          this.$message.error('操作失败')
        }
      })
    },
    handleAddStep() {
      this.editingStepIndex = -1
      this.stepFormData = {
        stepOrder: this.formData.steps.length + 1,
        stepName: '',
        role: '',
        roleName: '',
        mode: 'sequential',
        conditions: [],
        requireComment: false,
        deadlineHours: 24,
        canDelegate: true,
        canReturn: true,
        canAddSign: false
      }
      this.stepDialogVisible = true
    },
    editStep(index: number) {
      const step = this.formData.steps[index]
      this.editingStepIndex = index
      this.stepFormData = { ...step, conditions: JSON.parse(JSON.stringify(step.conditions || [])) }
      this.stepDialogVisible = true
    },
    removeStep(index: number) {
      this.formData.steps.splice(index, 1)
      this.formData.steps.forEach((step, idx) => {
        step.stepOrder = idx + 1
      })
    },
    moveStepUp(index: number) {
      if (index > 0) {
        const temp = this.formData.steps[index]
        this.formData.steps[index] = this.formData.steps[index - 1]
        this.formData.steps[index - 1] = temp
        this.formData.steps.forEach((step, idx) => {
          step.stepOrder = idx + 1
        })
      }
    },
    moveStepDown(index: number) {
      if (index < this.formData.steps.length - 1) {
        const temp = this.formData.steps[index]
        this.formData.steps[index] = this.formData.steps[index + 1]
        this.formData.steps[index + 1] = temp
        this.formData.steps.forEach((step, idx) => {
          step.stepOrder = idx + 1
        })
      }
    },
    handleRoleChange(role: string) {
      this.stepFormData.roleName = this.approvalRoleMap[role] || ''
    },
    addCondition() {
      this.stepFormData.conditions.push({
        type: 'amount',
        operator: 'gte',
        value: 0
      } as any)
    },
    removeCondition(index: number) {
      this.stepFormData.conditions.splice(index, 1)
    },
    handleStepSubmit() {
      const form = this.$refs.stepForm as any
      if (!form) return
      form.validate((valid: boolean) => {
        if (!valid) return
        
        const stepData = { ...this.stepFormData }
        if (this.editingStepIndex >= 0) {
          this.formData.steps[this.editingStepIndex] = stepData
        } else {
          this.formData.steps.push(stepData)
        }
        this.stepDialogVisible = false
      })
    }
  }
})
</script>

<style lang="scss">
.approval-flow-config {
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
  .divider-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
  }
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
  }
  .steps-config {
    .empty-steps {
      padding: 30px 0;
    }
    .step-item {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 12px;
      padding: 16px;
      background: #fafafa;
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .step-order {
      display: inline-block;
      width: 50px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background: #409EFF;
      color: #fff;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .step-name {
      font-weight: 500;
      color: #303133;
      font-size: 14px;
    }
    .step-role {
      color: #909399;
      font-size: 13px;
    }
    .step-actions {
      margin-left: auto;
      display: flex;
      gap: 4px;
    }
    .step-conditions {
      margin-bottom: 8px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .condition-tag {
      background: #ecf5ff;
      border-color: #b3d8ff;
      color: #409EFF;
    }
    .step-config-summary {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #909399;
      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      i {
        color: #409EFF;
      }
    }
  }
  .conditions-list {
    margin-bottom: 12px;
    .condition-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      .logic {
        width: 40px;
      }
    }
  }
  .empty-conditions {
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .flow-config-dialog {
    .el-dialog__body {
      max-height: 70vh;
      overflow-y: auto;
    }
  }
}
</style>
