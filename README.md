📋 功能模块
模块	功能说明
登录认证	用户名密码登录、验证码（失败3次后）、记住密码、演示账号快捷填充
仪表盘	统计卡片、出勤率仪表盘、考勤趋势图、状态分布图、部门排名、最新预警
用户管理	员工信息增删改查、部门/角色/状态筛选、分页、身份证/手机号/邮箱验证
考勤打卡	上下班打卡、打卡状态显示、考勤记录列表、日期范围筛选
请假管理	请假申请、审批（通过/拒绝）、撤销、多种请假类型、工作日计算
异常预警	迟到/早退/缺勤/连续缺勤预警、批量处理、状态/类型筛选
报表中心	月度分析、部门汇总、个人统计、ECharts可视化、CSV导出
系统设置	考勤规则配置、预警规则配置
角色权限	树形权限结构、角色权限编辑
个人中心	基本信息、修改密码、考勤统计
🛠 技术栈
Vue 2.7 + TypeScript
Vite 5 构建工具
Vue Router 3 路由管理（含路由守卫和权限控制）
Vuex 3 状态管理
Element UI 2.15 UI组件库
ECharts 5 数据可视化
Day.js 日期处理
SCSS 样式预处理
Mock数据 模拟后端API
📁 项目结构
PlainText



src/├── api/              # API接口封装├── data/             # Mock数据├── layout/           # 主布局组件├── router/           # 路由配置├── store/            # Vuex状态管理├── styles/           # 全局样式├── types/            # TypeScript类型定义├── utils/            # 工具函数├── views/            # 页面组件│   ├── Login.vue│   ├── Dashboard.vue│   ├── UserManagement.vue│   ├── Attendance.vue│   ├── LeaveManagement.vue│   ├── AlertCenter.vue│   ├── ReportCenter.vue│   ├── Settings.vue│   ├── RoleManagement.vue│   └── Profile.vue├── App.vue└── main.ts
🔐 权限控制
系统采用 RBAC 权限模型，支持：

超级管理员：全部权限
HR管理员：用户管理、考勤管理、报表查看
部门管理员：部门员工考勤查看、请假审批
普通员工：个人考勤、请假申请、个人报表
