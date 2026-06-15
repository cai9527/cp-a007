<template>
  <div class="role-management">
    <div class="page-card">
      <div class="page-header">
        <h2>角色权限管理</h2>
      </div>

      <div class="role-list">
        <el-table :data="roles" border stripe style="width: 100%;" @row-click="handleRowClick" highlight-current-row>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="name" label="角色名称" width="150" />
          <el-table-column prop="code" label="角色编码" width="150" />
          <el-table-column prop="description" label="角色描述" />
          <el-table-column prop="createdAt" label="创建时间" width="160">
            <template slot-scope="scope">{{ formatDateTime(scope.row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.stop="handleEdit(scope.row)">编辑权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      title="编辑角色权限"
      :visible.sync="dialogVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentRole" class="role-permission">
        <div class="role-info">
          <h3>{{ currentRole.name }}</h3>
          <p>{{ currentRole.description }}</p>
        </div>
        <el-tree
          ref="permissionTree"
          :data="permissionTree"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedKeys"
          :props="{ label: 'name', children: 'children' }"
          class="permission-tree"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import type { Role, Permission } from '@/types'
import { getRoles, getPermissions, updateRole } from '@/api/user'
import { formatDateTime } from '@/utils'

interface TreeNode extends Permission {
  children?: TreeNode[]
}

export default Vue.extend({
  name: 'RoleManagement',
  data() {
    return {
      roles: [] as Role[],
      permissions: [] as Permission[],
      dialogVisible: false,
      currentRole: null as Role | null,
      saving: false,
      permissionTree: [] as TreeNode[]
    }
  },
  computed: {
    checkedKeys(): string[] {
      if (!this.currentRole) return []
      if (this.currentRole.permissions.includes('*')) {
        return this.permissions.map(p => p.id)
      }
      return this.currentRole.permissions
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    formatDateTime,
    async loadData() {
      try {
        const [roles, permissions] = await Promise.all([
          getRoles(),
          getPermissions()
        ])
        this.roles = roles
        this.permissions = permissions
        this.permissionTree = this.buildTree(permissions)
      } catch (e: any) {
        this.$message.error(e.message || '加载数据失败')
      }
    },
    buildTree(permissions: Permission[]): TreeNode[] {
      const map = new Map<string, TreeNode>()
      const roots: TreeNode[] = []

      permissions.forEach(p => {
        map.set(p.id, { ...p, children: [] })
      })

      permissions.forEach(p => {
        const node = map.get(p.id)!
        if (p.parentId && map.has(p.parentId)) {
          map.get(p.parentId)!.children!.push(node)
        } else {
          roots.push(node)
        }
      })

      return roots
    },
    handleRowClick(row: Role) {
      this.handleEdit(row)
    },
    handleEdit(row: Role) {
      this.currentRole = { ...row }
      this.dialogVisible = true
      this.$nextTick(() => {
        const tree = this.$refs.permissionTree as any
        if (tree) {
          tree.setCheckedKeys(this.checkedKeys)
        }
      })
    },
    async handleSave() {
      if (!this.currentRole) return
      const tree = this.$refs.permissionTree as any
      if (!tree) return
      const checkedKeys = tree.getCheckedKeys()
      const halfCheckedKeys = tree.getHalfCheckedKeys()
      const allKeys = [...checkedKeys, ...halfCheckedKeys]

      this.saving = true
      try {
        await updateRole(this.currentRole.id, { permissions: allKeys })
        this.$message.success('保存成功')
        this.dialogVisible = false
        this.loadData()
      } catch (e: any) {
        this.$message.error(e.message || '保存失败')
      } finally {
        this.saving = false
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.role-management {
  .role-list {
    margin-bottom: 20px;
  }

  .role-permission {
    .role-info {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
      }

      p {
        margin: 0;
        color: #909399;
        font-size: 13px;
      }
    }

    .permission-tree {
      max-height: 400px;
      overflow-y: auto;
    }
  }
}
</style>
