<template>
	<div class="pay-container">
		<div class="pay-content">
			<div class="pay-card">
				<!-- 订单信息 -->
				<div class="order-info">
					<el-icon class="success-icon" color="#67c23a"><CircleCheck /></el-icon>
					<h2>订单提交成功！</h2>
					<p class="order-no">订单号：{{ orderNo }}</p>
					<div class="pay-amount">
						<span class="label">应付金额</span>
						<span class="amount">¥{{ payAmount }}</span>
					</div>
				</div>

				<!-- 支付方式选择 -->
				<div class="pay-methods">
					<div class="method-title">选择支付方式</div>
					<div class="method-list">
						<div
							v-for="method in payMethods"
							:key="method.type"
							:class="['method-item', { active: selectedMethod === method.type }]"
							@click="selectedMethod = method.type"
						>
							<div class="method-icon">{{ method.icon }}</div>
							<div class="method-info">
								<div class="method-name">{{ method.name }}</div>
								<div class="method-desc">{{ method.desc }}</div>
							</div>
							<el-icon v-if="selectedMethod === method.type" class="check-icon" color="#67c23a">
								<CircleCheck />
							</el-icon>
						</div>
					</div>
				</div>

				<!-- 支付按钮 -->
				<div class="pay-actions">
					<el-button size="large" @click="handleCancel">取消支付</el-button>
					<el-button type="primary" size="large" :loading="paying" @click="handlePay">确认支付</el-button>
				</div>

				<!-- 倒计时提示 -->
				<div class="pay-tips">
					<el-icon><Clock /></el-icon>
					<span>请在 {{ countdown }} 内完成支付，超时订单将自动取消</span>
				</div>
			</div>
		</div>

		<!-- 支付成功对话框 -->
		<el-dialog v-model="showSuccessDialog" title="支付成功" width="400px" :show-close="false" :close-on-click-modal="false">
			<div class="success-content">
				<el-icon class="success-icon-large" color="#67c23a"><CircleCheck /></el-icon>
				<p class="success-text">支付成功！</p>
				<p class="success-tips">您的订单已支付成功，我们会尽快为您发货</p>
			</div>
			<template #footer>
				<el-button @click="goToOrders">查看订单</el-button>
				<el-button type="primary" @click="goToShop">继续购物</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="Pay">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createPayment, mockPay, getPaymentStatus } from '@/api/shop/payment'
import { getOrderByNo } from '@/api/shop/order'

const router = useRouter()
const route = useRoute()

// 订单号
const orderNo = ref(route.query.orderNo || '')

// 支付金额
const payAmount = ref('0.00')

// 支付单号
const paymentNo = ref('')

// 支付方式
const payMethods = ref([
	{
		type: 1,
		name: '微信支付',
		desc: '推荐使用微信支付',
		icon: '💚'
	},
	{
		type: 2,
		name: '支付宝',
		desc: '使用支付宝余额或银行卡支付',
		icon: '💙'
	},
	{
		type: 3,
		name: '余额支付',
		desc: '使用账户余额支付',
		icon: '💰'
	}
])

// 选中的支付方式
const selectedMethod = ref(1)

// 支付中
const paying = ref(false)

// 支付成功对话框
const showSuccessDialog = ref(false)

// 倒计时（秒）
const countdown = ref('15:00')
let countdownTimer: any = null
let countdownSeconds = 900 // 15分钟

// 开始倒计时
const startCountdown = () => {
	countdownTimer = setInterval(() => {
		countdownSeconds--
		if (countdownSeconds <= 0) {
			clearInterval(countdownTimer)
			handleTimeout()
			return
		}

		const minutes = Math.floor(countdownSeconds / 60)
		const seconds = countdownSeconds % 60
		countdown.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}, 1000)
}

// 超时处理
const handleTimeout = () => {
	ElMessageBox.alert('订单已超时，请重新下单', '提示', {
		confirmButtonText: '确定',
		callback: () => {
			router.push('/shop')
		}
	})
}

// 取消支付
const handleCancel = async () => {
	try {
		await ElMessageBox.confirm('确定要取消支付吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '继续支付',
			type: 'warning'
		})

		// TODO: 对接后端API取消订单
		router.push('/shop/orders')
	} catch {
		// 继续支付
	}
}

// 确认支付
const handlePay = async () => {
	try {
		paying.value = true

		// 模拟支付
		await mockPay(paymentNo.value)

		// 停止倒计时
		if (countdownTimer) {
			clearInterval(countdownTimer)
		}

		ElMessage.success('支付成功')

		// 显示支付成功对话框
		showSuccessDialog.value = true
	} catch (error) {
		ElMessage.error('支付失败，请重试')
	} finally {
		paying.value = false
	}
}

// 查看订单
const goToOrders = () => {
	router.push('/shop/orders')
}

// 继续购物
const goToShop = () => {
	router.push('/shop')
}

// 初始化支付信息
const initPayment = async () => {
	try {
		// 获取订单信息
		const orderRes = await getOrderByNo(orderNo.value)
		payAmount.value = orderRes.data.payAmount

		// 创建支付单
		const paymentRes = await createPayment({
			orderNo: orderNo.value,
			payType: selectedMethod.value
		})
		paymentNo.value = paymentRes.data.paymentNo
	} catch (error) {
		ElMessage.error('获取支付信息失败')
		router.push('/shop/orders')
	}
}

onMounted(() => {
	initPayment()
	startCountdown()
})

onUnmounted(() => {
	if (countdownTimer) {
		clearInterval(countdownTimer)
	}
})
</script>

<style scoped lang="scss">
.pay-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 60px 20px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.pay-content {
	width: 100%;
	max-width: 600px;

	.pay-card {
		background: #fff;
		border-radius: 16px;
		padding: 40px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

		.order-info {
			text-align: center;
			padding-bottom: 30px;
			border-bottom: 2px solid #f5f7fa;
			margin-bottom: 30px;

			.success-icon {
				font-size: 64px;
				margin-bottom: 20px;
			}

			h2 {
				font-size: 24px;
				color: #303133;
				margin-bottom: 10px;
			}

			.order-no {
				font-size: 14px;
				color: #909399;
				margin-bottom: 20px;
			}

			.pay-amount {
				display: flex;
				align-items: baseline;
				justify-content: center;
				gap: 10px;

				.label {
					font-size: 16px;
					color: #606266;
				}

				.amount {
					font-size: 36px;
					color: #f56c6c;
					font-weight: bold;
				}
			}
		}

		.pay-methods {
			margin-bottom: 30px;

			.method-title {
				font-size: 16px;
				font-weight: 600;
				color: #303133;
				margin-bottom: 15px;
			}

			.method-list {
				display: grid;
				gap: 12px;

				.method-item {
					border: 2px solid #dcdfe6;
					border-radius: 8px;
					padding: 20px;
					cursor: pointer;
					transition: all 0.3s;
					display: flex;
					align-items: center;
					gap: 15px;

					&:hover {
						border-color: #667eea;
					}

					&.active {
						border-color: #67c23a;
						background: #f0f9ff;
					}

					.method-icon {
						font-size: 32px;
					}

					.method-info {
						flex: 1;

						.method-name {
							font-size: 16px;
							font-weight: 600;
							color: #303133;
							margin-bottom: 5px;
						}

						.method-desc {
							font-size: 13px;
							color: #909399;
						}
					}

					.check-icon {
						font-size: 24px;
					}
				}
			}
		}

		.pay-actions {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 15px;
			margin-bottom: 20px;

			.el-button {
				height: 50px;
				font-size: 16px;
			}
		}

		.pay-tips {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			color: #e6a23c;
			font-size: 14px;
		}
	}
}

.success-content {
	text-align: center;
	padding: 20px 0;

	.success-icon-large {
		font-size: 80px;
		margin-bottom: 20px;
	}

	.success-text {
		font-size: 24px;
		font-weight: bold;
		color: #303133;
		margin-bottom: 10px;
	}

	.success-tips {
		font-size: 14px;
		color: #909399;
	}
}
</style>
