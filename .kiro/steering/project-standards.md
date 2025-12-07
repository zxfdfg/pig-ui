# PIG-UI 前端开发规范

## 项目概述

PIG-UI 是 PIGCLOUD 微服务开发平台的前端项目，基于 Vue 3 + TypeScript + Element Plus + Vite 构建。

## 技术栈

- **框架**: Vue 3.5.13
- **UI 库**: Element Plus 2.8.7
- **构建工具**: Vite 5.4.11
- **语言**: TypeScript 5.6.3
- **状态管理**: Pinia 2.3.0
- **路由**: Vue Router 4.4.5
- **HTTP 客户端**: Axios 1.7.9
- **样式**: Tailwind CSS 3.4.17 + SCSS
- **图表**: ECharts 5.5.1
- **编辑器**: @wangeditor-next/editor 5.6.43

## 项目结构

```
pig-ui/src/
├── api/              # API 接口定义
│   ├── admin/        # 管理模块 API
│   ├── daemon/       # 守护进程 API
│   ├── gen/          # 代码生成 API
│   └── login/        # 登录 API
├── assets/           # 静态资源
│   ├── icons/        # 图标
│   ├── styles/       # 全局样式
│   └── login/        # 登录页资源
├── components/       # 公共组件
│   ├── auth/         # 权限组件
│   ├── DictTag/      # 字典标签
│   ├── Editor/       # 富文本编辑器
│   ├── Upload/       # 文件上传
│   └── ...
├── directive/        # 自定义指令
├── hooks/            # 组合式函数
├── i18n/             # 国际化
├── layout/           # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── theme/            # 主题样式
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 编码规范

### 命名规范

- **文件名**: 
  - 组件: 大驼峰 `UserList.vue`, `UserForm.vue`
  - 工具/API: 小驼峰 `request.ts`, `formatTime.ts`
  - 类型定义: 小驼峰 `user.d.ts`, `global.d.ts`

- **变量/函数**: 小驼峰 `userName`, `getUserList`
- **常量**: 全大写下划线分隔 `API_BASE_URL`, `MAX_SIZE`
- **组件名**: 大驼峰 `<UserList />`, `<DictTag />`
- **CSS 类名**: 短横线分隔 `user-list`, `form-item`

### Vue 3 组合式 API

**优先使用 `<script setup>` 语法**

```vue
<script setup lang="ts" name="UserList">
import { ref, onMounted } from 'vue'

const userList = ref([])

const getUserList = async () => {
  // 获取用户列表
}

onMounted(() => {
  getUserList()
})
</script>
```

### TypeScript 规范

- 所有 `.vue` 文件使用 `<script setup lang="ts">`
- API 接口定义返回类型
- 组件 props 使用 TypeScript 类型定义
- 避免使用 `any`，优先使用具体类型或 `unknown`

```typescript
// 定义接口类型
interface User {
  id: number
  username: string
  nickname: string
}

// API 函数
export const getUserList = (): Promise<User[]> => {
  return request.get('/admin/user/list')
}
```

### 组件开发规范

#### 组件结构顺序

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts" name="ComponentName">
// 1. 导入
import { ref } from 'vue'

// 2. Props 定义
interface Props {
  title: string
}
const props = defineProps<Props>()

// 3. Emits 定义
const emit = defineEmits<{
  change: [value: string]
}>()

// 4. 响应式数据
const count = ref(0)

// 5. 计算属性
const doubleCount = computed(() => count.value * 2)

// 6. 方法
const handleClick = () => {
  emit('change', 'value')
}

// 7. 生命周期
onMounted(() => {
  // 初始化
})
</script>

<style scoped lang="scss">
/* 样式 */
</style>
```

#### 组件命名

- 组件文件名使用大驼峰: `UserList.vue`
- 使用 `name` 属性指定组件名（用于 keep-alive）
- 组件使用时推荐大驼峰: `<UserList />`

### API 接口规范

#### 统一使用 axios 封装

```typescript
// src/api/admin/user.ts
import request from '@/utils/request'

// 获取用户列表
export const getUserList = (params: any) => {
  return request({
    url: '/admin/user/page',
    method: 'get',
    params
  })
}

// 新增用户
export const addUser = (data: any) => {
  return request({
    url: '/admin/user',
    method: 'post',
    data
  })
}
```

#### 接口响应处理

- 统一在 `utils/request.ts` 中处理响应拦截
- 业务错误码统一处理
- 使用 Element Plus 的 `ElMessage` 显示提示

### 状态管理 (Pinia)

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: ''
  }),
  
  getters: {
    isLogin: (state) => !!state.token
  },
  
  actions: {
    setUserInfo(info: any) {
      this.userInfo = info
    }
  }
})
```

### 路由规范

- 路由配置在 `router/index.ts`
- 使用路由懒加载
- 路由 meta 信息包含: `title`, `icon`, `roles` 等

```typescript
{
  path: '/user',
  name: 'User',
  component: () => import('@/views/admin/user/index.vue'),
  meta: {
    title: '用户管理',
    icon: 'user',
    roles: ['admin']
  }
}
```

## 样式规范

### CSS 方案

- 全局样式: `src/theme/` 目录
- 组件样式: 使用 `<style scoped>`
- 工具类: Tailwind CSS
- 预处理器: SCSS

### 样式组织

```vue
<style scoped lang="scss">
// 1. 使用 Tailwind 工具类
.container {
  @apply flex items-center justify-between;
}

// 2. 自定义样式
.user-list {
  padding: 20px;
  
  &__item {
    margin-bottom: 10px;
  }
}
</style>
```

## 工具函数

### 常用工具

- `utils/request.ts`: HTTP 请求封装
- `utils/storage.ts`: 本地存储封装
- `utils/validate.ts`: 表单验证
- `utils/formatTime.ts`: 时间格式化
- `utils/authFunction.ts`: 权限判断

### 自定义 Hooks

```typescript
// hooks/table.ts
export const useTable = () => {
  const loading = ref(false)
  const dataList = ref([])
  const total = ref(0)
  
  const getList = async () => {
    loading.value = true
    // 获取数据
    loading.value = false
  }
  
  return {
    loading,
    dataList,
    total,
    getList
  }
}
```

## 权限控制

### 指令方式

```vue
<el-button v-auth="'sys:user:add'">新增</el-button>
```

### 函数方式

```typescript
import { useUserStore } from '@/stores/userInfo'

const userStore = useUserStore()
const hasPermission = userStore.permissions.includes('sys:user:add')
```

## 性能优化

- 使用 `v-show` 代替频繁切换的 `v-if`
- 大列表使用虚拟滚动
- 图片懒加载
- 路由懒加载
- 组件按需引入
- 使用 `keep-alive` 缓存页面

## 构建部署

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

### Docker 构建

```bash
npm run build:docker
```

## 代码质量

### ESLint

- 遵循项目 `.eslintrc.js` 配置
- 提交前运行: `npm run lint:eslint`

### Prettier

- 使用 `.prettierrc.cjs` 配置
- 格式化代码: `npm run prettier`

## 浏览器兼容

- 支持现代浏览器最后两个版本
- 不支持 IE 11 及以下

## 国际化 (i18n)

- 配置文件: `src/i18n/`
- 使用 `vue-i18n` 库
- 页面文本使用 `$t('key')` 方式

## 环境变量

- `.env`: 所有环境
- `.env.development`: 开发环境
- `.env.production`: 生产环境

## 文档

- 配套文档: https://wiki.pig4cloud.com
- 组件文档: Element Plus 官方文档
- 重要功能需添加注释说明
