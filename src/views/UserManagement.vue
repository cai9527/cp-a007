<template>
  <div class="user-management">
    <div class="page-card">
      <div class="page-header">
        <h2>用户管理</h2>
        <el-button type="primary" icon="el-icon-plus" @click="handleAdd" v-if="canEdit">新增员工</el-button>
      </div>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索姓名/用户名/手机号/邮箱"
          prefix-icon="el-icon-search"
          style="width: 260px;"
          clearable
          @keyup.enter.native="loadData"
        />
        <el-select v-model="filters.departmentId" placeholder="选择部门" clearable style="width: 160px;">
          <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
        </el-select>
        <el-select v-model="filters.role" placeholder="选择角色" clearable style="width: 140px;">
          <el-option v-for="(label, key) in roleMap" :key="key" :label="label" :value="key" />
        </el-select>
        <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 120px;">
          <el-option label="在职" value="active" />
          <el-option label="离职" value="inactive" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="loadData">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetFilters">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%;">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="员工信息" min-width="200">
          <template slot-scope="scope">
            <div class="user-info-cell">
              <span class="avatar-placeholder">{{ getInitials(scope.row.name) }}</span>
              <div class="user-detail">
                <div class="user-name">{{ scope.row.name }}</div>
                <div class="user-username">{{ scope.row.username }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" width="120" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="roleTagType(scope.row.role)" size="mini">{{ roleMap[scope.row.role] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130">
          <template slot-scope="scope">{{ maskPhone(scope.row.phone) }}</template>
        </el-table-column>
        <el-table-column prop="idCard" label="身份证号" width="160">
          <template slot-scope="scope">{{ maskIdCard(scope.row.idCard) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'" size="mini">
              {{ scope.row.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="入职时间" width="160">
          <template slot-scope="scope">{{ formatDateTime(scope.row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" v-if="canEdit">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" size="small" style="color: #F56C6C;" @click="handleDelete(scope.row)">删除</el-button>
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
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="userForm"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        v-if="dialogVisible"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="!!formData.id" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="formData.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="role">
              <el-select v-model="formData.role" placeholder="请选择角色" style="width: 100%;">
                <el-option v-for="(label, key) in roleMap" :key="key" :label="label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="departmentId">
              <el-select v-model="formData.departmentId" placeholder="请选择部门" style="width: 100%;">
                <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="formData.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status" v-if="formData.id">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">在职</el-radio>
            <el-radio label="inactive">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="初始密码" prop="password" v-if="!formData.id">
          <el-input v-model="formData.password" placeholder="请输入初始密码" type="password" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="员工详情" :visible.sync="detailVisible" width="500px">
      <div class="user-detail-card" v-if="currentUser">
        <div class="detail-header">
          <span class="avatar-placeholder" style="width: 60px; height: 60px; font-size: 20px;">
            {{ getInitials(currentUser.name) }}
          </span>
          <div class="detail-basic">
            <h3>{{ currentUser.name }}</h3>
            <p>{{ currentUser.departmentName }} · {{ currentUser.position }}</p>
            <el-tag :type="roleTagType(currentUser.role)" size="small">{{ roleMap[currentUser.role] }}</el-tag>
          </div>
        </div>
        <el-descriptions :column="2" border size="small" class="detail-desc">
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ maskPhone(currentUser.phone) }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ maskIdCard(currentUser.idCard) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'info'" size="mini">
              {{ currentUser.status === 'active' ? '在职' : '离职' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="入职时间">{{ formatDate(currentUser.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { FormRules } from 'element-ui'
import type { User, Department, PaginatedResponse } from '@/types'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getDepartments
} from '@/api/user'
import {
  roleMap,
  getInitials,
  maskIdCard,
  maskPhone,
  formatDateTime,
  formatDate,
  isValidEmail,
  isValidPhone,
  isValidIdCard
} from '@/utils'
import { mapGetters } from 'vuex'

export default Vue.extend({
  name: 'UserManagement',
  data() {
    return {
      loading: false,
      submitting: false,
      tableData: [] as User[],
      departments: [] as Department[],
      filters: {
        keyword: '',
        departmentId: null as number | null,
        role: '',
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      detailVisible: false,
      isEdit: false,
      currentUser: null as User | null,
      formData: {
        id: null as number | null,
        name: '',
        username: '',
        phone: '',
        email: '',
        idCard: '',
        role: 'employee' as User['role'],
        departmentId: null as number | null,
        position: '',
        status: 'active' as User['status'],
        password: '123456'
      },
      formRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: (rule: any, value: string, callback: any) => {
            if (value && !isValidPhone(value)) {
              callback(new Error('请输入正确的手机号'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: (rule: any, value: string, callback: any) => {
            if (value && !isValidEmail(value)) {
              callback(new Error('请输入正确的邮箱格式'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          { validator: (rule: any, value: string, callback: any) => {
            if (value && !isValidIdCard(value)) {
              callback(new Error('请输入正确的身份证号'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        departmentId: [{ required: true, message: '请选择部门', trigger: 'change' }],
        position: [{ required: true, message: '请输入职位', trigger: 'blur' }]
      } as FormRules,
      roleMap
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    canEdit(): boolean {
      return this.isAdmin
    },
    dialogTitle(): string {
      return this.isEdit ? '编辑员工' : '新增员工'
    }
  },
  mounted() {
    this.loadDepartments()
    this.loadData()
  },
  methods: {
    getInitials,
    maskIdCard,
    maskPhone,
    formatDateTime,
    formatDate,
    async loadDepartments() {
      try {
        this.departments = await getDepartments()
      } catch (e: any) {
        this.$message.error(e.message || '加载部门数据失败')
      }
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getUsers({
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.filters.keyword || undefined,
          departmentId: this.filters.departmentId || undefined,
          role: this.filters.role || undefined,
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
        keyword: '',
        departmentId: null,
        role: '',
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
    roleTagType(role: string): string {
      const map: Record<string, string> = {
        super_admin: 'danger',
        admin: 'warning',
        manager: 'primary',
        employee: 'info'
      }
      return map[role] || 'info'
    },
    handleAdd() {
      this.isEdit = false
      this.formData = {
        id: null,
        name: '',
        username: '',
        phone: '',
        email: '',
        idCard: '',
        role: 'employee',
        departmentId: null,
        position: '',
        status: 'active',
        password: '123456'
      }
      this.dialogVisible = true
    },
    handleEdit(row: User) {
      this.isEdit = true
      this.formData = {
        id: row.id,
        name: row.name,
        username: row.username,
        phone: row.phone,
        email: row.email,
        idCard: row.idCard,
        role: row.role,
        departmentId: row.departmentId,
        position: row.position,
        status: row.status,
        password: ''
      }
      this.dialogVisible = true
    },
    handleView(row: User) {
      this.currentUser = row
      this.detailVisible = true
    },
    handleDelete(row: User) {
      this.$confirm(`确定要删除员工 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteUser(row.id)
          this.$message.success('删除成功')
          this.loadData()
        } catch (e: any) {
          this.$message.error(e.message || '删除失败')
        }
      }).catch(() => {})
    },
    handleDialogClose() {
      ;(this.$refs.userForm as any)?.resetFields()
    },
    async handleSubmit() {
      const form = this.$refs.userForm as any
      if (!form) return
      form.validate(async (valid: boolean) => {
        if (!valid) return
        this.submitting = true
        try {
          if (this.isEdit && this.formData.id) {
            await updateUser(this.formData.id, {
              name: this.formData.name,
              phone: this.formData.phone,
              email: this.formData.email,
              idCard: this.formData.idCard,
              role: this.formData.role,
              departmentId: this.formData.departmentId || undefined,
              position: this.formData.position,
              status: this.formData.status
            })
            this.$message.success('编辑成功')
          } else {
            await createUser({
              name: this.formData.name,
              username: this.formData.username,
              phone: this.formData.phone,
              email: this.formData.email,
              idCard: this.formData.idCard,
              photo: '',
              role: this.formData.role,
              departmentId: this.formData.departmentId || 0,
              departmentName: '',
              position: this.formData.position,
              status: 'active'
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
.user-management {
  .user-info-cell {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-detail {
      .user-name {
        font-weight: 500;
        color: #303133;
      }
      .user-username {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .user-detail-card {
    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 20px;

      .detail-basic {
        h3 {
          margin: 0 0 6px 0;
          font-size: 18px;
        }
        p {
          margin: 0 0 8px 0;
          color: #606266;
          font-size: 13px;
        }
      }
    }

    .detail-desc {
      margin-top: 16px;
    }
  }
}
</style>
