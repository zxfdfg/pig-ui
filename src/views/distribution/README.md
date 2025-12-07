# 分销系统前端页面

基于 Vue 3 + TypeScript + Element Plus 的分销系统前端页面。

## 页面结构

```
distribution/
├── index.vue              # 分销中心首页
├── commission/
│   └── index.vue         # 佣金列表页
├── team/
│   └── index.vue         # 我的团队页（待开发）
└── withdraw/
    ├── index.vue         # 提现记录页（待开发）
    └── apply.vue         # 申请提现页（待开发）
```

## 已完成页面

### 1. 分销中心首页 (`index.vue`)

**功能**:
- 分销商信息展示
- 今日数据统计
- 快捷入口导航
- 申请成为分销商

**组件**:
- 信息卡片：显示等级、团队人数、累计佣金等
- 统计卡片：今日订单、销售额、佣金
- 快捷入口：我的团队、佣金明细、申请提现、推广二维码
- 申请对话框：填写真实姓名、电话、身份证号

### 2. 佣金列表页 (`commission/index.vue`)

**功能**:
- 佣金统计展示
- 佣金明细列表
- 状态筛选
- 分页查询

**组件**:
- 统计卡片：总佣金、可提现、已提现、冻结中
- 数据表格：订单号、金额、比例、状态等
- 筛选器：全部、待结算、已结算、已取消
- 分页组件

## API 接口

### 分销商接口 (`api/distribution/distributor.ts`)

```typescript
applyDistributor(data)      // 申请成为分销商
getDistributorInfo()        // 获取分销商信息
getChildrenList(params)     // 获取下级分销商列表
getTeamStats()              // 获取团队统计
```

### 佣金接口 (`api/distribution/commission.ts`)

```typescript
getCommissionList(params)   // 获取佣金列表
getCommissionStats()        // 获取佣金统计
getCommissionDetail(id)     // 获取佣金明细
```

### 提现接口 (`api/distribution/withdraw.ts`)

```typescript
applyWithdraw(data)         // 申请提现
getWithdrawList(params)     // 获取提现记录
getWithdrawDetail(id)       // 获取提现详情
```

## 路由配置

在 `router/index.ts` 中添加以下路由：

```typescript
{
  path: '/distribution',
  name: 'Distribution',
  component: Layout,
  meta: {
    title: '分销中心',
    icon: 'money'
  },
  children: [
    {
      path: 'index',
      name: 'DistributionIndex',
      component: () => import('@/views/distribution/index.vue'),
      meta: {
        title: '分销首页',
        icon: 'home'
      }
    },
    {
      path: 'commission',
      name: 'DistributionCommission',
      component: () => import('@/views/distribution/commission/index.vue'),
      meta: {
        title: '佣金明细',
        icon: 'money'
      }
    },
    {
      path: 'team',
      name: 'DistributionTeam',
      component: () => import('@/views/distribution/team/index.vue'),
      meta: {
        title: '我的团队',
        icon: 'user'
      }
    },
    {
      path: 'withdraw',
      name: 'DistributionWithdraw',
      component: () => import('@/views/distribution/withdraw/index.vue'),
      meta: {
        title: '提现管理',
        icon: 'wallet'
      }
    }
  ]
}
```

## 使用说明

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 访问页面

```
http://localhost:5173/distribution
```

## 开发指南

### 组件规范

遵循 PIG-UI 前端开发规范：

1. **文件命名**: 大驼峰 `UserList.vue`
2. **组件名**: 使用 `name` 属性指定
3. **脚本**: 使用 `<script setup lang="ts">`
4. **样式**: 使用 `<style scoped lang="scss">`

### 代码结构

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts" name="ComponentName">
// 1. 导入
import { ref } from 'vue'

// 2. 响应式数据
const data = ref([])

// 3. 方法
const fetchData = async () => {
  // 获取数据
}

// 4. 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
/* 样式 */
</style>
```

### API 调用

```typescript
import { getDistributorInfo } from '@/api/distribution/distributor'

const fetchData = async () => {
  try {
    const res = await getDistributorInfo()
    console.log(res.data)
  } catch (error) {
    console.error('获取数据失败', error)
  }
}
```

### 状态管理

如需全局状态，使用 Pinia：

```typescript
// stores/distribution.ts
import { defineStore } from 'pinia'

export const useDistributionStore = defineStore('distribution', {
  state: () => ({
    distributorInfo: null
  }),
  
  actions: {
    setDistributorInfo(info: any) {
      this.distributorInfo = info
    }
  }
})
```

## 待开发功能

### 高优先级

- [ ] 我的团队页面
  - 团队结构树形展示
  - 成员列表
  - 销售数据统计

- [ ] 提现管理页面
  - 提现申请表单
  - 提现记录列表
  - 提现状态跟踪

### 中优先级

- [ ] 推广功能
  - 推广二维码生成
  - 推广链接复制
  - 推广海报生成

- [ ] 数据统计
  - 销售数据图表
  - 团队业绩排行
  - 佣金趋势分析

### 低优先级

- [ ] 个人设置
  - 账户信息管理
  - 提现账户设置
  - 消息通知设置

## 样式规范

### 颜色

```scss
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;
```

### 间距

```scss
$spacing-small: 10px;
$spacing-medium: 20px;
$spacing-large: 30px;
```

### 字体

```scss
$font-size-small: 12px;
$font-size-base: 14px;
$font-size-large: 16px;
$font-size-xlarge: 18px;
```

## 常见问题

### Q: 如何添加新页面？

A: 
1. 在 `views/distribution/` 下创建新的 `.vue` 文件
2. 在 `api/distribution/` 下创建对应的 API 文件
3. 在路由配置中添加路由

### Q: 如何调试 API 接口？

A: 
1. 打开浏览器开发者工具
2. 查看 Network 标签
3. 检查请求和响应数据

### Q: 如何处理权限控制？

A: 使用 `v-auth` 指令或 `hasPermission` 函数：

```vue
<el-button v-auth="'distribution:apply'">申请</el-button>
```

## 更新日志

### v1.0.0 (2025-12-07)

- ✅ 分销中心首页
- ✅ 佣金列表页
- ✅ API 接口封装

## 参考资料

- [Vue 3 文档](https://cn.vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [PIG 项目文档](https://wiki.pig4cloud.com)
