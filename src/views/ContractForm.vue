<template>
  <div class="contract-form">
    <div class="page-card">
      <div class="page-header">
        <div class="header-left">
          <el-button icon="el-icon-arrow-left" @click="goBack">返回</el-button>
          <h2>{{ isEdit ? '编辑合同' : '新建合同' }}</h2>
        </div>
        <div class="header-actions">
          <el-button @click="handleSaveDraft" v-if="!isEdit">保存草稿</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="canSubmit">提交审核</el-button>
        </div>
      </div>

      <el-steps :active="activeStep" finish-status="success" class="form-steps">
        <el-step title="选择模板" />
        <el-step title="填写信息" />
        <el-step title="确认提交" />
      </el-steps>

      <div class="step-content">
        <div v-if="activeStep === 0" class="step-0">
          <h3>选择合同模板</h3>
          <p class="step-desc">请选择一个合同模板，系统将基于该模板生成合同内容</p>
          
          <el-radio-group v-model="selectedTemplateId" class="template-list">
            <el-radio
              v-for="template in templates"
              :key="template.id"
              :label="template.id"
              class="template-radio"
            >
              <div class="template-item">
                <div class="template-title">
                  <span class="template-name">{{ template.name }}</span>
                  <el-tag size="mini" type="success" v-if="template.isDefault">默认</el-tag>
                </div>
                <div class="template-info">
                  <span class="template-code">{{ template.code }}</span>
                  <span class="template-type">{{ contractTypeMap[template.type] }}</span>
                  <span class="template-version">版本: {{ template.version }}</span>
                </div>
              </div>
            </el-radio>
          </el-radio-group>

          <div class="template-preview" v-if="selectedTemplate">
            <h4>模板预览</h4>
            <div class="preview-content">{{ selectedTemplate.content }}</div>
          </div>

          <div class="step-actions">
            <el-button type="primary" @click="goToStep(1)" :disabled="!selectedTemplateId">下一步</el-button>
          </div>
        </div>

        <div v-if="activeStep === 1" class="step-1">
          <el-form
            ref="contractForm"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="contract-form-el"
          >
            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-user"></i> 员工基本信息
              </span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="员工姓名" prop="userName">
                  <el-select
                    v-model="formData.userId"
                    filterable
                    placeholder="请选择员工"
                    style="width: 100%;"
                    @change="handleUserChange"
                  >
                    <el-option
                      v-for="user in employeeList"
                      :key="user.id"
                      :label="`${user.name} - ${user.departmentName}`"
                      :value="user.id"
                    >
                      <span>{{ user.name }}</span>
                      <span style="float: right; color: #8492a6; font-size: 13px;">
                        {{ user.departmentName }} - {{ user.position }}
                      </span>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="身份证号" prop="userIdCard">
                  <el-input v-model="formData.userIdCard" placeholder="请输入身份证号" maxlength="18" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="联系电话" prop="userPhone">
                  <el-input v-model="formData.userPhone" placeholder="请输入联系电话" maxlength="11" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="电子邮箱" prop="userEmail">
                  <el-input v-model="formData.userEmail" placeholder="请输入电子邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="家庭住址" prop="userAddress">
                  <el-input v-model="formData.userAddress" placeholder="请输入家庭住址" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-suitcase"></i> 工作信息
              </span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="所属部门" prop="workInfo.departmentId">
                  <el-select
                    v-model="formData.workInfo.departmentId"
                    placeholder="请选择部门"
                    style="width: 100%;"
                    @change="handleDepartmentChange"
                  >
                    <el-option
                      v-for="dept in departments"
                      :key="dept.id"
                      :label="dept.name"
                      :value="dept.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="岗位" prop="workInfo.position">
                  <el-input v-model="formData.workInfo.position" placeholder="请输入岗位名称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工作地点" prop="workInfo.workLocation">
                  <el-input v-model="formData.workInfo.workLocation" placeholder="请输入工作地点" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="工作时间" prop="workInfo.workHours">
                  <el-input v-model="formData.workInfo.workHours" placeholder="如：09:00-18:00" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="工作天数" prop="workInfo.workDays">
                  <el-input v-model="formData.workInfo.workDays" placeholder="如：周一至周五" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="试用期(月)" prop="workInfo.probationPeriod">
                  <el-input-number
                    v-model="formData.workInfo.probationPeriod"
                    :min="0"
                    :max="6"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-money"></i> 薪资待遇
              </span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="基本工资" prop="salaryInfo.baseSalary">
                  <el-input-number
                    v-model="formData.salaryInfo.baseSalary"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="绩效工资" prop="salaryInfo.performanceSalary">
                  <el-input-number
                    v-model="formData.salaryInfo.performanceSalary"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="津贴补贴" prop="salaryInfo.allowance">
                  <el-input-number
                    v-model="formData.salaryInfo.allowance"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="试用期工资" prop="workInfo.probationSalary">
                  <el-input-number
                    v-model="formData.workInfo.probationSalary"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="社保基数" prop="salaryInfo.socialSecurityBase">
                  <el-input-number
                    v-model="formData.salaryInfo.socialSecurityBase"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="公积金基数" prop="salaryInfo.housingFundBase">
                  <el-input-number
                    v-model="formData.salaryInfo.housingFundBase"
                    :min="0"
                    :step="100"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="发薪周期" prop="salaryInfo.payCycle">
                  <el-select v-model="formData.salaryInfo.payCycle" style="width: 100%;">
                    <el-option label="月薪" value="monthly" />
                    <el-option label="周薪" value="weekly" />
                    <el-option label="双周薪" value="biweekly" />
                    <el-option label="时薪" value="hourly" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="发薪日" prop="salaryInfo.payDay">
                  <el-input-number
                    v-model="formData.salaryInfo.payDay"
                    :min="1"
                    :max="28"
                    style="width: 100%;"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-date"></i> 合同期限
              </span>
            </el-divider>

            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="合同类型" prop="type">
                  <el-select v-model="formData.type" style="width: 100%;" @change="handleTypeChange">
                    <el-option label="固定期限" value="fixed_term" />
                    <el-option label="无固定期限" value="open_ended" />
                    <el-option label="非全日制" value="part_time" />
                    <el-option label="试用期" value="probation" />
                    <el-option label="项目制" value="project" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="合同起始日" prop="startDate">
                  <el-date-picker
                    v-model="formData.startDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%;"
                    value-format="yyyy-MM-dd"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6" v-if="formData.type !== 'open_ended'">
                <el-form-item label="合同到期日" prop="endDate">
                  <el-date-picker
                    v-model="formData.endDate"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%;"
                    value-format="yyyy-MM-dd"
                    :disabled="formData.type === 'open_ended'"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="6" v-if="formData.type !== 'open_ended'">
                <el-form-item label="合同期限(月)" prop="termMonths">
                  <el-input-number
                    v-model="formData.termMonths"
                    :min="1"
                    :max="120"
                    style="width: 100%;"
                    @change="handleTermMonthsChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-document"></i> 其他信息
              </span>
            </el-divider>

            <el-form-item label="备注" prop="remarks">
              <el-input type="textarea" v-model="formData.remarks" :rows="3" placeholder="请输入备注信息" />
            </el-form-item>
          </el-form>

          <div class="step-actions">
            <el-button @click="goToStep(0)">上一步</el-button>
            <el-button type="primary" @click="handleNextStep">下一步</el-button>
          </div>
        </div>

        <div v-if="activeStep === 2" class="step-2">
          <h3>确认合同信息</h3>
          <p class="step-desc">请仔细核对以下合同信息，确认无误后提交审核</p>

          <el-descriptions title="员工信息" :column="2" border class="info-section">
            <el-descriptions-item label="姓名">{{ formData.userName }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ formData.workInfo.departmentName }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ formData.workInfo.position }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ formData.userIdCard }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ formData.userPhone }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱">{{ formData.userEmail }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="工作信息" :column="2" border class="info-section">
            <el-descriptions-item label="工作地点">{{ formData.workInfo.workLocation }}</el-descriptions-item>
            <el-descriptions-item label="工作时间">{{ formData.workInfo.workHours }}</el-descriptions-item>
            <el-descriptions-item label="工作天数">{{ formData.workInfo.workDays }}</el-descriptions-item>
            <el-descriptions-item label="试用期">
              {{ formData.workInfo.probationPeriod || 0 }}个月
            </el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="薪资待遇" :column="2" border class="info-section">
            <el-descriptions-item label="基本工资">¥{{ formData.salaryInfo.baseSalary?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="绩效工资">¥{{ formData.salaryInfo.performanceSalary?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="津贴补贴">¥{{ formData.salaryInfo.allowance?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="试用期工资">¥{{ formData.workInfo.probationSalary?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="社保基数">¥{{ formData.salaryInfo.socialSecurityBase?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="公积金基数">¥{{ formData.salaryInfo.housingFundBase?.toFixed(2) }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions title="合同期限" :column="2" border class="info-section">
            <el-descriptions-item label="合同类型">{{ contractTypeMap[formData.type] }}</el-descriptions-item>
            <el-descriptions-item label="合同编号">{{ formData.contractNo || '自动生成' }}</el-descriptions-item>
            <el-descriptions-item label="起始日期">{{ formData.startDate }}</el-descriptions-item>
            <el-descriptions-item label="到期日期">{{ formData.endDate || '长期' }}</el-descriptions-item>
            <el-descriptions-item label="合同期限">
              {{ formData.termMonths ? formData.termMonths + '个月' : '长期' }}
            </el-descriptions-item>
            <el-descriptions-item label="使用模板">{{ selectedTemplate?.name }}</el-descriptions-item>
          </el-descriptions>

          <div class="step-actions">
            <el-button @click="goToStep(1)">上一步</el-button>
            <el-button @click="handleSaveDraft">保存草稿</el-button>
            <el-button type="primary" @click="handleSubmit">提交审核</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import {
  getContract,
  createContract,
  updateContract,
  getAllContractTemplates,
  generateContractNo,
  submitContractForApproval
} from '@/api/contract'
import { contractTypeMap, mockDepartments, mockUsers } from '@/data/mockData'
import type {
  WorkerContract,
  ContractTemplate,
  ContractType,
  ContractWorkInfo,
  ContractSalaryInfo
} from '@/types'

export default Vue.extend({
  name: 'ContractForm',
  data() {
    return {
      activeStep: 1,
      isEdit: false,
      contractId: 0,
      templates: [] as ContractTemplate[],
      selectedTemplateId: 0,
      employeeList: [] as any[],
      departments: mockDepartments.filter(d => d.parentId !== null),
      contractTypeMap,
      formData: {
        contractNo: '',
        templateId: 0,
        templateName: '',
        type: 'fixed_term' as ContractType,
        status: 'draft' as any,
        
        userId: 0,
        userName: '',
        userIdCard: '',
        userPhone: '',
        userEmail: '',
        userAddress: '',
        
        workInfo: {
          position: '',
          departmentId: 0,
          departmentName: '',
          workLocation: '',
          workHours: '09:00-18:00',
          workDays: '周一至周五',
          probationPeriod: 3,
          probationSalary: 6000
        } as ContractWorkInfo,
        
        salaryInfo: {
          baseSalary: 8000,
          performanceSalary: 2000,
          overtimeSalary: 0,
          bonus: 0,
          allowance: 500,
          socialSecurityBase: 8000,
          housingFundBase: 8000,
          payCycle: 'monthly',
          payDay: 15
        } as ContractSalaryInfo,
        
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(1, 'year').format('YYYY-MM-DD'),
        termMonths: 12,
        
        renewalCount: 0,
        expirationReminderSent: false,
        
        approvalSteps: [] as any[],
        currentApprovalStep: 0,
        signatories: [] as any[],
        
        remarks: '',
        
        createdBy: 0,
        createdByName: ''
      },
      formRules: {
        userId: [{ required: true, message: '请选择员工', trigger: 'change' }],
        'workInfo.departmentId': [{ required: true, message: '请选择部门', trigger: 'change' }],
        'workInfo.position': [{ required: true, message: '请输入岗位', trigger: 'blur' }],
        'salaryInfo.baseSalary': [{ required: true, message: '请输入基本工资', trigger: 'blur' }],
        startDate: [{ required: true, message: '请选择起始日期', trigger: 'change' }],
        type: [{ required: true, message: '请选择合同类型', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission', 'user']),
    canSubmit(): boolean {
      return this.hasPermission('contract:submit') || this.isSalaryAdmin
    },
    selectedTemplate(): ContractTemplate | null {
      return this.templates.find(t => t.id === this.selectedTemplateId) || null
    }
  },
  async created() {
    this.employeeList = mockUsers.filter(u => u.status === 'active' && u.role === 'employee')
    
    await this.loadTemplates()
    
    const route = this.$route
    if (route.name === 'ContractEdit' && route.params.id) {
      this.isEdit = true
      this.contractId = parseInt(route.params.id)
      await this.loadContract()
    } else {
      this.isEdit = false
      this.formData.contractNo = generateContractNo()
      if (this.templates.length > 0) {
        const defaultTemplate = this.templates.find(t => t.isDefault)
        if (defaultTemplate) {
          this.selectedTemplateId = defaultTemplate.id
          this.formData.templateId = defaultTemplate.id
          this.formData.templateName = defaultTemplate.name
          this.formData.type = defaultTemplate.type
        }
      }
    }
    
    if (this.isEdit) {
      this.activeStep = 1
    }
  },
  methods: {
    async loadTemplates() {
      try {
        this.templates = await getAllContractTemplates()
      } catch (e) {
        this.$message.error('加载模板失败')
      }
    },
    async loadContract() {
      try {
        const contract = await getContract(this.contractId)
        if (contract) {
          this.formData = {
            ...contract,
            workInfo: { ...contract.workInfo },
            salaryInfo: { ...contract.salaryInfo },
            approvalSteps: [...contract.approvalSteps],
            signatories: [...contract.signatories]
          }
          this.selectedTemplateId = contract.templateId
        }
      } catch (e) {
        this.$message.error('加载合同数据失败')
      }
    },
    goBack() {
      this.$router.push('/contract/list')
    },
    goToStep(step: number) {
      if (step === 2) {
        const form = this.$refs.contractForm as any
        if (form) {
          form.validate((valid: boolean) => {
            if (valid) {
              this.activeStep = step
            } else {
              this.$message.warning('请完善表单信息')
            }
          })
          return
        }
      }
      this.activeStep = step
    },
    handleNextStep() {
      this.goToStep(2)
    },
    handleUserChange(userId: number) {
      const user = this.employeeList.find(u => u.id === userId)
      if (user) {
        this.formData.userName = user.name
        this.formData.userIdCard = user.idCard
        this.formData.userPhone = user.phone
        this.formData.userEmail = user.email
        this.formData.workInfo.departmentId = user.departmentId
        this.formData.workInfo.departmentName = user.departmentName
        this.formData.workInfo.position = user.position
      }
    },
    handleDepartmentChange(deptId: number) {
      const dept = this.departments.find(d => d.id === deptId)
      if (dept) {
        this.formData.workInfo.departmentName = dept.name
      }
    },
    handleTypeChange(type: ContractType) {
      if (type === 'open_ended') {
        this.formData.endDate = undefined
        this.formData.termMonths = undefined
      }
    },
    handleTermMonthsChange(months: number) {
      if (months && this.formData.startDate) {
        this.formData.endDate = dayjs(this.formData.startDate).add(months, 'month').format('YYYY-MM-DD')
      }
    },
    async handleSaveDraft() {
      try {
        if (this.isEdit) {
          await updateContract(this.contractId, this.formData as any)
          this.$message.success('草稿已保存')
        } else {
          this.formData.status = 'draft'
          this.formData.templateId = this.selectedTemplateId
          this.formData.templateName = this.selectedTemplate?.name || ''
          this.formData.createdBy = (this.user as any)?.id || 1
          this.formData.createdByName = (this.user as any)?.name || '系统'
          
          const res = await createContract(this.formData as any)
          this.isEdit = true
          this.contractId = res.id
          this.$message.success('草稿已保存')
        }
      } catch (e) {
        this.$message.error('保存失败')
      }
    },
    async handleSubmit() {
      this.$confirm('确定提交合同进入审核流程吗？', '提交审核', {
        type: 'warning'
      }).then(async () => {
        try {
          if (this.isEdit) {
            await updateContract(this.contractId, this.formData as any)
            await submitContractForApproval(this.contractId)
          } else {
            this.formData.status = 'draft'
            this.formData.templateId = this.selectedTemplateId
            this.formData.templateName = this.selectedTemplate?.name || ''
            this.formData.createdBy = (this.user as any)?.id || 1
            this.formData.createdByName = (this.user as any)?.name || '系统'
            
            const res = await createContract(this.formData as any)
            await submitContractForApproval(res.id)
          }
          this.$message.success('提交成功，等待审核')
          this.$router.push('/contract/list')
        } catch (e) {
          this.$message.error('提交失败')
        }
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.contract-form {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h2 {
      margin: 0;
      font-size: 18px;
      color: #303133;
    }
  }
  .form-steps {
    max-width: 600px;
    margin: 0 auto 30px;
  }
  .step-content {
    padding: 0 20px;
  }
  .step-desc {
    color: #909399;
    margin-bottom: 20px;
  }
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .template-radio {
    margin-right: 0;
    margin-bottom: 0;
    border: 2px solid #ebeef5;
    border-radius: 4px;
    padding: 12px 16px;
    &.is-checked {
      border-color: #409EFF;
      background: #ecf5ff;
    }
  }
  .template-item {
    .template-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .template-name {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
    .template-info {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #909399;
    }
  }
  .template-preview {
    margin-top: 24px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
    }
    .preview-content {
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.6;
      color: #606266;
      max-height: 300px;
      overflow-y: auto;
    }
  }
  .step-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 30px;
  }
  .divider-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    i {
      color: #409EFF;
      margin-right: 6px;
    }
  }
  .contract-form-el {
    padding: 0 10px;
  }
  .info-section {
    margin-bottom: 20px;
  }
}
</style>
