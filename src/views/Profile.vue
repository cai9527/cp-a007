<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="profile-avatar">
        <span class="avatar-placeholder" style="width: 100px; height: 100px; font-size: 40px;">
          {{ userInitials }}
        </span>
        <el-button type="primary" size="mini" icon="el-icon-camera" class="avatar-btn">更换头像</el-button>
      </div>
      <div class="profile-info">
        <h2 class="user-name">{{ user?.name }}</h2>
        <p class="user-dept">
          <i class="el-icon-office-building"></i>
          {{ user?.departmentName }} · {{ user?.position }}
        </p>
        <div class="user-tags">
          <el-tag :type="roleTagType" size="small">{{ roleMap[user?.role || 'employee'] }}</el-tag>
          <el-tag v-if="user?.status === 'active'" type="success" size="small">在职</el-tag>
          <el-tag v-else type="info" size="small">离职</el-tag>
        </div>
      </div>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="basicForm" label-width="100px" class="profile-form">
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input v-model="basicForm.name" :disabled="!editing" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户名">
                <el-input v-model="basicForm.username" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input v-model="basicForm.phone" :disabled="!editing" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="basicForm.email" :disabled="!editing" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="身份证号">
                <el-input v-model="basicForm.idCard" :disabled="!editing" maxlength="18" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门">
                <el-input v-model="basicForm.departmentName" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="40">
            <el-col :span="12">
              <el-form-item label="职位">
                <el-input v-model="basicForm.position" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="入职时间">
                <el-input v-model="basicForm.createdAt" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="form-actions">
            <el-button v-if="!editing" type="primary" @click="startEdit">编辑资料</el-button>
            <template v-else>
              <el-button type="primary" :loading="saving" @click="saveBasic">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </template>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="修改密码" name="password">
        <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="120px" class="profile-form" style="max-width: 500px;">
          <el-form-item label="当前密码" prop="oldPassword">
            <el-input v-model="passwordForm.oldPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="passwordForm.newPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="changingPwd" @click="changePassword">修改密码</el-button>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="考勤统计" name="stats">
        <div class="stats-section">
          <div class="stat-row">
            <div class="stat-card">
              <i class="el-icon-calendar stat-icon" style="color: #409EFF;"></i>
              <div class="stat-label">本月应出勤</div>
              <div class="stat-value primary">{{ personalReport?.workDays || 0 }} 天</div>
            </div>
            <div class="stat-card">
              <i class="el-icon-circle-check stat-icon" style="color: #67C23A;"></i>
              <div class="stat-label">实际出勤</div>
              <div class="stat-value success">{{ personalReport?.actualDays || 0 }} 天</div>
            </div>
            <div class="stat-card">
              <i class="el-icon-data-line stat-icon" style="color: #E6A23C;"></i>
              <div class="stat-label">出勤率</div>
              <div class="stat-value warning">{{ personalReport?.attendanceRate || 0 }}%</div>
            </div>
            <div class="stat-card">
              <i class="el-icon-time stat-icon" style="color: #909399;"></i>
              <div class="stat-label">总工时</div>
              <div class="stat-value info">{{ personalReport?.totalWorkHours || 0 }} 小时</div>
            </div>
          </div>

          <div class="detail-cards">
            <div class="detail-card success">
              <div class="detail-icon"><i class="el-icon-select"></i></div>
              <div class="detail-info">
                <div class="detail-count">{{ personalReport?.normalDays || 0 }}</div>
                <div class="detail-label">正常出勤</div>
              </div>
            </div>
            <div class="detail-card warning">
              <div class="detail-icon"><i class="el-icon-alarm-clock"></i></div>
              <div class="detail-info">
                <div class="detail-count">{{ personalReport?.lateDays || 0 }}</div>
                <div class="detail-label">迟到</div>
                <div class="detail-sub">共{{ personalReport?.lateMinutes || 0 }}分钟</div>
              </div>
            </div>
            <div class="detail-card warning">
              <div class="detail-icon"><i class="el-icon-location-outline"></i></div>
              <div class="detail-info">
                <div class="detail-count">{{ personalReport?.earlyDays || 0 }}</div>
                <div class="detail-label">早退</div>
                <div class="detail-sub">共{{ personalReport?.earlyMinutes || 0 }}分钟</div>
              </div>
            </div>
            <div class="detail-card danger">
              <div class="detail-icon"><i class="el-icon-close"></i></div>
              <div class="detail-info">
                <div class="detail-count">{{ personalReport?.absentDays || 0 }}</div>
                <div class="detail-label">缺勤</div>
              </div>
            </div>
            <div class="detail-card primary">
              <div class="detail-icon"><i class="el-icon-document"></i></div>
              <div class="detail-info">
                <div class="detail-count">{{ personalReport?.leaveDays || 0 }}</div>
                <div class="detail-label">请假</div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import type { FormRules } from 'element-ui'
import type { PersonalReport } from '@/types'
import { getPersonalReport } from '@/api/report'
import { getInitials, roleMap, formatDate, isValidPhone, isValidEmail, isValidIdCard } from '@/utils'
import { currentMonth } from '@/data/mockData'

export default Vue.extend({
  name: 'Profile',
  data() {
    return {
      activeTab: 'basic',
      editing: false,
      saving: false,
      changingPwd: false,
      basicForm: {
        name: '',
        username: '',
        phone: '',
        email: '',
        idCard: '',
        departmentName: '',
        position: '',
        createdAt: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          {
            validator: (rule: any, value: string, callback: any) => {
              if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      } as FormRules,
      personalReport: null as PersonalReport | null,
      roleMap
    }
  },
  computed: {
    ...mapState(['user']),
    userInitials(): string {
      return getInitials(this.user?.name || '')
    },
    roleTagType(): string {
      const map: Record<string, string> = {
        super_admin: 'danger',
        admin: 'warning',
        manager: 'primary',
        employee: 'info'
      }
      return map[this.user?.role || 'employee'] || 'info'
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.basicForm = {
            name: val.name,
            username: val.username,
            phone: val.phone,
            email: val.email,
            idCard: val.idCard,
            departmentName: val.departmentName,
            position: val.position,
            createdAt: formatDate(val.createdAt)
          }
        }
      }
    },
    activeTab(val) {
      if (val === 'stats') {
        this.loadPersonalReport()
      }
    }
  },
  mounted() {
    if (this.user) {
      this.loadPersonalReport()
    }
  },
  methods: {
    startEdit() {
      this.editing = true
    },
    cancelEdit() {
      if (this.user) {
        this.basicForm = {
          name: this.user.name,
          username: this.user.username,
          phone: this.user.phone,
          email: this.user.email,
          idCard: this.user.idCard,
          departmentName: this.user.departmentName,
          position: this.user.position,
          createdAt: formatDate(this.user.createdAt)
        }
      }
      this.editing = false
    },
    async saveBasic() {
      if (!this.basicForm.name.trim()) {
        this.$message.warning('请输入姓名')
        return
      }
      if (!isValidPhone(this.basicForm.phone)) {
        this.$message.warning('请输入正确的手机号')
        return
      }
      if (!isValidEmail(this.basicForm.email)) {
        this.$message.warning('请输入正确的邮箱')
        return
      }
      if (!isValidIdCard(this.basicForm.idCard)) {
        this.$message.warning('请输入正确的身份证号')
        return
      }
      this.saving = true
      try {
        this.$message.success('保存成功')
        this.editing = false
      } catch (e: any) {
        this.$message.error(e.message || '保存失败')
      } finally {
        this.saving = false
      }
    },
    async changePassword() {
      const form = this.$refs.passwordForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        this.changingPwd = true
        try {
          this.$message.success('密码修改成功')
          this.passwordForm = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } catch (e: any) {
          this.$message.error(e.message || '修改失败')
        } finally {
          this.changingPwd = false
        }
      })
    },
    async loadPersonalReport() {
      if (!this.user?.id) return
      try {
        this.personalReport = await getPersonalReport(this.user.id, currentMonth)
      } catch (e) {
        // ignore
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.profile-page {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 30px;
    background: #fff;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .profile-avatar {
      position: relative;

      .avatar-btn {
        position: absolute;
        bottom: -5px;
        right: -5px;
      }
    }

    .profile-info {
      flex: 1;

      .user-name {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 10px 0;
      }

      .user-dept {
        color: #606266;
        margin: 0 0 12px 0;

        i {
          margin-right: 6px;
        }
      }

      .user-tags {
        .el-tag {
          margin-right: 8px;
        }
      }
    }
  }

  .profile-form {
    padding: 10px 0;

    .form-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;
    }
  }

  .stats-section {
    padding: 10px 0;

    .stat-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .detail-cards {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }

    .detail-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border-left: 4px solid;

      &.success {
        border-left-color: #67C23A;
        .detail-icon { background: #f0f9eb; color: #67C23A; }
      }
      &.warning {
        border-left-color: #E6A23C;
        .detail-icon { background: #fdf6ec; color: #E6A23C; }
      }
      &.danger {
        border-left-color: #F56C6C;
        .detail-icon { background: #fef0f0; color: #F56C6C; }
      }
      &.primary {
        border-left-color: #409EFF;
        .detail-icon { background: #ecf5ff; color: #409EFF; }
      }

      .detail-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .detail-info {
        .detail-count {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          line-height: 1.2;
        }
        .detail-label {
          color: #909399;
          font-size: 13px;
          margin-top: 4px;
        }
        .detail-sub {
          color: #c0c4cc;
          font-size: 12px;
          margin-top: 2px;
        }
      }
    }
  }

  ::v-deep .el-tabs__item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
  }
}
</style>
