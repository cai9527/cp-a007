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
          <el-badge :value="unreadAlerts" :hidden="unreadAlerts === 0 || !canViewAlerts" class="header-badge" @click="goToAlerts">
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
  </el-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import type { RouteConfig } from 'vue-router'
import { getInitials } from '@/utils'
import { getAlerts } from '@/api/attendance'
import { groupConfig } from '@/router/asyncRoutes'

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
      unreadAlerts: 0
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

  .logo {
    height: 60px;
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
    height: calc(100% - 60px);
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
</style>
