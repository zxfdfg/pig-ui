<template>
	<div class="orders-container">
		<div class="orders-content">
			<h1 class="page-title">📋 我的订单</h1>

			<!-- 订单状态筛选 -->
			<div class="status-tabs">
				<div
					v-for="tab in statusTabs"
					:key="tab.status"
					:class="['tab-item', { active: queryForm.status === tab.status }]"
					@click="handleTabChange(tab.status)"
				>
					{{ tab.label }}
					<el-badge v-if="tab.count > 0" :value="tab.count" class="tab-badge" />
				</div>
			</div>

			<!-- 订单列表 -->
			<div class="orders-list">
				<div v-for="order in orderList" :key="order.id" class="order-card">
					<!-- 订单头部 -->
					<div class="order-header">
						<div class="order-info">
							<span class="order-no">订单号：{{ order.orderNo }}</span>
							<span class="order-time">{{ order.createTime }}</span>
						</div>
						<el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
					</div>

					<!-- 订单商品 -->
					<div class="order-items">
						<div v-for="item in order.items" :key="item.id" class="order-item" @click="goToDetail(order.id)">
							<img :src="item.productImage" :alt="item.productName" class="product-image" />
							<div class="product-info">
								<div class="product-name">{{ item.productName }}</div>
								<div v-if="item.skuName" class="product-sku">{{ item.skuName }}</div>
							</div>
							<div class="product-price">¥{{ item.price }}</div>
							<div class="product-quantity">x{{ item.quantity }}</div>
						</div>
					</div>

					<!-- 订单底部 -->
					<div class="order-footer">
						<div class="order-amount">
							<span class="label">实付款：</span>
							<span class="amount">¥{{ order.payAmount }}</span>
						</div>
						<div class="order-actions">
							<el-button v-if="order.status === 0" size="small" @click="handleCancel(order)">取消订单</el-button>
							<el-button v-if="order.status === 0" type="danger" size="small" @click="handlePay(order)">
								去支付
							</el-button>
							<el-button v-if="order.status === 2" type="primary" size="small" @click="handleConfirm(order)">
								确认收货
							</el-button>
							<el-button v-if="order.status === 3" size="small" @click="handleComment(order)">评价</el-button>
							<el-button size="small" @click="goToDetail(order.id)">查看详情</el-button>
						</div>
					</div>
				</div>

				<!-- 空状态 -->
				<div v-if="orderList.length === 0" class="empty-orders">
					<el-empty description="暂无订单">
						<el-button type="primary" @click="goToShop">去逛逛</el-button>
					</el-empty>
				</div>
			</div>

			<!-- 分页 -->
			<div v-if="total > 0" class="pagination-wrapper">
				<el-pagination
					v-model:current-page="queryForm.current"
					v-model:page-size="queryForm.size"
					:total="total"
					:page-sizes="[10, 20, 30, 50]"
					layout="total, sizes, prev, pager, next, jumper"
					@size-change="getOrderList"
					@current-change="getOrderList"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="Orders">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderPage, cancelOrder, confirmOrder } from '@/api/shop/order'

const router = useRouter()

// 状态标签
const statusTabs = ref([
	{ status: null, label: '全部', count: 0 },
	{ status: 0, label: '待支付', count: 2 },
	{ status: 1, label: '待发货', count: 1 },
	{ status: 2, label: '待收货', count: 3 },
	{ status: 3, label: '已完成', count: 10 }
])

// 查询参数
const queryForm = ref({
	current: 1,
	size: 10,
	status: null
})

// 订单列表
const orderList = ref([])
const total = ref(0)

// 获取订单列表
const getOrderList = async () => {
	try {
		const res = await getOrderPage(queryForm.value)
		orderList.value = res.data.records
		total.value = res.data.total

		// 更新状态标签计数（可选，如果后端不返回统计）
		// statusTabs.value.forEach(tab => {
		//   tab.count = orderList.value.filter(order => tab.status === null || order.status === tab.status).length
		// })
	} catch (error) {
		ElMessage.error('获取订单列表失败')
	}
}

// 切换状态标签
const handleTabChange = (status: any) => {
	queryForm.value.status = status
	queryForm.value.current = 1
	getOrderList()
}

// 获取状态类型
const getStatusType = (status: number) => {
	const types: any = {
		0: 'warning',
		1: 'info',
		2: 'primary',
		3: 'success',
		4: 'info',
		5: 'danger'
	}
	return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
	const texts: any = {
		0: '待支付',
		1: '待发货',
		2: '待收货',
		3: '已完成',
		4: '已取消',
		5: '已退款'
	}
	return texts[status] || '未知'
}

// 取消订单
const handleCancel = async (order: any) => {
	try {
		const result = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputPattern: /.+/,
			inputErrorMessage: '请输入取消原因'
		})

		await cancelOrder(order.id, result.value)
		ElMessage.success('订单已取消')
		getOrderList()
	} catch (error: any) {
		if (error !== 'cancel') {
			ElMessage.error('取消订单失败')
		}
	}
}

// 去支付
const handlePay = (order: any) => {
	router.push({
		path: '/shop/pay',
		query: {
			orderNo: order.orderNo
		}
	})
}

// 确认收货
const handleConfirm = async (order: any) => {
	try {
		await ElMessageBox.confirm('确认已收到货物吗？', '确认收货', {
			confirmButtonText: '确认收货',
			cancelButtonText: '取消',
			type: 'warning'
		})

		await confirmOrder(order.id)
		ElMessage.success('确认收货成功')
		getOrderList()
	} catch (error: any) {
		if (error !== 'cancel') {
			ElMessage.error('确认收货失败')
		}
	}
}

// 评价
const handleComment = (order: any) => {
	ElMessage.info('评价功能开发中')
}

// 查看详情
const goToDetail = (orderId: number) => {
	router.push(`/shop/order/${orderId}`)
}

// 去逛逛
const goToShop = () => {
	router.push('/shop')
}

onMounted(() => {
	getOrderList()
})
</script>

<style scoped lang="scss">
.orders-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40px 20px;
}

.orders-content {
	max-width: 1200px;
	margin: 0 auto;

	.page-title {
		font-size: 32px;
		font-weight: bold;
		color: #fff;
		margin-bottom: 30px;
		text-align: center;
	}

	.status-tabs {
		background: #fff;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 20px;
		display: flex;
		gap: 30px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

		.tab-item {
			position: relative;
			padding: 10px 20px;
			cursor: pointer;
			transition: all 0.3s;
			color: #606266;
			font-size: 16px;
			border-radius: 8px;

			&:hover {
				background: #f5f7fa;
				color: #667eea;
			}

			&.active {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
			}

			.tab-badge {
				position: absolute;
				top: 5px;
				right: 5px;
			}
		}
	}

	.orders-list {
		.order-card {
			background: #fff;
			border-radius: 12px;
			margin-bottom: 20px;
			overflow: hidden;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

			.order-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 15px 20px;
				background: #f5f7fa;
				border-bottom: 1px solid #e4e7ed;

				.order-info {
					display: flex;
					gap: 20px;
					align-items: center;

					.order-no {
						font-size: 14px;
						color: #303133;
						font-weight: 500;
					}

					.order-time {
						font-size: 13px;
						color: #909399;
					}
				}
			}

			.order-items {
				padding: 20px;

				.order-item {
					display: grid;
					grid-template-columns: 80px 1fr 100px 80px;
					gap: 20px;
					align-items: center;
					padding: 15px 0;
					border-bottom: 1px solid #f5f7fa;
					cursor: pointer;
					transition: background 0.3s;

					&:last-child {
						border-bottom: none;
					}

					&:hover {
						background: #fafafa;
					}

					.product-image {
						width: 80px;
						height: 80px;
						border-radius: 8px;
						object-fit: cover;
					}

					.product-info {
						.product-name {
							font-size: 14px;
							color: #303133;
							margin-bottom: 5px;
						}

						.product-sku {
							font-size: 12px;
							color: #909399;
						}
					}

					.product-price {
						font-size: 16px;
						color: #f56c6c;
						font-weight: 600;
					}

					.product-quantity {
						text-align: center;
						color: #606266;
					}
				}
			}

			.order-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 15px 20px;
				background: #fafafa;
				border-top: 1px solid #e4e7ed;

				.order-amount {
					.label {
						font-size: 14px;
						color: #606266;
					}

					.amount {
						font-size: 20px;
						color: #f56c6c;
						font-weight: bold;
						margin-left: 5px;
					}
				}

				.order-actions {
					display: flex;
					gap: 10px;
				}
			}
		}

		.empty-orders {
			background: #fff;
			border-radius: 12px;
			padding: 80px 20px;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
		}
	}

	.pagination-wrapper {
		display: flex;
		justify-content: center;
		padding: 20px;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
	}
}
</style>
