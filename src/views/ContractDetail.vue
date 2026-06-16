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
          <div class="approval-section">
            <div class="approval-overview" v-if="contract?.approvalSteps && contract.approvalSteps.length > 0">
              <el-row :gutter="16">
                <el-col :span="6">
                  <div class="overview-card">
                    <div class="overview-icon status-icon">
                      <i :class="getApprovalStatusIcon(contract.status)"></i>
                    </div>
                    <div class="overview-content">
                      <div class="overview-label">当前状态</div>
                      <div class="overview-value">
                        <el-tag :type="getApprovalStatusTagType(contract.status)" size="medium">
                          {{ approvalStatusMap[getCurrentStep()?.status || 'pending'] || contractStatusMap[contract.status] }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="overview-card">
                    <div class="overview-icon approver-icon">
                      <i class="el-icon-user"></i>
                    </div>
                    <div class="overview-content">
                      <div class="overview-label">当前审批人</div>
                      <div class="overview-value">
                        <span v-if="getCurrentStep()">{{ getCurrentStep()?.approverName }}（{{ approvalRoleMap[getCurrentStep()?.approverRole || ''] || getCurrentStep()?.approverRoleName }}）</span>
                        <span v-else class="text-muted">-</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="overview-card">
                    <div class="overview-icon progress-icon">
                      <i class="el-icon-s-order"></i>
                    </div>
                    <div class="overview-content">
                      <div class="overview-label">审批进度</div>
                      <div class="overview-value">
                        {{ getCompletedStepCount() }} / {{ contract.approvalSteps.length }} 步
                      </div>
                      <el-progress 
                        :percentage="Math.round((getCompletedStepCount() / contract.approvalSteps.length) * 100)" 
                        :stroke-width="6"
                        :show-text="false"
                        style="margin-top: 4px;"
                      />
                    </div>
                  </div>
                </el-col>
                <el-col :span="6">
                  <div class="overview-card">
                    <div class="overview-icon deadline-icon">
                      <i class="el-icon-time"></i>
                    </div>
                    <div class="overview-content">
                      <div class="overview-label">剩余时间</div>
                      <div class="overview-value">
                        <span v-if="getCurrentStep()?.deadline" :class="{'text-danger': isDeadlineNear(getCurrentStep()?.deadline)}">
                          {{ getRemainingTime(getCurrentStep()?.deadline) }}
                        </span>
                        <span v-else class="text-muted">无时限</span>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-location-outline"></i> 审核步骤
              </span>
            </el-divider>

            <div class="approval-steps">
              <div 
                v-for="(step, index) in contract?.approvalSteps || []" 
                :key="step.id"
                class="step-item"
                :class="{ 'step-current': step.status === 'pending', 'step-completed': step.status === 'approved' }"
              >
                <div class="step-timeline">
                  <div class="step-node" :class="getStepNodeClass(step.status)">
                    <i :class="getStepIcon(step.status)"></i>
                  </div>
                  <div class="step-line" v-if="index < (contract?.approvalSteps?.length || 0) - 1"></div>
                </div>
                <div class="step-content-wrapper">
                  <el-card shadow="never" class="step-card" :class="getStepCardClass(step.status)">
                    <div class="step-header">
                      <div class="step-title-row">
                        <span class="step-order">第{{ step.stepOrder }}步</span>
                        <span class="step-name">{{ step.stepName }}</span>
                        <el-tag :type="getApprovalTagType(step.status)" size="mini" class="step-status-tag">
                          {{ approvalStatusMap[step.status] }}
                        </el-tag>
                      </div>
                      <div class="step-actions" v-if="step.status === 'pending' && isApprover(step)">
                        <el-dropdown @command="(cmd) => handleAdvancedAction(cmd, step)" trigger="click">
                          <el-button size="mini" type="text" icon="el-icon-more">
                            高级操作
                            <i class="el-icon-arrow-down el-icon--right"></i>
                          </el-button>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="delegate" v-if="canDelegate(step)" icon="el-icon-user">
                              委托审批
                            </el-dropdown-item>
                            <el-dropdown-item command="return" v-if="canReturn(step)" icon="el-icon-refresh-left">
                              退回审批
                            </el-dropdown-item>
                            <el-dropdown-item command="addSign" v-if="canAddSign(step)" icon="el-icon-plus">
                              加签审批
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                      </div>
                    </div>
                    <div class="step-info">
                      <div class="info-row">
                        <span class="info-item">
                          <i class="el-icon-user"></i>
                          <span class="info-label">审批人：</span>
                          <span class="info-value">{{ step.approverName }}</span>
                          <span class="info-role">（{{ approvalRoleMap[step.approverRole] || step.approverRoleName }}）</span>
                        </span>
                        <span class="info-item">
                          <i class="el-icon-setting"></i>
                          <span class="info-label">审批模式：</span>
                          <span class="info-value">{{ approvalModeMap[step.mode] }}</span>
                        </span>
                        <span class="info-item" v-if="step.deadline">
                          <i class="el-icon-time"></i>
                          <span class="info-label">审批时限：</span>
                          <span class="info-value">{{ formatDeadline(step.deadline) }}</span>
                        </span>
                      </div>
                      <div class="condition-tag" v-if="formatApprovalStepConditions(step)">
                        <i class="el-icon-warning"></i>
                        <span>条件：{{ formatApprovalStepConditions(step) }}</span>
                      </div>
                      <div class="delegated-info" v-if="step.status === 'delegated'">
                        <i class="el-icon-user"></i>
                        <span>已委托给 {{ step.delegatedToName }} 处理</span>
                        <span class="delegated-time">{{ step.delegatedAt }}</span>
                      </div>
                      <div class="returned-info" v-if="step.status === 'returned'">
                        <i class="el-icon-refresh-left"></i>
                        <span>已退回到第 {{ step.returnedTo }} 步</span>
                        <span class="returned-reason">原因：{{ step.returnedReason }}</span>
                      </div>
                      <div class="add-signers" v-if="step.addSigners && step.addSigners.length > 0">
                        <el-divider dashed style="margin: 12px 0;" />
                        <div class="add-signers-title">
                          <i class="el-icon-user-plus"></i> 加签人员：
                        </div>
                        <div v-for="signer in step.addSigners" :key="signer.id" class="add-signer-item">
                          <span>{{ signer.name }}</span>
                          <el-tag size="mini" :type="signer.status === 'approved' ? 'success' : 'warning'">
                            {{ signer.status === 'approved' ? '已同意' : '待审批' }}
                          </el-tag>
                          <span class="signer-comment" v-if="signer.comment">（{{ signer.comment }}）</span>
                        </div>
                      </div>
                      <div class="step-comment" v-if="step.comment">
                        <div class="comment-label">
                          <i class="el-icon-chat-dot-round"></i> 审批意见：
                        </div>
                        <div class="comment-content">{{ step.comment }}</div>
                        <div class="comment-time" v-if="step.approvedAt">{{ step.approvedAt }}</div>
                      </div>
                    </div>
                  </el-card>
                </div>
              </div>
            </div>

            <div class="approval-actions" v-if="showApprovalActions">
              <el-divider content-position="left">
                <span class="divider-title">
                  <i class="el-icon-edit-outline"></i> 审批操作
                </span>
              </el-divider>
              <el-form label-width="80px">
                <el-form-item label="审批意见">
                  <el-input 
                    type="textarea" 
                    v-model="approvalComment" 
                    :rows="3" 
                    placeholder="请输入审批意见（驳回时必填）" 
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="success" icon="el-icon-check" @click="handleApprove">通过</el-button>
                  <el-button type="danger" icon="el-icon-close" @click="handleReject">驳回</el-button>
                  <el-dropdown @command="(cmd) => handleAdvancedAction(cmd, getCurrentStep())" trigger="click">
                    <el-button icon="el-icon-more">
                      高级操作
                      <i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item command="delegate" v-if="canDelegate(getCurrentStep())" icon="el-icon-user">
                        委托审批
                      </el-dropdown-item>
                      <el-dropdown-item command="return" v-if="canReturn(getCurrentStep())" icon="el-icon-refresh-left">
                        退回审批
                      </el-dropdown-item>
                      <el-dropdown-item command="addSign" v-if="canAddSign(getCurrentStep())" icon="el-icon-plus">
                        加签审批
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </el-form-item>
              </el-form>
            </div>

            <el-divider content-position="left">
              <span class="divider-title">
                <i class="el-icon-time"></i> 审批时间线
              </span>
            </el-divider>

            <div class="approval-timeline">
              <div v-loading="timelineLoading">
                <el-timeline>
                  <el-timeline-item
                    v-for="item in approvalTimeline"
                    :key="item.id"
                    :timestamp="item.timestamp"
                    :type="getTimelineItemType(item.action)"
                    :icon="getTimelineItemIcon(item.action)"
                  >
                    <el-card shadow="never" class="timeline-card">
                      <div class="timeline-header">
                        <span class="timeline-action">{{ getTimelineActionText(item.action) }}</span>
                        <span class="timeline-operator">
                          {{ item.operatorName }}（{{ item.operatorRole }}）
                        </span>
                      </div>
                      <div class="timeline-step" v-if="item.stepName">
                        <el-tag size="mini" type="info">第{{ item.stepOrder }}步 - {{ item.stepName }}</el-tag>
                      </div>
                      <div class="timeline-delegate" v-if="item.action === 'delegate'">
                        <i class="el-icon-arrow-right"></i>
                        <span>委托给：{{ item.toUser }}</span>
                      </div>
                      <div class="timeline-comment" v-if="item.comment">
                        <i class="el-icon-chat-dot-round"></i>
                        <span>{{ item.comment }}</span>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
                <div class="no-timeline" v-if="approvalTimeline.length === 0 && !timelineLoading">
                  <i class="el-icon-document"></i>
                  <p>暂无审批记录</p>
                </div>
              </div>
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

    <el-dialog title="委托审批" :visible.sync="delegateDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="当前步骤">
          <span>第{{ getCurrentStep()?.stepOrder }}步 - {{ getCurrentStep()?.stepName }}</span>
        </el-form-item>
        <el-form-item label="委托人" required>
          <el-select v-model="delegateToUserId" placeholder="请选择委托人" style="width: 100%;" filterable>
            <el-option
              v-for="u in allUsers.filter(item => item.id !== this.user?.id)"
              :key="u.id"
              :label="`${u.name}（${u.departmentName} - ${u.position}）`"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="委托原因" required>
          <el-input type="textarea" v-model="delegateReason" placeholder="请输入委托原因" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="delegateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmDelegate" :disabled="!delegateToUserId || !delegateReason.trim()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="退回审批" :visible.sync="returnDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="当前步骤">
          <span>第{{ getCurrentStep()?.stepOrder }}步 - {{ getCurrentStep()?.stepName }}</span>
        </el-form-item>
        <el-form-item label="退回到" required>
          <el-select v-model="returnToStepOrder" placeholder="请选择退回的步骤" style="width: 100%;">
            <el-option
              v-for="step in getReturnableSteps()"
              :key="step.stepOrder"
              :label="`第${step.stepOrder}步 - ${step.stepName}`"
              :value="step.stepOrder"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退回原因" required>
          <el-input type="textarea" v-model="returnReason" placeholder="请输入退回原因" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="returnDialogVisible = false">取 消</el-button>
        <el-button type="warning" @click="confirmReturn" :disabled="!returnToStepOrder || !returnReason.trim()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="加签审批" :visible.sync="addSignDialogVisible" width="480px">
      <el-form label-width="100px">
        <el-form-item label="当前步骤">
          <span>第{{ getCurrentStep()?.stepOrder }}步 - {{ getCurrentStep()?.stepName }}</span>
        </el-form-item>
        <el-form-item label="加签人" required>
          <el-select v-model="addSignUserId" placeholder="请选择加签人" style="width: 100%;" filterable>
            <el-option
              v-for="u in allUsers.filter(item => item.id !== this.user?.id)"
              :key="u.id"
              :label="`${u.name}（${u.departmentName} - ${u.position}）`"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="意见">
          <el-input type="textarea" v-model="addSignComment" placeholder="请输入加签意见（可选）" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addSignDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddSign" :disabled="!addSignUserId">确 定</el-button>
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
  archiveContract,
  delegateApproval,
  returnApproval,
  addSignatory,
  getApprovalTimeline,
  ApprovalPermissionException
} from '@/api/contract'
import { 
  contractTypeMap, 
  contractStatusMap, 
  contractStatusTagMap,
  approvalModeMap,
  approvalRoleMap,
  mockUsers
} from '@/data/mockData'
import type { WorkerContract, ContractStatus, ApprovalStatus, ApprovalStep } from '@/types'

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
      
      approvalTimeline: [] as any[],
      timelineLoading: false,
      delegateDialogVisible: false,
      returnDialogVisible: false,
      addSignDialogVisible: false,
      delegateToUserId: 0,
      delegateReason: '',
      returnToStepOrder: 1,
      returnReason: '',
      addSignUserId: 0,
      addSignComment: '',
      allUsers: mockUsers as any[],
      approvalModeMap,
      approvalRoleMap,
      approvalStatusMap: {
        pending: '待审批',
        approved: '已通过',
        rejected: '已驳回',
        delegated: '已委托',
        returned: '已退回',
        cancelled: '已取消'
      },
      
      payCycleMap: {
        monthly: '月薪',
        weekly: '周薪',
        biweekly: '双周薪',
        hourly: '时薪'
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
    ...mapGetters(['isSuperAdmin', 'isAdmin', 'isSalaryAdmin', 'hasPermission', 'user']),
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
      const currentStep = this.getCurrentStep()
      if (!currentStep) return false
      return this.isApprover(currentStep)
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
      if (val === 'approval') {
        this.loadApprovalTimeline()
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
        rejected: 'danger',
        delegated: 'info',
        returned: 'warning'
      }
      return map[status] || 'info'
    },
    getApprovalTagType(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        delegated: 'info',
        returned: 'warning'
      }
      return map[status] || 'info'
    },
    getApprovalStepIcon(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'el-icon-time',
        approved: 'el-icon-check',
        rejected: 'el-icon-close',
        delegated: 'el-icon-user',
        returned: 'el-icon-refresh-left'
      }
      return map[status] || 'el-icon-dot'
    },
    getApprovalStatusIcon(status: ContractStatus): string {
      if (status === 'pending_approval') return 'el-icon-time'
      if (status === 'approved' || status === 'signed' || status === 'active') return 'el-icon-circle-check'
      if (status === 'rejected' || status === 'terminated') return 'el-icon-circle-close'
      return 'el-icon-document'
    },
    getApprovalStatusTagType(status: ContractStatus): string {
      if (status === 'pending_approval') return 'warning'
      if (status === 'approved' || status === 'signed' || status === 'active') return 'success'
      if (status === 'rejected' || status === 'terminated') return 'danger'
      return 'info'
    },
    getStepNodeClass(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'node-pending',
        approved: 'node-approved',
        rejected: 'node-rejected',
        delegated: 'node-delegated',
        returned: 'node-returned'
      }
      return map[status] || 'node-pending'
    },
    getStepCardClass(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'card-pending',
        approved: 'card-approved',
        rejected: 'card-rejected',
        delegated: 'card-delegated',
        returned: 'card-returned'
      }
      return map[status] || ''
    },
    getStepIcon(status: ApprovalStatus): string {
      const map: Record<string, string> = {
        pending: 'el-icon-more',
        approved: 'el-icon-check',
        rejected: 'el-icon-close',
        delegated: 'el-icon-user',
        returned: 'el-icon-refresh-left'
      }
      return map[status] || 'el-icon-dot'
    },
    getTimelineItemType(action: string): string {
      const map: Record<string, string> = {
        submit: 'primary',
        approve: 'success',
        reject: 'danger',
        delegate: 'info',
        return: 'warning',
        add_sign: 'info',
        complete: 'success'
      }
      return map[action] || 'primary'
    },
    getTimelineItemIcon(action: string): string {
      const map: Record<string, string> = {
        submit: 'el-icon-upload',
        approve: 'el-icon-circle-check',
        reject: 'el-icon-circle-close',
        delegate: 'el-icon-user',
        return: 'el-icon-refresh-left',
        add_sign: 'el-icon-user-plus',
        complete: 'el-icon-ok'
      }
      return map[action] || 'el-icon-dot'
    },
    getTimelineActionText(action: string): string {
      const map: Record<string, string> = {
        submit: '提交审核',
        approve: '审核通过',
        reject: '审核驳回',
        delegate: '委托审批',
        return: '退回审批',
        add_sign: '加签审批',
        complete: '审核完成'
      }
      return map[action] || action
    },
    getCompletedStepCount(): number {
      if (!this.contract?.approvalSteps) return 0
      return this.contract.approvalSteps.filter(s => s.status === 'approved').length
    },
    getCurrentStep(): ApprovalStep | undefined {
      if (!this.contract?.approvalSteps) return undefined
      return this.contract.approvalSteps.find(s => s.status === 'pending')
    },
    getReturnableSteps(): ApprovalStep[] {
      if (!this.contract?.approvalSteps) return []
      const currentStep = this.getCurrentStep()
      if (!currentStep) return []
      return this.contract.approvalSteps.filter(s => s.stepOrder < currentStep.stepOrder)
    },
    isApprover(step?: ApprovalStep): boolean {
      if (!step || !this.user) return false
      if (step.status !== 'pending') return false
      if (this.isSuperAdmin || this.isAdmin) return true
      if (step.approverId === this.user.id) return true
      if (step.approverRole === this.user.role) return true
      if (step.delegatedTo === this.user.id) return true
      return false
    },
    canDelegate(step?: ApprovalStep): boolean {
      if (!step) return false
      if (!this.isApprover(step)) return false
      return (step as any).canDelegate !== false
    },
    canReturn(step?: ApprovalStep): boolean {
      if (!step) return false
      if (!this.isApprover(step)) return false
      if (step.stepOrder <= 1) return false
      return (step as any).canReturn !== false
    },
    canAddSign(step?: ApprovalStep): boolean {
      if (!step) return false
      if (!this.isApprover(step)) return false
      return (step as any).canAddSign !== false
    },
    formatApprovalStepConditions(step: ApprovalStep): string {
      const conditions = (step as any).conditions
      if (!conditions || conditions.length === 0) return ''
      return conditions.map((c: any) => c.description).join('，')
    },
    formatDeadline(deadline: string): string {
      if (!deadline) return ''
      return dayjs(deadline).format('YYYY-MM-DD HH:mm')
    },
    getRemainingTime(deadline?: string): string {
      if (!deadline) return ''
      const now = dayjs()
      const deadlineTime = dayjs(deadline)
      const diffHours = deadlineTime.diff(now, 'hour')
      if (diffHours < 0) return '已超时'
      if (diffHours < 24) return `${diffHours}小时`
      const diffDays = Math.floor(diffHours / 24)
      const remainingHours = diffHours % 24
      if (remainingHours === 0) return `${diffDays}天`
      return `${diffDays}天${remainingHours}小时`
    },
    isDeadlineNear(deadline?: string): boolean {
      if (!deadline) return false
      const now = dayjs()
      const deadlineTime = dayjs(deadline)
      const diffHours = deadlineTime.diff(now, 'hour')
      return diffHours < 24
    },
    handleApprovalError(error: any): void {
      if (error instanceof ApprovalPermissionException) {
        this.$message.error(error.error.message)
      } else if (error && error.message) {
        this.$message.error(error.message)
      } else {
        this.$message.error('操作失败，请稍后重试')
      }
    },
    handleAdvancedAction(command: string, step?: ApprovalStep) {
      if (!step) return
      if (command === 'delegate') {
        this.handleDelegate()
      } else if (command === 'return') {
        this.handleReturn()
      } else if (command === 'addSign') {
        this.handleAddSign()
      }
    },
    async loadApprovalTimeline() {
      if (!this.contract) return
      this.timelineLoading = true
      try {
        const timeline = await getApprovalTimeline(this.contract.id)
        this.approvalTimeline = timeline
      } catch (e) {
        this.$message.error('加载审批时间线失败')
      } finally {
        this.timelineLoading = false
      }
    },
    handleDelegate() {
      this.delegateToUserId = 0
      this.delegateReason = ''
      this.delegateDialogVisible = true
    },
    async confirmDelegate() {
      if (!this.contract || !this.getCurrentStep()) return
      if (!this.delegateToUserId) {
        this.$message.warning('请选择委托人')
        return
      }
      if (!this.delegateReason.trim()) {
        this.$message.warning('请输入委托原因')
        return
      }
      const delegateToUser = this.allUsers.find(u => u.id === this.delegateToUserId)
      if (!delegateToUser) return
      try {
        const res = await delegateApproval(
          this.contract.id,
          this.getCurrentStep()!.stepOrder,
          this.delegateToUserId,
          delegateToUser.name,
          this.delegateReason
        )
        if (res) {
          this.$message.success('委托成功')
          this.delegateDialogVisible = false
          this.loadContract()
          this.loadApprovalTimeline()
        }
      } catch (e) {
        this.handleApprovalError(e)
      }
    },
    handleReturn() {
      this.returnToStepOrder = 1
      this.returnReason = ''
      this.returnDialogVisible = true
    },
    async confirmReturn() {
      if (!this.contract || !this.getCurrentStep()) return
      if (!this.returnToStepOrder) {
        this.$message.warning('请选择退回的步骤')
        return
      }
      if (!this.returnReason.trim()) {
        this.$message.warning('请输入退回原因')
        return
      }
      try {
        const res = await returnApproval(
          this.contract.id,
          this.getCurrentStep()!.stepOrder,
          this.returnToStepOrder,
          this.returnReason
        )
        if (res) {
          this.$message.success('退回成功')
          this.returnDialogVisible = false
          this.loadContract()
          this.loadApprovalTimeline()
        }
      } catch (e) {
        this.handleApprovalError(e)
      }
    },
    handleAddSign() {
      this.addSignUserId = 0
      this.addSignComment = ''
      this.addSignDialogVisible = true
    },
    async confirmAddSign() {
      if (!this.contract || !this.getCurrentStep()) return
      if (!this.addSignUserId) {
        this.$message.warning('请选择加签人')
        return
      }
      const addSignUser = this.allUsers.find(u => u.id === this.addSignUserId)
      if (!addSignUser) return
      try {
        const res = await addSignatory(
          this.contract.id,
          this.getCurrentStep()!.stepOrder,
          this.addSignUserId,
          addSignUser.name,
          this.addSignComment
        )
        if (res) {
          this.$message.success('加签成功')
          this.addSignDialogVisible = false
          this.loadContract()
          this.loadApprovalTimeline()
        }
      } catch (e) {
        this.handleApprovalError(e)
      }
    },
    async loadContract() {
      const id = this.$route.params.id
      if (!id) return
      this.loading = true
      try {
        const contract = await getContract(parseInt(id))
        this.contract = contract
        if (this.activeTab === 'approval') {
          this.loadApprovalTimeline()
        }
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
            this.loadApprovalTimeline()
          }
        } catch (e) {
          this.handleApprovalError(e)
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
            this.loadApprovalTimeline()
          }
        } catch (e) {
          this.handleApprovalError(e)
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
  .divider-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    i {
      color: #409EFF;
      margin-right: 6px;
    }
  }
  .text-muted {
    color: #909399;
  }
  .text-danger {
    color: #F56C6C;
  }
  .approval-section {
    padding: 0 10px;
  }
  .approval-overview {
    margin-bottom: 20px;
    .overview-card {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 8px;
      transition: all 0.3s;
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
      .overview-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
        margin-right: 12px;
        &.status-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        &.approver-icon {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        &.progress-icon {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        &.deadline-icon {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }
      .overview-content {
        flex: 1;
        .overview-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }
        .overview-value {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }
  .approval-steps {
    position: relative;
    padding-left: 20px;
    .step-item {
      display: flex;
      position: relative;
      margin-bottom: 16px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .step-timeline {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 16px;
      .step-node {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: #fff;
        z-index: 1;
        &.node-pending {
          background: #E6A23C;
          box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.2);
        }
        &.node-approved {
          background: #67C23A;
          box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.2);
        }
        &.node-rejected {
          background: #F56C6C;
          box-shadow: 0 0 0 4px rgba(245, 108, 108, 0.2);
        }
        &.node-delegated {
          background: #909399;
          box-shadow: 0 0 0 4px rgba(144, 147, 153, 0.2);
        }
        &.node-returned {
          background: #E6A23C;
          box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.2);
        }
      }
      .step-line {
        width: 2px;
        flex: 1;
        min-height: 20px;
        background: #dcdfe6;
        margin-top: -2px;
      }
    }
    .step-content-wrapper {
      flex: 1;
      min-width: 0;
    }
    .step-card {
      border: 1px solid #ebeef5;
      border-radius: 8px;
      background: #fff;
      transition: all 0.3s;
      &:hover {
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      }
      &.card-pending {
        border-color: #E6A23C;
        background: #fdf6ec;
      }
      &.card-approved {
        border-color: #67C23A;
        background: #f0f9eb;
      }
      &.card-rejected {
        border-color: #F56C6C;
        background: #fef0f0;
      }
      &.card-delegated {
        border-color: #909399;
        background: #f4f4f5;
      }
      &.card-returned {
        border-color: #E6A23C;
        background: #fdf6ec;
      }
      .step-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        .step-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          .step-order {
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            background: #409EFF;
            padding: 2px 8px;
            border-radius: 10px;
          }
          .step-name {
            font-size: 15px;
            font-weight: 600;
            color: #303133;
          }
          .step-status-tag {
            margin-left: 8px;
          }
        }
      }
      .step-info {
        .info-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;
          .info-item {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #606266;
            i {
              color: #409EFF;
              margin-right: 4px;
            }
            .info-label {
              color: #909399;
            }
            .info-value {
              font-weight: 500;
              color: #303133;
            }
            .info-role {
              color: #909399;
              font-size: 12px;
            }
          }
        }
        .condition-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: #ecf5ff;
          border: 1px dashed #409EFF;
          border-radius: 4px;
          font-size: 12px;
          color: #409EFF;
          margin: 8px 0;
          i {
            margin-right: 4px;
          }
        }
        .delegated-info,
        .returned-info {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          padding: 10px 12px;
          background: #fff;
          border-radius: 4px;
          font-size: 13px;
          color: #606266;
          margin-top: 8px;
          i {
            color: #E6A23C;
          }
          .delegated-time,
          .returned-reason {
            color: #909399;
            font-size: 12px;
          }
        }
        .add-signers {
          .add-signers-title {
            font-size: 13px;
            font-weight: 500;
            color: #606266;
            margin-bottom: 8px;
            i {
              color: #409EFF;
              margin-right: 4px;
            }
          }
          .add-signer-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #606266;
            padding: 4px 0;
            .signer-comment {
              color: #909399;
              font-size: 12px;
            }
          }
        }
        .step-comment {
          margin-top: 12px;
          padding: 12px;
          background: #fff;
          border-radius: 4px;
          border-left: 3px solid #409EFF;
          .comment-label {
            font-size: 13px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            i {
              color: #409EFF;
              margin-right: 4px;
            }
          }
          .comment-content {
            font-size: 13px;
            color: #606266;
            line-height: 1.6;
          }
          .comment-time {
            font-size: 12px;
            color: #909399;
            margin-top: 8px;
            text-align: right;
          }
        }
      }
    }
  }
  .approval-actions {
    margin-top: 20px;
    padding: 20px;
    background: #f0f9eb;
    border-radius: 8px;
    border: 1px solid #e1f3d8;
  }
  .approval-timeline {
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    .timeline-card {
      border: none;
      background: #f5f7fa;
      padding: 12px 16px;
      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        .timeline-action {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
        .timeline-operator {
          font-size: 13px;
          color: #909399;
        }
      }
      .timeline-step {
        margin-bottom: 8px;
      }
      .timeline-delegate {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #606266;
        margin-bottom: 8px;
        i {
          color: #909399;
        }
      }
      .timeline-comment {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 13px;
        color: #606266;
        i {
          color: #409EFF;
          margin-top: 2px;
        }
      }
    }
    .no-timeline {
      text-align: center;
      padding: 40px 0;
      color: #909399;
      i {
        font-size: 48px;
        margin-bottom: 10px;
      }
      p {
        margin: 0;
      }
    }
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