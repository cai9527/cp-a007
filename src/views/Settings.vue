<template>
  <div class="settings-page">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="考勤规则设置" name="attendance">
        <div class="settings-form">
          <h3 class="section-title">基础考勤时间</h3>
          <el-form :model="attendanceForm" label-width="120px" class="form-section">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="上班时间">
                  <el-time-picker
                    v-model="attendanceForm.workStartTime"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择上班时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下班时间">
                  <el-time-picker
                    v-model="attendanceForm.workEndTime"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择下班时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="迟到阈值(分钟)">
                  <el-input-number
                    v-model="attendanceForm.lateThreshold"
                    :min="1"
                    :max="120"
                    style="width: 200px;"
                  />
                  <span class="form-tip">超过此时间打卡记为迟到</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="早退阈值(分钟)">
                  <el-input-number
                    v-model="attendanceForm.earlyThreshold"
                    :min="1"
                    :max="120"
                    style="width: 200px;"
                  />
                  <span class="form-tip">提前此时间下班记为早退</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <h3 class="section-title">打卡时间范围</h3>
          <el-form :model="attendanceForm" label-width="120px" class="form-section">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="上班打卡开始">
                  <el-time-picker
                    v-model="attendanceForm.checkInRangeStart"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择开始时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="上班打卡结束">
                  <el-time-picker
                    v-model="attendanceForm.checkInRangeEnd"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择结束时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="下班打卡开始">
                  <el-time-picker
                    v-model="attendanceForm.checkOutRangeStart"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择开始时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下班打卡结束">
                  <el-time-picker
                    v-model="attendanceForm.checkOutRangeEnd"
                    format="HH:mm:ss"
                    value-format="HH:mm:ss"
                    placeholder="选择结束时间"
                    style="width: 200px;"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <h3 class="section-title">工作日设置</h3>
          <el-form label-width="120px" class="form-section">
            <el-form-item label="每周工作日">
              <el-checkbox-group v-model="workDays">
                <el-checkbox :label="1">周一</el-checkbox>
                <el-checkbox :label="2">周二</el-checkbox>
                <el-checkbox :label="3">周三</el-checkbox>
                <el-checkbox :label="4">周四</el-checkbox>
                <el-checkbox :label="5">周五</el-checkbox>
                <el-checkbox :label="6">周六</el-checkbox>
                <el-checkbox :label="0">周日</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="primary" :loading="savingAttendance" @click="saveAttendanceRule">保存设置</el-button>
            <el-button @click="resetAttendanceRule">重置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="预警规则设置" name="warning">
        <div class="settings-form">
          <h3 class="section-title">预警触发条件</h3>
          <el-form :model="warningForm" label-width="160px" class="form-section">
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="月迟到预警次数">
                  <el-input-number
                    v-model="warningForm.lateWarningCount"
                    :min="1"
                    :max="30"
                    style="width: 150px;"
                  />
                  <span class="form-tip">次/月</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="月早退预警次数">
                  <el-input-number
                    v-model="warningForm.earlyWarningCount"
                    :min="1"
                    :max="30"
                    style="width: 150px;"
                  />
                  <span class="form-tip">次/月</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="月缺勤预警次数">
                  <el-input-number
                    v-model="warningForm.absentWarningCount"
                    :min="1"
                    :max="30"
                    style="width: 150px;"
                  />
                  <span class="form-tip">次/月</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="连续缺勤预警天数">
                  <el-input-number
                    v-model="warningForm.continuousAbsentDays"
                    :min="1"
                    :max="15"
                    style="width: 150px;"
                  />
                  <span class="form-tip">天</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <h3 class="section-title">通知设置</h3>
          <el-form :model="warningForm" label-width="160px" class="form-section">
            <el-form-item label="通知管理员">
              <el-switch v-model="warningForm.notifyAdmin" />
              <span class="form-tip">触发预警时通知管理员</span>
            </el-form-item>
            <el-form-item label="通知员工本人">
              <el-switch v-model="warningForm.notifyEmployee" />
              <span class="form-tip">触发预警时通知员工本人</span>
            </el-form-item>
          </el-form>

          <div class="form-actions">
            <el-button type="primary" :loading="savingWarning" @click="saveWarningRule">保存设置</el-button>
            <el-button @click="resetWarningRule">重置</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { AttendanceRule, WarningRule } from '@/types'
import { getAttendanceRule, updateAttendanceRule, getWarningRule, updateWarningRule } from '@/api/attendance'

export default Vue.extend({
  name: 'Settings',
  data() {
    return {
      activeTab: 'attendance',
      attendanceForm: {
        workStartTime: '09:00:00',
        workEndTime: '18:00:00',
        lateThreshold: 15,
        earlyThreshold: 15,
        checkInRangeStart: '06:00:00',
        checkInRangeEnd: '12:00:00',
        checkOutRangeStart: '17:00:00',
        checkOutRangeEnd: '23:59:59',
        workDaysPerWeek: [1, 2, 3, 4, 5]
      } as AttendanceRule,
      warningForm: {
        lateWarningCount: 3,
        earlyWarningCount: 3,
        absentWarningCount: 2,
        continuousAbsentDays: 2,
        notifyAdmin: true,
        notifyEmployee: true
      } as WarningRule,
      workDays: [1, 2, 3, 4, 5] as number[],
      savingAttendance: false,
      savingWarning: false,
      originalAttendance: null as AttendanceRule | null,
      originalWarning: null as WarningRule | null
    }
  },
  mounted() {
    this.loadRules()
  },
  methods: {
    async loadRules() {
      try {
        const [attendanceRule, warningRule] = await Promise.all([
          getAttendanceRule(),
          getWarningRule()
        ])
        this.attendanceForm = { ...attendanceRule }
        this.originalAttendance = { ...attendanceRule }
        this.workDays = [...attendanceRule.workDaysPerWeek]
        this.warningForm = { ...warningRule }
        this.originalWarning = { ...warningRule }
      } catch (e: any) {
        this.$message.error(e.message || '加载设置失败')
      }
    },
    async saveAttendanceRule() {
      this.savingAttendance = true
      try {
        await updateAttendanceRule({
          ...this.attendanceForm,
          workDaysPerWeek: this.workDays
        })
        this.$message.success('保存成功')
        this.originalAttendance = { ...this.attendanceForm, workDaysPerWeek: [...this.workDays] }
      } catch (e: any) {
        this.$message.error(e.message || '保存失败')
      } finally {
        this.savingAttendance = false
      }
    },
    resetAttendanceRule() {
      if (this.originalAttendance) {
        this.attendanceForm = { ...this.originalAttendance }
        this.workDays = [...this.originalAttendance.workDaysPerWeek]
      }
    },
    async saveWarningRule() {
      this.savingWarning = true
      try {
        await updateWarningRule({ ...this.warningForm })
        this.$message.success('保存成功')
        this.originalWarning = { ...this.warningForm }
      } catch (e: any) {
        this.$message.error(e.message || '保存失败')
      } finally {
        this.savingWarning = false
      }
    },
    resetWarningRule() {
      if (this.originalWarning) {
        this.warningForm = { ...this.originalWarning }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.settings-page {
  .settings-form {
    padding: 10px 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin: 20px 0 16px 0;
    padding-left: 10px;
    border-left: 3px solid #409EFF;
  }

  .form-section {
    padding: 0 20px;
  }

  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }

  .form-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    text-align: center;

    .el-button {
      min-width: 100px;
      margin: 0 10px;
    }
  }

  ::v-deep .el-tabs__item {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
  }
}
</style>
