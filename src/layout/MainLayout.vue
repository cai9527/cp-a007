<template>
  <el-container class="main-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <i class="el-icon-s-check"></i>
        <span v-show="!isCollapse" class="logo-text">考勤管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#ffffff"
        class="sidebar-menu"
        router
      >
        <template v-for="item in menuTree">
          <el-submenu v-if="item.children" :index="'group-' + item.group" :key="'group-' + item.group">
            <template slot="title">
              <i :class="item.icon || 'el-icon-document'"></i>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :index="resolvePath(child.path)" :key="child.name">
              <i :class="child.meta?.icon || 'el-icon-document'"></i>
              <span slot="title">{{ child.meta?.title }}</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item v-else :index="resolvePath(item.path)" :key="item.name">
            <i :class="item.meta?.icon || 'el-icon-document'"></i>
            <span slot="title">{{ item.meta?.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <i class="el-icon-s-fold collapse-btn" @click="toggleCollapse"></i>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">{{ currentRoute.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-badge :value="unreadAlerts" :hidden="unreadAlerts === 0 || !canViewAlerts" class="header-badge" @click.native="openMessageDialog">
            <i class="el-icon-bell notification-icon"></i>
          </el-badge>
          <el-dropdown @command="handleCommand" class="user-dropdown">
            <span class="user-info">
              <span class="avatar-placeholder">{{ userInitials }}</span>
              <span class="user-name">{{ user?.name }}</span>
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">
                <i class="el-icon-user"></i> 个人中心
              </el-dropdown-item>
              <el-dropdown-item command="settings" v-if="canViewSettings">
                <i class="el-icon-setting"></i> 系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <i class="el-icon-switch-button"></i> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>

    <el-dialog
      title="消息中心"
      :visible.sync="messageDialogVisible"
      width="500px"
      custom-class="message-dialog"
      :close-on-click-modal="true"
      :modal="true"
      :modal-append-to-body="false"
      append-to-body
      :close-on-press-escape="true"
      :show-close="true"
      @close="handleDialogClose"
    >
      <div class="message-dialog-content">
        <div class="message-tabs">
          <div
            class="message-tab"
            :class="{ active: activeMessageTab === 'alerts' }"
            @click="activeMessageTab = 'alerts'"
          >
            <i class="el-icon-warning-outline"></i>
            <span>预警消息</span>
            <el-badge :value="unreadAlerts" :hidden="unreadAlerts === 0" class="tab-badge" />
          </div>
        </div>

        <div class="message-list" v-loading="messageLoading">
          <div v-if="messageList.length === 0 && !messageLoading" class="empty-state">
            <i class="el-icon-document"></i>
            <p>暂无消息</p>
          </div>
          <div
            v-for="item in messageList"
            :key="item.id"
            class="message-item"
            :class="{ unread: !item.handled }"
            @click="handleMessageClick(item)"
          >
            <div class="message-icon">
              <i :class="getMessageIcon(item.type)"></i>
            </div>
            <div class="message-info">
              <div class="message-title">
                <span class="message-type-tag" :class="getMessageTagType(item.type)">
                  {{ alertTypeMap[item.type] || '系统消息' }}
                </span>
                <span class="message-time">{{ formatDateTime(item.createdAt) }}</span>
              </div>
              <div class="message-user">{{ item.userName }} · {{ item.departmentName }}</div>
              <div class="message-desc">{{ item.description }}</div>
            </div>
            <div class="message-status" v-if="item.handled">
              <el-tag size="mini" type="info">已处理</el-tag>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="handleViewAll">查看全部</el-button>
        <el-button type="primary" @click.native="handleCloseDialog">关闭</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import type { RouteConfig } from 'vue-router'
import { getInitials, alertTypeMap, formatDateTime } from '@/utils'
import { getAlerts } from '@/api/attendance'
import { groupConfig } from '@/router/asyncRoutes'
import type { AlertRecord } from '@/types'

interface MenuGroup {
  group: string
  title: string
  icon: string
  children: RouteConfig[]
}

interface MenuLeaf {
  path: string
  name?: string
  meta?: any
}

type MenuItem = MenuGroup | MenuLeaf

export default Vue.extend({
  name: 'MainLayout',
  data() {
    return {
      isCollapse: false,
      unreadAlerts: 0,
      messageDialogVisible: false,
      activeMessageTab: 'alerts',
      messageLoading: false,
      messageList: [] as AlertRecord[],
      alertTypeMap
    }
  },
  computed: {
    ...mapState(['user', 'addRoutes']),
    ...mapGetters(['isAdmin', 'hasPermission']),
    currentRoute() {
      return this.$route
    },
    activeMenu(): string {
      return this.$route.path
    },
    menuRoutes(): RouteConfig[] {
      const mainRoute = (this.addRoutes || []).find(r => r.path === '/')
      if (!mainRoute || !mainRoute.children) return []
      return mainRoute.children.filter(route => !route.meta?.hidden)
    },
    menuTree(): MenuItem[] {
      const routes = this.menuRoutes
      const groupMap = new Map<string, RouteConfig[]>()
      const result: MenuItem[] = []
      const insertedGroups = new Set<string>()

      routes.forEach(route => {
        const group = route.meta?.group as string | undefined
        if (group) {
          if (!groupMap.has(group)) {
            groupMap.set(group, [])
          }
          groupMap.get(group)!.push(route)
          if (!insertedGroups.has(group)) {
            const config = groupConfig[group]
            if (config) {
              result.push({
                group,
                title: config.title,
                icon: config.icon,
                children: groupMap.get(group)!
              })
              insertedGroups.add(group)
            }
          } else {
            const existing = result.find((r: any) => 'group' in r && r.group === group) as MenuGroup | undefined
            if (existing) {
              existing.children = groupMap.get(group)!
            }
          }
        } else {
          result.push({
            path: route.path,
            name: route.name,
            meta: route.meta
          })
        }
      })

      return result
    },
    userInitials(): string {
      return getInitials(this.user?.name || '')
    },
    canViewSettings(): boolean {
      return this.hasPermission('settings:view')
    },
    canViewAlerts(): boolean {
      return this.hasPermission('alert')
    }
  },
  mounted() {
    this.loadUnreadAlerts()
  },
  methods: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    resolvePath(path: string): string {
      return '/' + path
    },
    async loadUnreadAlerts() {
      try {
        const res = await getAlerts({ page: 1, pageSize: 1, handled: false })
        this.unreadAlerts = res.total
      } catch (e) {
        // ignore
      }
    },
    goToAlerts() {
      if (!this.canViewAlerts) {
        this.$message.warning('您没有权限访问该页面')
        return
      }
      this.$router.push('/alerts')
    },
    async openMessageDialog() {
      if (!this.canViewAlerts) {
        this.$message.warning('您没有权限访问该页面')
        return
      }
      this.messageDialogVisible = true
      this.messageLoading = true
      try {
        const res = await getAlerts({ page: 1, pageSize: 10 })
        this.messageList = res.list
      } catch (e) {
        this.$message.error('加载消息失败')
      } finally {
        this.messageLoading = false
      }
    },
    handleCloseDialog() {
      this.messageDialogVisible = false
    },
    handleDialogClose() {
      this.messageDialogVisible = false
    },
    handleViewAll() {
      this.messageDialogVisible = false
      this.$nextTick(() => {
        this.goToAlerts()
      })
    },
    handleMessageClick(item: AlertRecord) {
      this.messageDialogVisible = false
      this.$nextTick(() => {
        this.$router.push('/alerts')
      })
    },
    getMessageIcon(type: string): string {
      const map: Record<string, string> = {
        late: 'el-icon-time',
        early: 'el-icon-back',
        absent: 'el-icon-close',
        continuous_absent: 'el-icon-warning'
      }
      return map[type] || 'el-icon-bell'
    },
    getMessageTagType(type: string): string {
      const map: Record<string, string> = {
        late: 'tag-warning',
        early: 'tag-warning',
        absent: 'tag-danger',
        continuous_absent: 'tag-danger'
      }
      return map[type] || 'tag-info'
    },
    handleCommand(command: string) {
      switch (command) {
        case 'profile':
          this.$router.push('/profile')
          break
        case 'settings':
          if (!this.canViewSettings) {
            this.$message.warning('您没有权限访问该页面')
            return
          }
          this.$router.push('/settings')
          break
        case 'logout':
          this.handleLogout()
          break
      }
    },
    async handleLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        await this.$store.dispatch('logout')
        this.$message.success('退出登录成功')
        this.$router.push('/login')
      }).catch(() => {})
    }
  }
})
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100%;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .logo {
    height: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    border-bottom: 1px solid #002140;

    i {
      font-size: 28px;
      color: #409EFF;
    }

    .logo-text {
      margin-left: 10px;
      white-space: nowrap;
    }
  }

  .sidebar-menu {
    border-right: none;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: #606266;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .header-badge {
      cursor: pointer;

      .notification-icon {
        font-size: 20px;
        color: #606266;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .user-dropdown {
      cursor: pointer;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .user-name {
          font-size: 14px;
          color: #303133;
        }
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

::v-deep .el-menu {
  border-right: none;
}

::v-deep .el-menu-item {
  height: 50px;
  line-height: 50px;

  &:hover {
    background-color: #002140 !important;
  }

  &.is-active {
    background-color: #1890ff !important;
  }
}

::v-deep .el-menu-item i {
  color: inherit;
}

::v-deep .el-submenu__title {
  height: 50px;
  line-height: 50px;

  &:hover {
    background-color: #002140 !important;
  }

  i {
    color: inherit;
  }
}

::v-deep .el-submenu .el-menu-item {
  min-width: 0;
  padding-left: 52px !important;
}

::v-deep .el-dropdown-link {
  cursor: pointer;
  color: #606266;
}

.sidebar {
  ::v-deep .el-menu::-webkit-scrollbar {
    width: 4px;
  }

  ::v-deep .el-menu::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  ::v-deep .el-menu::-webkit-scrollbar-track {
    background: transparent;
  }
}

::v-deep .message-dialog {
  .el-dialog__body {
    padding: 0;
    max-height: 60vh;
  }
}

.message-dialog-content {
  .message-tabs {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    padding: 0 20px;

    .message-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      position: relative;

      i {
        font-size: 16px;
      }

      &:hover {
        color: #409EFF;
      }

      &.active {
        color: #409EFF;
        border-bottom-color: #409EFF;
        font-weight: 500;
      }

      .tab-badge {
        margin-left: 4px;
      }
    }
  }

  .message-list {
    max-height: 450px;
    overflow-y: auto;
    padding: 8px 0;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #909399;

      i {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .message-item {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f5f7fa;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #ecf5ff;

        &:hover {
          background-color: #d9ecff;
        }

        .message-icon {
          background: linear-gradient(135deg, #409EFF, #36cfc9);
        }
      }

      &:last-child {
        border-bottom: none;
      }

      .message-icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 50%;
        background: #f0f2f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 18px;
      }

      .message-info {
        flex: 1;
        min-width: 0;

        .message-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;

          .message-type-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;

            &.tag-warning {
              background: #fdf6ec;
              color: #E6A23C;
            }

            &.tag-danger {
              background: #fef0f0;
              color: #F56C6C;
            }

            &.tag-info {
              background: #ecf5ff;
              color: #409EFF;
            }
          }

          .message-time {
            font-size: 12px;
            color: #909399;
            flex-shrink: 0;
          }
        }

        .message-user {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
        }

        .message-desc {
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }

      .message-status {
        flex-shrink: 0;
        align-self: center;
      }
    }
  }
}
</style>

<style lang="scss">
.message-dialog {
  .el-dialog__body {
    padding: 0 !important;
    max-height: 60vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .el-dialog__footer {
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
    background-color: #fff;
    position: relative;
    z-index: 10;
  }
}

.message-dialog-content {
  .message-tabs {
    display: flex;
    border-bottom: 1px solid #ebeef5;
    padding: 0 20px;
    background: #fff;
    position: sticky;
    top: 0;
    z-index: 5;

    .message-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #606266;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      position: relative;

      i {
        font-size: 16px;
      }

      &:hover {
        color: #409EFF;
      }

      &.active {
        color: #409EFF;
        border-bottom-color: #409EFF;
        font-weight: 500;
      }

      .tab-badge {
        margin-left: 4px;
      }
    }
  }

  .message-list {
    max-height: none;
    overflow: visible;
    padding: 8px 0;

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #909399;

      i {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .message-item {
      display: flex;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f5f7fa;
      user-select: none;

      &:hover {
        background-color: #f5f7fa;
      }

      &.unread {
        background-color: #ecf5ff;

        &:hover {
          background-color: #d9ecff;
        }

        .message-icon {
          background: linear-gradient(135deg, #409EFF, #36cfc9);
        }
      }

      &:last-child {
        border-bottom: none;
      }

      .message-icon {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
        border-radius: 50%;
        background: #f0f2f5;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 18px;
      }

      .message-info {
        flex: 1;
        min-width: 0;

        .message-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;

          .message-type-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;

            &.tag-warning {
              background: #fdf6ec;
              color: #E6A23C;
            }

            &.tag-danger {
              background: #fef0f0;
              color: #F56C6C;
            }

            &.tag-info {
              background: #ecf5ff;
              color: #409EFF;
            }
          }

          .message-time {
            font-size: 12px;
            color: #909399;
            flex-shrink: 0;
          }
        }

        .message-user {
          font-size: 13px;
          color: #606266;
          margin-bottom: 4px;
        }

        .message-desc {
          font-size: 13px;
          color: #606266;
          line-height: 1.5;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }

      .message-status {
        flex-shrink: 0;
        align-self: center;
      }
    }
  }
}
</style>
