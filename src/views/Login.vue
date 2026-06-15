<template>
  <div class="login-container">
    <div class="login-bg">
      <div class="bg-decoration decoration-1"></div>
      <div class="bg-decoration decoration-2"></div>
      <div class="bg-decoration decoration-3"></div>
    </div>
    <div class="login-box">
      <div class="login-left">
        <div class="brand-info">
          <div class="brand-logo">
            <i class="el-icon-s-check"></i>
          </div>
          <h1 class="brand-title">实名制考勤管理系统</h1>
          <p class="brand-subtitle">Attendance Management System</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <i class="el-icon-user-solid"></i>
            <span>精准身份核验</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-time"></i>
            <span>智能考勤打卡</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-s-data"></i>
            <span>多维数据报表</span>
          </div>
          <div class="feature-item">
            <i class="el-icon-warning-outline"></i>
            <span>异常预警通知</span>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-wrapper">
          <h2 class="form-title">欢迎登录</h2>
          <p class="form-subtitle">请输入账号密码登录系统</p>
          <el-form
            ref="loginForm"
            :model="form"
            :rules="rules"
            class="login-form"
            @keyup.enter.native="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                prefix-icon="el-icon-user"
                placeholder="请输入用户名"
                size="medium"
                clearable
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                prefix-icon="el-icon-lock"
                placeholder="请输入密码"
                size="medium"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item prop="captcha" v-if="showCaptcha">
              <div class="captcha-wrapper">
                <el-input
                  v-model="form.captcha"
                  prefix-icon="el-icon-key"
                  placeholder="请输入验证码"
                  size="medium"
                />
                <div class="captcha-img" @click="refreshCaptcha">
                  {{ captchaCode }}
                </div>
              </div>
            </el-form-item>
            <el-form-item class="form-options">
              <el-checkbox v-model="form.remember">记住密码</el-checkbox>
              <a class="forgot-link">忘记密码？</a>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="medium"
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                登 录
              </el-button>
            </el-form-item>
          </el-form>
          <div class="demo-accounts">
            <p class="demo-title">演示账号（密码均为 123456）：</p>
            <div class="account-list">
              <span class="account-tag" @click="fillAccount('admin')">超级管理员</span>
              <span class="account-tag" @click="fillAccount('hr_admin')">HR管理员</span>
              <span class="account-tag" @click="fillAccount('tech_mgr')">部门管理员</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright">© 2024 实名制考勤管理系统 v1.0.0</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { login as apiLogin } from '@/api/auth'
import type { FormRules } from 'element-ui'

export default Vue.extend({
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: '',
        captcha: '',
        remember: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      } as FormRules,
      loading: false,
      loginFailCount: 0,
      showCaptcha: false,
      captchaCode: ''
    }
  },
  mounted() {
    this.refreshCaptcha()
    const savedUsername = localStorage.getItem('remember_username')
    if (savedUsername) {
      this.form.username = savedUsername
      this.form.remember = true
    }
  },
  methods: {
    refreshCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      this.captchaCode = code
    },
    fillAccount(username: string) {
      this.form.username = username
      this.form.password = '123456'
    },
    async handleLogin() {
      const form = this.$refs.loginForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        if (this.showCaptcha && this.form.captcha.toUpperCase() !== this.captchaCode) {
          this.$message.error('验证码错误')
          this.refreshCaptcha()
          return
        }
        this.loading = true
        try {
          const { user, token } = await apiLogin(this.form.username, this.form.password)
          await this.$store.dispatch('login', { user, token })
          if (this.form.remember) {
            localStorage.setItem('remember_username', this.form.username)
          } else {
            localStorage.removeItem('remember_username')
          }
          this.$message.success('登录成功')
          this.$router.push('/dashboard')
        } catch (e: any) {
          this.$message.error(e.message || '登录失败')
          this.loginFailCount++
          if (this.loginFailCount >= 3) {
            this.showCaptcha = true
            this.refreshCaptcha()
          }
        } finally {
          this.loading = false
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;

  .bg-decoration {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    background: #fff;

    &.decoration-1 {
      width: 600px;
      height: 600px;
      top: -200px;
      right: -100px;
    }

    &.decoration-2 {
      width: 400px;
      height: 400px;
      bottom: -100px;
      left: -100px;
    }

    &.decoration-3 {
      width: 200px;
      height: 200px;
      top: 30%;
      left: 20%;
    }
  }
}

.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  width: 900px;
  height: 520px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 10;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .brand-info {
    .brand-logo {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;

      i {
        font-size: 32px;
        color: #fff;
      }
    }

    .brand-title {
      font-size: 26px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .brand-subtitle {
      font-size: 14px;
      opacity: 0.8;
      margin: 0;
    }
  }

  .features {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      opacity: 0.9;

      i {
        font-size: 20px;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

.login-right {
  width: 420px;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .login-form-wrapper {
    width: 100%;

    .form-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .form-subtitle {
      font-size: 13px;
      color: #909399;
      margin: 0 0 30px 0;
    }

    .login-form {
      .captcha-wrapper {
        display: flex;
        gap: 10px;

        .el-input {
          flex: 1;
        }

        .captcha-img {
          width: 100px;
          height: 36px;
          background: linear-gradient(135deg, #f0f2f5, #dcdfe6);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #606266;
          letter-spacing: 4px;
          font-style: italic;
          cursor: pointer;
          user-select: none;
        }
      }

      .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .forgot-link {
          color: #409EFF;
          font-size: 13px;
          cursor: pointer;

          &:hover {
            color: #66b1ff;
          }
        }
      }

      .login-btn {
        width: 100%;
        height: 42px;
        font-size: 16px;
      }
    }

    .demo-accounts {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #ebeef5;

      .demo-title {
        font-size: 12px;
        color: #909399;
        margin: 0 0 10px 0;
      }

      .account-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .account-tag {
          display: inline-block;
          padding: 4px 12px;
          background: #ecf5ff;
          color: #409EFF;
          border-radius: 12px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #409EFF;
            color: #fff;
          }
        }
      }
    }
  }
}

.copyright {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  z-index: 10;
}
</style>
