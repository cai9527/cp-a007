
// ============================================
// 公共组件统一导出入口
// 支持全局注册或按需引入
// ============================================

import Vue from 'vue'

// ---------- common 通用业务组件 ----------
import PageCard from './common/PageCard.vue'
import StatCard from './common/StatCard.vue'
import FilterBar from './common/FilterBar.vue'
import TablePagination from './common/TablePagination.vue'
import AvatarPlaceholder from './common/AvatarPlaceholder.vue'
import UserInfoCell from './common/UserInfoCell.vue'
import StatusTag from './common/StatusTag.vue'
import ChartCard from './common/ChartCard.vue'
import BatchActions from './common/BatchActions.vue'

// 组件列表（用于批量注册）
export const components = {
  PageCard,
  StatCard,
  FilterBar,
  TablePagination,
  AvatarPlaceholder,
  UserInfoCell,
  StatusTag,
  ChartCard,
  BatchActions
}

// 批量全局注册函数
export function setupComponents(vue: typeof Vue): void {
  Object.entries(components).forEach(([name, comp]) => {
    vue.component(name, comp)
  })
}

// 按需导出
export {
  PageCard,
  StatCard,
  FilterBar,
  TablePagination,
  AvatarPlaceholder,
  UserInfoCell,
  StatusTag,
  ChartCard,
  BatchActions
}
