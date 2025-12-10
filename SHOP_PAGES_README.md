# 🛍️ 2C商城前端页面说明

## 📋 已完成页面

### 1. 商品列表页 (`/shop/index.vue`)
**路由**: `/shop`

**功能特性**:
- ✅ 顶部导航栏（Logo、搜索、购物车、用户中心）
- ✅ 分类导航（全部、数码产品、生活用品等）
- ✅ 商品网格展示（卡片式布局）
- ✅ 商品信息（图片、名称、描述、价格）
- ✅ 加入购物车按钮
- ✅ 分页功能
- ✅ 售罄状态显示
- ✅ 响应式设计

**设计亮点**:
- 渐变色背景（紫色系）
- 卡片悬停动画效果
- 现代化的UI设计

---

### 2. 商品详情页 (`/shop/product.vue`)
**路由**: `/shop/product/:id`

**功能特性**:
- ✅ 商品图片展示（主图+缩略图）
- ✅ 商品基本信息（名称、描述、价格、库存）
- ✅ SKU规格选择（支持多规格）
- ✅ 数量选择器
- ✅ 分销商推荐标识
- ✅ 加入购物车
- ✅ 立即购买
- ✅ 商品详情展示
- ✅ 返回按钮

**URL参数**:
- `id`: 商品ID
- `distributorId`: 分销商ID（推广链接）

**设计亮点**:
- 左右分栏布局
- 图片切换效果
- 价格渐变背景
- SKU选择交互

---

### 3. 购物车页 (`/shop/cart.vue`)
**路由**: `/shop/cart`

**功能特性**:
- ✅ 购物车商品列表
- ✅ 全选/单选功能
- ✅ 商品信息展示（图片、名称、SKU、价格）
- ✅ 数量修改
- ✅ 删除商品
- ✅ 批量删除
- ✅ 实时计算总价
- ✅ 去结算按钮
- ✅ 空购物车状态

**设计亮点**:
- 表格式布局
- 底部固定结算栏
- 实时价格计算
- 友好的空状态提示

---

### 4. 订单确认页 (`/shop/checkout.vue`)
**路由**: `/shop/checkout`

**功能特性**:
- ✅ 收货地址选择
- ✅ 新增收货地址
- ✅ 商品清单展示
- ✅ 订单备注
- ✅ 费用明细（商品总价、运费、应付总额）
- ✅ 提交订单

**设计亮点**:
- 分区块展示
- 地址卡片选择
- 清晰的费用展示
- 大按钮提交

---

### 5. 支付页 (`/shop/pay.vue`)
**路由**: `/shop/pay`

**功能特性**:
- ✅ 订单信息展示
- ✅ 支付方式选择（微信、支付宝、余额）
- ✅ 支付倒计时（15分钟）
- ✅ 模拟支付流程
- ✅ 支付成功提示
- ✅ 取消支付

**设计亮点**:
- 居中卡片布局
- 支付方式图标化
- 倒计时提醒
- 支付成功动画

---

### 6. 订单列表页 (`/shop/orders.vue`)
**路由**: `/shop/orders`

**功能特性**:
- ✅ 订单状态筛选（全部、待支付、待发货、待收货、已完成）
- ✅ 订单列表展示
- ✅ 订单操作（取消、支付、确认收货、评价）
- ✅ 查看详情
- ✅ 分页功能
- ✅ 空状态提示

**设计亮点**:
- 状态标签导航
- 订单卡片布局
- 状态徽章
- 操作按钮分组

---

## 🎨 设计风格

### 配色方案
- **主色调**: 紫色渐变 (#667eea → #764ba2)
- **价格色**: 红色 (#f56c6c)
- **成功色**: 绿色 (#67c23a)
- **背景色**: 白色 (#fff)
- **文字色**: 深灰 (#303133)

### UI特点
- 现代化扁平设计
- 卡片式布局
- 圆角设计（8px-16px）
- 阴影效果
- 悬停动画
- 响应式布局

---

## 📱 响应式设计

所有页面都采用了响应式设计，支持：
- 桌面端（1200px+）
- 平板端（768px-1199px）
- 移动端（<768px）

---

## 🔗 路由配置

需要在 `pig-ui/src/router/index.ts` 中添加以下路由：

```typescript
{
  path: '/shop',
  name: 'Shop',
  component: () => import('@/views/shop/index.vue'),
  meta: { title: '商城首页' }
},
{
  path: '/shop/product/:id',
  name: 'ProductDetail',
  component: () => import('@/views/shop/product.vue'),
  meta: { title: '商品详情' }
},
{
  path: '/shop/cart',
  name: 'Cart',
  component: () => import('@/views/shop/cart.vue'),
  meta: { title: '购物车' }
},
{
  path: '/shop/checkout',
  name: 'Checkout',
  component: () => import('@/views/shop/checkout.vue'),
  meta: { title: '确认订单' }
},
{
  path: '/shop/pay',
  name: 'Pay',
  component: () => import('@/views/shop/pay.vue'),
  meta: { title: '支付' }
},
{
  path: '/shop/orders',
  name: 'Orders',
  component: () => import('@/views/shop/orders.vue'),
  meta: { title: '我的订单' }
}
```

---

## 🔌 API 对接

所有页面都预留了 API 对接位置，标记为 `// TODO: 对接后端API`

需要创建以下 API 文件：

### 1. `@/api/shop/product.ts`
```typescript
// 获取商品列表
export const getProductPage = (params: any) => request.get('/shop/product/page', { params })

// 获取商品详情
export const getProductById = (id: number) => request.get(`/shop/product/${id}`)
```

### 2. `@/api/shop/cart.ts`
```typescript
// 获取购物车列表
export const getCartList = () => request.get('/shop/cart/list')

// 添加到购物车
export const addCartItem = (data: any) => request.post('/shop/cart', data)

// 更新购物车商品
export const updateCartItem = (id: number, data: any) => request.put(`/shop/cart/${id}`, data)

// 删除购物车商品
export const deleteCartItem = (id: number) => request.delete(`/shop/cart/${id}`)
```

### 3. `@/api/shop/order.ts`
```typescript
// 创建订单
export const createOrder = (data: any) => request.post('/shop/order', data)

// 获取订单列表
export const getOrderPage = (params: any) => request.get('/shop/order/page', { params })

// 取消订单
export const cancelOrder = (id: number, data: any) => request.put(`/shop/order/cancel/${id}`, data)

// 确认收货
export const confirmOrder = (id: number) => request.put(`/shop/order/confirm/${id}`)
```

### 4. `@/api/shop/payment.ts`
```typescript
// 创建支付
export const createPayment = (data: any) => request.post('/shop/payment', data)

// 支付订单
export const payOrder = (data: any) => request.post('/shop/payment/pay', data)
```

### 5. `@/api/shop/address.ts`
```typescript
// 获取地址列表
export const getAddressList = () => request.get('/shop/address/list')

// 添加地址
export const addAddress = (data: any) => request.post('/shop/address', data)
```

---

## 📦 数据库表结构

已在 `pig/db/pig.sql` 中添加以下表：

1. `shop_cart` - 购物车表
2. `shop_order` - 订单主表
3. `shop_order_item` - 订单明细表
4. `shop_payment` - 支付记录表
5. `shop_logistics` - 物流信息表
6. `shop_logistics_trace` - 物流轨迹表
7. `shop_address` - 收货地址表

测试数据已添加到 `pig/db/test-data/test_data.sql`

---

## 🚀 使用方式

### 1. 推广链接
分销商推广商品时，使用以下格式的链接：

```
https://your-domain.com/shop/product/1?distributorId=123
```

- `1`: 商品ID
- `distributorId=123`: 分销商ID

### 2. 购物流程

```
商品列表 → 商品详情 → 加入购物车 → 购物车 → 确认订单 → 支付 → 订单列表
```

或

```
商品列表 → 商品详情 → 立即购买 → 确认订单 → 支付 → 订单列表
```

---

## ⚠️ 注意事项

1. **图片路径**: 所有商品图片路径需要配置 OSS 或本地存储
2. **支付功能**: 当前为模拟支付，实际使用需对接真实支付接口
3. **物流查询**: 需要对接第三方物流API
4. **库存扣减**: 需要在后端实现库存扣减逻辑
5. **佣金计算**: 订单支付成功后需触发佣金计算

---

## 🎯 下一步工作

1. ✅ 前端页面 - 已完成
2. ✅ 数据库表结构 - 已完成
3. ⏳ 后端API开发 - 待开发
4. ⏳ 前后端联调 - 待进行
5. ⏳ 支付接口对接 - 待对接
6. ⏳ 物流接口对接 - 待对接

---

## 📞 技术支持

如有问题，请检查：
1. 路由配置是否正确
2. API 接口是否已实现
3. 数据库表是否已创建
4. 测试数据是否已导入

---

**创建时间**: 2025-12-10  
**版本**: v1.0
