<template>
  <div class="contract-detail">
    <div class="page-card">
      <div class="page-header">
        <div class="header-left">
          <el-button icon="el-icon-arrow-left" @click="goBack">返回</el-button>
          <h2>合同详情</h2>
          <el-tag :type="getTagType(contract?.status)" size="medium" style="margin-left: 12px;">
            {{ contractStatusMap[contract?.status || 'draft'] }}
          </el-tag>
        </div>
        <div class="header-actions">
          <el-button @click="handleEdit" v-if="canEdit && ['draft', 'rejected'].includes(contract?.status || '')">编辑</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="canSubmit && contract?.status === 'draft'">提交审核</el-button>
          <el-button @click="handleRenew" v-if="canRenew && ['active', 'signed', 'expired'].includes(contract?.status || '')">续签</el-button>
          <el-button type="danger" @click="handleTerminate" v-if="canTerminate && ['active', 'signed'].includes(contract?.status || '')">终止合同</el-button>
          <el-button @click="handleArchive" v-if="canArchive && ['expired', 'terminated'].includes(contract?.status || '')">归档</el-button>
          <el-button type="text" icon="el-icon-download">下载合同</el-button>
        </div>
      </div>

      <div class="contract-no">
        <span class="label">合同编号：</span>
        <span class="value">{{ contract?.contractNo || '-' }}</span>
        <span class="divider">|</span>
        <span class="label">合同类型：</span>
        <span class="value">{{ contractTypeMap[contract?.type || 'fixed_term'] }}</span>
        <span class="divider">|</span>
        <span class="label">使用模板：</span>
        <span class="value">{{ contract?.templateName || '-' }}</span>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="2" border class="info-section">
            <template slot="title">
              <span class="section-title">
                <i class="el-icon-user"></i> 员工基本信息
              </span>
            </template>
            <el-descriptions-item label="姓名">{{ contract?.userName }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ contract?.workInfo?.departmentName }}</el-descriptions-item>
            <el-descriptions-item label="岗位">{{ contract?.workInfo?.position }}</el-descriptions-item>
            <el-descriptions-item label="身份证号">{{ contract?.userIdCard }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ contract?.userPhone }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱">{{ contract?.userEmail }}</el-descriptions-item>
            <el-descriptions-item label="家庭住址" :span="2">{{ contract?.userAddress }}</el-descriptions-item>
          </el-descriptions>

          <el-descriptions :column="2" border class="info-section">
            <template slot="title">
              <span class="section-title">
                <i class="el-icon-suitcase"></i> 工作信息
              </span>
            </template>
            <el-descriptions-item label="工作地点">{{ contract?.workInfo?.workLocation }}</el-descriptions-item>
            <el-descriptions-item label="工作时间">{{ contract?.workInfo?.workHours }}</el-descriptions-item>
            <el-descriptions-item label="工作天数">{{ contract?.workInfo?.workDays }}</el-descriptions-item>
            <el-descriptions-item label="试用期">
              {{ contract?.workInfo?.probationPeriod ? contract.workInfo.probationPeriod + '个月' : '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="试用期工资" v-if="contract?.workInfo?.probationPeriod">
              ¥{{ contract?.workInfo?.probationSalary?.toFixed(2) }}
            </el-descriptions-item>
          </el-descriptions>

          <el-descriptions :column="2" border class="info-section">
            <template slot="title">
              <span class="section-title">
                <i class="el-icon-money"></i> 薪资待遇
              </span>
            </template>
            <el-descriptions-item label="基本工资">¥{{ contract?.salaryInfo?.baseSalary?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="绩效工资">¥{{ contract?.salaryInfo?.performanceSalary?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="津贴补贴">¥{{ contract?.salaryInfo?.allowance?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="奖金">¥{{ contract?.salaryInfo?.bonus?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="社保基数">¥{{ contract?.salaryInfo?.socialSecurityBase?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="公积金基数">¥{{ contract?.salaryInfo?.housingFundBase?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="发薪周期">
              {{ payCycleMap[contract?.salaryInfo?.payCycle || 'monthly'] }}
            </el-descriptions-item>
            <el-descriptions-item label="发薪日">每月{{ contract?.salaryInfo?.payDay }}日</el-descriptions-item>
          </el-descriptions>

          <el-descriptions :column="2" border class="info-section">
            <template slot="title">
              <span class="section-title">
                <i class="el-icon-date"></i> 合同期限
              </span>
            </template>
            <el-descriptions-item label="合同类型">{{ contractTypeMap[contract?.type || 'fixed_term'] }}</el-descriptions-item>
            <el-descriptions-item label="合同状态">
              <el-tag :type="getTagType(contract?.status)" size="small">
                {{ contractStatusMap[contract?.status || 'draft'] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="起始日期">{{ contract?.startDate }}</el-descriptions-item>
            <el-descriptions-item label="到期日期">{{ contract?.endDate || '长期' }}</el-descriptions-item>
            <el-descriptions-item label="合同期限">
              {{ contract?.termMonths ? contract.termMonths + '个月' : '长期' }}
            </el-descriptions-item>
            <el-descriptions-item label="续签次数">{{ contract?.renewalCount || 0 }}次</el-descriptions-item>
            <el-descriptions-item label="上次续签" v-if="contract?.lastRenewalDate">
              {{ contract.lastRenewalDate }}
            </el-descriptions-item>
            <el-descriptions-item label="下次续签提醒" v-if="contract?.nextRenewalDate">
              {{ contract.nextRenewalDate }}
            </el-descriptions-item>
          </el-descriptions>

          <el-descriptions :column="2" border class="info-section" v-if="contract?.remarks">
            <template slot="title">
              <span class="section-title">
                <i class="el-icon-document"></i> 备注信息
              </span>
            </template>
            <el-descriptions-item label="备注" :span="2">{{ contract.remarks }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="审核流程" name="approval">
          <div class="approval-timeline">
            <el-timeline>
              <el-timeline-item
                v-for="(step, index) in contract?.approvalSteps || []"
                :key="step.id"
                :timestamp="step.approvedAt || '待处理'"
                :type="getApprovalStepType(step.status)"
                :icon="getApprovalStepIcon(step.status)"
              >
                <el-card shadow="never" class="step-card">
                  <div class="step-header">
                    <span class="step-title">第{{ step.stepOrder }}级审批</span>
                    <el-tag :type="getApprovalTagType(step.status)" size="mini">
                      {{ approvalStatusMap[step.status] }}
                    </el-tag>
                  </div>
                  <div class="step-info">
                    <span class="approver">审批人：{{ step.approverName }}</span>
                    <span class="role">{{ step.approverRole }}</span>
                  </div>
                  <div class="step-comment" v-if="step.comment">
                    <i class="el-icon-chat-dot-round"></i>
                    <span>{{ step.comment }}</span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            
            <div class="approval-actions" v-if="showApprovalActions">
              <el-divider content-position="left">审批操作</el-divider>
              <el-form label-width="80px">
                <el-form-item label="审批意见">
                  <el-input type="textarea" v-model="approvalComment" :rows="3" placeholder="请输入审批意见（可选）" />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" icon="el-icon-check" @click="handleApprove">通过</el-button>
                  <el-button type="danger" icon="el-icon-close" @click="handleReject">驳回</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="电子签名" name="signature">
          <div class="signature-section">
            <h4>签署方</h4>
            <div class="signatory-list">
              <div v-for="signatory in contract?.signatories || []" :key="signatory.id" class="signatory-item">
                <div class="signatory-info">
                  <span class="signatory-name">{{ signatory.userName }}</span>
                  <el-tag :type="signatory.status === 'signed' ? 'success' : 'warning'" size="mini">
                    {{ signatoryStatusMap[signatory.status] }}
                  </el-tag>
                  <span class="signatory-role">{{ signatoryRoleMap[signatory.role] }}</span>
                </div>
                <div class="signature-area" v-if="signatory.signatureData">
                  <img :src="signatory.signatureData" alt="签名" class="signature-img" />
                  <span class="sign-time">{{ signatory.signedAt }}</span>
                </div>
                <div class="signature-area pending" v-else>
                  <i class="el-icon-time"></i>
                  <span>等待签署</span>
                </div>
              </div>
            </div>

            <div class="sign-actions" v-if="canSign">
              <el-divider content-position="left">签署合同</el-divider>
              <div class="signature-pad-wrapper">
                <div class="signature-pad-header">
                  <span>请在下方区域手写签名</span>
                  <el-button size="small" @click="clearSignature">清除</el-button>
                </div>
                <canvas ref="signatureCanvas" class="signature-canvas" width="400" height="200"></canvas>
              </div>
              <el-button type="primary" @click="handleSign" :disabled="!hasSignature">确认签署</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="合同文本" name="content">
          <div class="contract-content">
            <div class="content-header">
              <h3>劳动合同</h3>
              <p class="contract-number">合同编号：{{ contract?.contractNo }}</p>
            </div>
            <div class="content-body">
              <p v-if="contract?.content" v-html="formatContractContent(contract.content)"></p>
              <div v-else class="no-content">
                <i class="el-icon-document"></i>
                <p>暂无合同文本内容</p>
              </div>
            </div>
            <div class="content-footer" v-if="contract?.status === 'signed' || contract?.status === 'active'">
              <div class="sign-block">
                <div class="party-a">
                  <p>甲方（盖章）：</p>
                  <p class="sign-name">{{ companyName }}</p>
                </div>
                <div class="party-b">
                  <p>乙方（签字）：</p>
                  <p class="sign-name">{{ contract?.userName }}</p>
                </div>
              </div>
              <p class="sign-date">签订日期：{{ contract?.signedAt }}</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作记录" name="history">
          <el-descriptions :column="2" border class="info-section">
            <el-descriptions-item label="创建人">{{ contract?.createdByName }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ contract?.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="最后更新">{{ contract?.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="签署时间" v-if="contract?.signedAt">{{ contract.signedAt }}</el-descriptions-item>
            <el-descriptions-item label="归档时间" v-if="contract?.archivedAt">{{ contract.archivedAt }}</el-descriptions-item>
            <el-descriptions-item label="终止时间" v-if="contract?.terminatedAt">{{ contract.terminatedAt }}</el-descriptions-item>
            <el-descriptions-item label="终止原因" v-if="contract?.terminationReason" :span="2">
              {{ contract.terminationReason }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="续签合同" :visible.sync="renewDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="原合同到期日">
          <span>{{ contract?.endDate }}</span>
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

    <el-dialog title="终止合同" :visible.sync="terminateDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="终止原因" required>
          <el-input type="textarea" v-model="terminateReason" placeholder="请输入终止原因" :rows="4" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="terminateDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="confirmTerminate">确认终止</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import {
  getContract,
  submitContractForApproval,
  approveContract,
  rejectContract,
  signContract,
  renewContract,
  terminateContract,
  archiveContract
} from '@/api/contract'
import { contractTypeMap, contractStatusMap, contractStatusTagMap } from '@/data/mockData'
import type { WorkerContract, ContractStatus, ApprovalStatus } from '@/types'

export default Vue.extend({
  name: 'ContractDetail',
  data() {
    return {
      contract: null as WorkerContract | null,
      activeTab: 'basic',
      loading: false,
      companyName: '某某有限公司',
      
      approvalComment: '',
      
      renewDialogVisible: false,
      renewEndDate: '',
      renewRemark: '',
      
      terminateDialogVisible: false,
      terminateReason: '',
      
      isDrawing: false,
      hasSignature: false,
      signatureCtx: null as any,
      
      payCycleMap: {
        monthly: '月薪',
        weekly: '周薪',
        biweekly: '双周薪',
        hourly: '时薪'
      },
      approvalStatusMap: {
        pending: '待审批',
        approved: '已通过',
        rejected: '已驳回'
      },
      signatoryStatusMap: {
        pending: '待签署',
        signed: '已签署',
        rejected: '已拒绝'
      },
      signatoryRoleMap: {
        employee: '员工',
        company_rep: '公司代表',
        hr: 'HR'
      },
      contractTypeMap,
      contractStatusMap
    }
  },
  computed: {
    ...mapGetters(['isSalaryAdmin', 'hasPermission', 'user']),
    canEdit(): boolean {
      return this.hasPermission('contract:edit') || this.isSalaryAdmin
    },
    canSubmit(): boolean {
      return this.hasPermission('contract:submit') || this.isSalaryAdmin
    },
    canRenew(): boolean {
      return this.hasPermission('contract:renew') || this.isSalaryAdmin
    },
    canTerminate(): boolean {
      return this.hasPermission('contract:terminate') || this.isSalaryAdmin
    },
    canArchive(): boolean {
      return this.hasPermission('contract:archive') || this.isSalaryAdmin
    },
    canSign(): boolean {
      if (!this.contract) return false
      if (!['approved', 'pending_approval'].includes(this.contract.status)) return false
      return this.hasPermission('contract:sign') || this.isSalaryAdmin
    },
    showApprovalActions(): boolean {
      if (!this.contract || this.contract.status !== 'pending_approval') return false
      if (!this.contract.approvalSteps || this.contract.approvalSteps.length === 0) return false
      const currentStep = this.contract.approvalSteps.find(s => s.status === 'pending')
      if (!currentStep) return false
      return this.isSalaryAdmin
    },
    currentApprovalStep(): number {
      return this.contract?.currentApprovalStep || 0
    }
  },
  mounted() {
    this.loadContract()
    this.$nextTick(() => {
      this.initSignatureCanvas()
    })
  },
  watch: {
    activeTab(val) {
      if (val === 'signature') {
        this.$nextTick(() => {
          this.initSignatureCanvas()
        })
      }
    }
  },
  methods: {
    getTagType(status?: ContractStatus): string {
      if (!status) return 'info'
      return contractStatusTagMap[status] || 'info'
    },
    getApprovalStepType(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return map[status] || 'info'
    },
    getApprovalTagType(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger'
      }
      return map[status] || 'info'
    },
    getApprovalStepIcon(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'el-icon-time',
        approved: 'el-icon-check',
        rejected: 'el-icon-close'
      }
      return map[status] || 'el-icon-dot'
    },
    async loadContract() {
      const id = this.$route.params.id
      if (!id) return
      this.loading = true
      try {
        const contract = await getContract(parseInt(id))
        this.contract = contract
      } catch (e) {
        this.$message.error('加载合同详情失败')
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push('/contract/list')
    },
    handleEdit() {
      this.$router.push(`/contract/edit/${this.contract?.id}`)
    },
    handleSubmit() {
      if (!this.contract) return
      this.$confirm('确定提交合同进入审核流程吗？', '提交审核', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await submitContractForApproval(this.contract.id)
          if (res) {
            this.$message.success('提交成功')
            this.loadContract()
          }
        } catch (e) {
          this.$message.error('提交失败')
        }
      }).catch(() => {})
    },
    handleApprove() {
      if (!this.contract || this.currentApprovalStep === 0) return
      this.$confirm('确定通过该合同的审批吗？', '审批通过', {
        type: 'success'
      }).then(async () => {
        try {
          const res = await approveContract(this.contract.id, this.currentApprovalStep, this.approvalComment)
          if (res) {
            this.$message.success('审批通过')
            this.approvalComment = ''
            this.loadContract()
          }
        } catch (e) {
          this.$message.error('操作失败')
        }
      }).catch(() => {})
    },
    handleReject() {
      if (!this.contract || this.currentApprovalStep === 0) return
      if (!this.approvalComment.trim()) {
        this.$message.warning('请输入驳回原因')
        return
      }
      this.$confirm('确定驳回该合同的审批吗？', '审批驳回', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await rejectContract(this.contract.id, this.currentApprovalStep, this.approvalComment)
          if (res) {
            this.$message.success('已驳回')
            this.approvalComment = ''
            this.loadContract()
          }
        } catch (e) {
          this.$message.error('操作失败')
        }
      }).catch(() => {})
    },
    handleRenew() {
      if (!this.contract) return
      this.renewEndDate = this.contract.endDate 
        ? dayjs(this.contract.endDate).add(1, 'year').format('YYYY-MM-DD')
        : dayjs().add(1, 'year').format('YYYY-MM-DD')
      this.renewRemark = ''
      this.renewDialogVisible = true
    },
    async confirmRenew() {
      if (!this.renewEndDate) {
        this.$message.warning('请选择新的到期日期')
        return
      }
      if (!this.contract) return
      try {
        const res = await renewContract(this.contract.id, this.renewEndDate)
        if (res) {
          this.$message.success('续签成功')
          this.renewDialogVisible = false
          this.loadContract()
        }
      } catch (e) {
        this.$message.error('续签失败')
      }
    },
    handleTerminate() {
      this.terminateReason = ''
      this.terminateDialogVisible = true
    },
    async confirmTerminate() {
      if (!this.terminateReason.trim()) {
        this.$message.warning('请输入终止原因')
        return
      }
      if (!this.contract) return
      try {
        const res = await terminateContract(this.contract.id, this.terminateReason)
        if (res) {
          this.$message.success('合同已终止')
          this.terminateDialogVisible = false
          this.loadContract()
        }
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    handleArchive() {
      if (!this.contract) return
      this.$confirm('确定归档该合同吗？归档后将不能再编辑。', '归档确认', {
        type: 'warning'
      }).then(async () => {
        try {
          const res = await archiveContract(this.contract.id)
          if (res) {
            this.$message.success('归档成功')
            this.loadContract()
          }
        } catch (e) {
          this.$message.error('归档失败')
        }
      }).catch(() => {})
    },
    initSignatureCanvas() {
      const canvas = this.$refs.signatureCanvas as HTMLCanvasElement
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      this.signatureCtx = ctx
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      
      canvas.addEventListener('mousedown', this.startDrawing)
      canvas.addEventListener('mousemove', this.draw)
      canvas.addEventListener('mouseup', this.stopDrawing)
      canvas.addEventListener('mouseleave', this.stopDrawing)
      
      canvas.addEventListener('touchstart', this.startDrawing)
      canvas.addEventListener('touchmove', this.draw)
      canvas.addEventListener('touchend', this.stopDrawing)
    },
    startDrawing(e: MouseEvent | TouchEvent) {
      e.preventDefault()
      this.isDrawing = true
      const canvas = this.$refs.signatureCanvas as HTMLCanvasElement
      const ctx = this.signatureCtx
      if (!canvas || !ctx) return
      
      const rect = canvas.getBoundingClientRect()
      let x, y
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left
        y = e.touches[0].clientY - rect.top
      } else {
        x = e.clientX - rect.left
        y = e.clientY - rect.top
      }
      
      ctx.beginPath()
      ctx.moveTo(x, y)
    },
    draw(e: MouseEvent | TouchEvent) {
      if (!this.isDrawing) return
      e.preventDefault()
      const canvas = this.$refs.signatureCanvas as HTMLCanvasElement
      const ctx = this.signatureCtx
      if (!canvas || !ctx) return
      
      const rect = canvas.getBoundingClientRect()
      let x, y
      if ('touches' in e) {
        x = e.touches[0].clientX - rect.left
        y = e.touches[0].clientY - rect.top
      } else {
        x = e.clientX - rect.left
        y = e.clientY - rect.top
      }
      
      ctx.lineTo(x, y)
      ctx.stroke()
      this.hasSignature = true
    },
    stopDrawing() {
      this.isDrawing = false
    },
    clearSignature() {
      const canvas = this.$refs.signatureCanvas as HTMLCanvasElement
      const ctx = this.signatureCtx
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasSignature = false
    },
    async handleSign() {
      if (!this.contract) return
      if (!this.hasSignature) {
        this.$message.warning('请先签名')
        return
      }
      
      const canvas = this.$refs.signatureCanvas as HTMLCanvasElement
      const signatureData = canvas.toDataURL('image/png')
      
      const signatory = this.contract.signatories.find(s => s.status === 'pending')
      if (!signatory) {
        this.$message.warning('没有待签署的签署方')
        return
      }
      
      try {
        const res = await signContract(this.contract.id, signatory.id, signatureData)
        if (res) {
          this.$message.success('签署成功')
          this.clearSignature()
          this.loadContract()
        }
      } catch (e) {
        this.$message.error('签署失败')
      }
    },
    formatContractContent(content: string): string {
      return content
        .replace(/\n/g, '<br>')
        .replace(/ /g, '&nbsp;')
    }
  }
})
</script>

<style lang="scss" scoped>
.contract-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
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
  .contract-no {
    padding: 12px 16px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 14px;
    .label {
      color: #909399;
    }
    .value {
      color: #303133;
      font-weight: 500;
    }
    .divider {
      margin: 0 12px;
      color: #dcdfe6;
    }
  }
  .detail-tabs {
    margin-top: 20px;
  }
  .info-section {
    margin-bottom: 20px;
  }
  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    i {
      color: #409EFF;
      margin-right: 6px;
    }
  }
  .approval-timeline {
    padding: 20px;
    .step-card {
      margin-bottom: 0;
      border: none;
      background: #f5f7fa;
    }
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .step-title {
      font-weight: 500;
      color: #303133;
    }
    .step-info {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #606266;
      .role {
        color: #909399;
      }
    }
    .step-comment {
      margin-top: 10px;
      padding: 8px 12px;
      background: #fff;
      border-radius: 4px;
      font-size: 13px;
      color: #606266;
      i {
        color: #409EFF;
        margin-right: 4px;
      }
    }
  }
  .approval-actions {
    margin-top: 20px;
    padding: 20px;
    background: #f0f9eb;
    border-radius: 4px;
  }
  .signature-section {
    padding: 20px;
    h4 {
      margin: 0 0 16px 0;
      font-size: 15px;
    }
  }
  .signatory-list {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
  }
  .signatory-item {
    min-width: 200px;
    .signatory-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    .signatory-name {
      font-weight: 500;
    }
    .signatory-role {
      font-size: 12px;
      color: #909399;
    }
    .signature-area {
      width: 200px;
      height: 100px;
      border: 1px dashed #dcdfe6;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      &.pending {
        color: #c0c4cc;
        i {
          font-size: 24px;
          margin-bottom: 4px;
        }
        span {
          font-size: 12px;
        }
      }
      .signature-img {
        max-width: 180px;
        max-height: 60px;
      }
      .sign-time {
        font-size: 11px;
        color: #909399;
        margin-top: 4px;
      }
    }
  }
  .sign-actions {
    margin-top: 30px;
  }
  .signature-pad-wrapper {
    margin-bottom: 16px;
  }
  .signature-pad-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    color: #606266;
  }
  .signature-canvas {
    width: 100%;
    max-width: 400px;
    height: 200px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    cursor: crosshair;
  }
  .contract-content {
    max-width: 700px;
    margin: 0 auto;
    padding: 40px;
    background: #fff;
    border: 1px solid #ebeef5;
    .content-header {
      text-align: center;
      margin-bottom: 30px;
      h3 {
        margin: 0 0 10px 0;
        font-size: 24px;
      }
      .contract-number {
        color: #909399;
        font-size: 13px;
      }
    }
    .content-body {
      line-height: 2;
      font-size: 14px;
      color: #303133;
      text-align: justify;
    }
    .no-content {
      text-align: center;
      padding: 60px 0;
      color: #909399;
      i {
        font-size: 48px;
        margin-bottom: 10px;
      }
    }
    .content-footer {
      margin-top: 60px;
      .sign-block {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        .sign-name {
          margin-top: 20px;
          font-weight: 500;
        }
      }
      .sign-date {
        text-align: right;
        color: #606266;
      }
    }
  }
}
</style>
