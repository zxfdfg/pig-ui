<template>
	<div class="checkout-container">
		<div class="checkout-content">
			<h1 class="page-title">📦 确认订单</h1>

			<div class="checkout-main">
				<!-- 收货地址 -->
				<div class="section address-section">
					<div class="section-title">
						<el-icon><Location /></el-icon>
						<span>收货地址</span>
					</div>
					<div class="address-list">
						<div
							v-for="addr in addressList"
							:key="addr.id"
							:class="['address-item', { active: selectedAddress?.id === addr.id }]"
							@click="selectAddress(addr)"
						>
							<div class="address-info">
								<div class="receiver">
									<span class="name">{{ addr.receiverName }}</span>
									<span class="phone">{{ addr.receiverPhone }}</span>
									<el-tag v-if="addr.isDefault" type="danger" size="small">默认</el-tag>
								</div>
								<div class="address-detail">
									{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.address }}
								</div>
							</div>
							<el-icon v-if="selectedAddress?.id === addr.id" class="check-icon" color="#67c23a">
								<CircleCheck />
							</el-icon>
						</div>
						<div class="address-item add-new" @click="showAddressDialog = true">
							<el-icon><Plus /></el-icon>
							<span>新增收货地址</span>
						</div>
					</div>
				</div>

				<!-- 商品清单 -->
				<div class="section goods-section">
					<div class="section-title">
						<el-icon><ShoppingBag /></el-icon>
						<span>商品清单</span>
					</div>
					<div class="goods-list">
						<div v-for="item in orderItems" :key="item.id" class="goods-item">
							<img :src="item.productImage" :alt="item.productName" class="product-image" />
							<div class="product-info">
								<div class="product-name">{{ item.productName }}</div>
								<div v-if="item.skuName" class="product-sku">{{ item.skuName }}</div>
							</div>
							<div class="product-price">¥{{ item.price }}</div>
							<div class="product-quantity">x{{ item.quantity }}</div>
							<div class="product-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
						</div>
					</div>
				</div>

				<!-- 订单备注 -->
				<div class="section remark-section">
					<div class="section-title">
						<el-icon><Edit /></el-icon>
						<span>订单备注</span>
					</div>
					<el-input
						v-model="orderForm.remark"
						type="textarea"
						:rows="3"
						placeholder="选填，可以告诉卖家您的特殊需求"
						maxlength="200"
						show-word-limit
					/>
				</div>

				<!-- 结算信息 -->
				<div class="section summary-section">
					<div class="summary-item">
						<span class="label">商品总价</span>
						<span class="value">¥{{ totalAmount }}</span>
					</div>
					<div class="summary-item">
						<span class="label">运费</span>
						<span class="value">¥0.00</span>
					</div>
					<div class="summary-item total">
						<span class="label">应付总额</span>
						<span class="value">¥{{ totalAmount }}</span>
					</div>
				</div>

				<!-- 提交订单 -->
				<div class="submit-section">
					<el-button type="danger" size="large" :loading="submitting" @click="handleSubmit">提交订单</el-button>
				</div>
			</div>
		</div>

		<!-- 新增地址对话框 -->
		<el-dialog v-model="showAddressDialog" title="新增收货地址" width="600px">
			<el-form :model="addressForm" label-width="100px">
				<el-form-item label="收货人" required>
					<el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名" />
				</el-form-item>
				<el-form-item label="手机号码" required>
					<el-input v-model="addressForm.receiverPhone" placeholder="请输入手机号码" />
				</el-form-item>
				<el-form-item label="所在地区" required>
					<el-input v-model="addressForm.province" placeholder="省份" style="width: 30%; margin-right: 5%" />
					<el-input v-model="addressForm.city" placeholder="城市" style="width: 30%; margin-right: 5%" />
					<el-input v-model="addressForm.district" placeholder="区县" style="width: 30%" />
				</el-form-item>
				<el-form-item label="详细地址" required>
					<el-input v-model="addressForm.address" type="textarea" :rows="3" placeholder="请输入详细地址" />
				</el-form-item>
				<el-form-item label="设为默认">
					<el-switch v-model="addressForm.isDefault" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showAddressDialog = false">取消</el-button>
				<el-button type="primary" @click="handleAddAddress">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="Checkout">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAddressList as fetchAddressList, addAddress } from '@/api/shop/address'
import { createOrderFromCart, createOrderDirect } from '@/api/shop/order'
import { getCartList } from '@/api/shop/cart'

const router = useRouter()
const route = useRoute()

// 收货地址列表
const addressList = ref([])
const selectedAddress = ref(null)
const showAddressDialog = ref(false)
const addressForm = ref({
	receiverName: '',
	receiverPhone: '',
	province: '',
	city: '',
	district: '',
	address: '',
	isDefault: false
})

// 订单商品
const orderItems = ref([])

// 订单表单
const orderForm = ref({
	remark: ''
})

// 提交中
const submitting = ref(false)

// 总金额
const totalAmount = computed(() => {
	return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

// 获取收货地址列表
const getAddressList = async () => {
	try {
		const res = await fetchAddressList()
		addressList.value = res.data.map((addr: any) => ({
			...addr,
			isDefault: addr.isDefault === 1
		}))
		selectedAddress.value = addressList.value.find((addr) => addr.isDefault) || addressList.value[0]
	} catch (error) {
		ElMessage.error('获取地址列表失败')
	}
}

// 获取订单商品
const getOrderItems = async () => {
	try {
		if (route.query.from === 'cart') {
			// 从购物车结算
			const res = await getCartList()
			const cartIds = route.query.cartIds?.toString().split(',').map(Number) || []
			orderItems.value = res.data
				.filter((item: any) => cartIds.includes(item.id))
				.map((item: any) => ({
					cartId: item.id,
					productId: item.productId,
					productName: item.productName,
					productImage: item.productImage,
					skuId: item.skuId,
					skuName: item.skuName,
					price: item.price,
					quantity: item.quantity
				}))
		} else if (route.query.productId) {
			// 立即购买
			orderItems.value = [
				{
					productId: Number(route.query.productId),
					skuId: Number(route.query.skuId),
					quantity: Number(route.query.quantity),
					// 这些信息需要从商品详情获取，暂时使用占位符
					productName: '商品名称',
					productImage: '',
					skuName: '',
					price: 0
				}
			]
		}
	} catch (error) {
		ElMessage.error('获取商品信息失败')
	}
}

// 选择地址
const selectAddress = (addr: any) => {
	selectedAddress.value = addr
}

// 新增地址
const handleAddAddress = async () => {
	try {
		await addAddress({
			...addressForm.value,
			isDefault: addressForm.value.isDefault ? 1 : 0
		})
		ElMessage.success('添加成功')
		showAddressDialog.value = false
		getAddressList()
	} catch (error) {
		ElMessage.error('添加失败')
	}
}

// 提交订单
const handleSubmit = async () => {
	if (!selectedAddress.value) {
		ElMessage.warning('请选择收货地址')
		return
	}

	try {
		submitting.value = true

		let res
		if (route.query.from === 'cart') {
			// 从购物车创建订单
			const orderData = {
				addressId: selectedAddress.value.id,
				cartIds: orderItems.value.map((item: any) => item.cartId),
				remark: orderForm.value.remark,
				distributorId: route.query.distributorId ? Number(route.query.distributorId) : null
			}
			res = await createOrderFromCart(orderData)
		} else {
			// 立即购买创建订单
			const orderData = {
				addressId: selectedAddress.value.id,
				productId: orderItems.value[0].productId,
				skuId: orderItems.value[0].skuId,
				quantity: orderItems.value[0].quantity,
				remark: orderForm.value.remark,
				distributorId: route.query.distributorId ? Number(route.query.distributorId) : null
			}
			res = await createOrderDirect(orderData)
		}

		ElMessage.success('订单创建成功')

		// 跳转到支付页面
		router.push({
			path: '/shop/pay',
			query: {
				orderNo: res.data.orderNo
			}
		})
	} catch (error) {
		ElMessage.error('订单创建失败')
	} finally {
		submitting.value = false
	}
}

onMounted(() => {
	getAddressList()
	getOrderItems()
})
</script>

<style scoped lang="scss">
.checkout-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40px 20px;
}

.checkout-content {
	max-width: 1000px;
	margin: 0 auto;

	.page-title {
		font-size: 32px;
		font-weight: bold;
		color: #fff;
		margin-bottom: 30px;
		text-align: center;
	}

	.checkout-main {
		.section {
			background: #fff;
			border-radius: 12px;
			padding: 25px;
			margin-bottom: 20px;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

			.section-title {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 18px;
				font-weight: 600;
				color: #303133;
				margin-bottom: 20px;
				padding-bottom: 15px;
				border-bottom: 2px solid #f5f7fa;
			}
		}

		.address-section {
			.address-list {
				display: grid;
				gap: 15px;

				.address-item {
					border: 2px solid #dcdfe6;
					border-radius: 8px;
					padding: 20px;
					cursor: pointer;
					transition: all 0.3s;
					display: flex;
					justify-content: space-between;
					align-items: center;

					&:hover {
						border-color: #667eea;
					}

					&.active {
						border-color: #67c23a;
						background: #f0f9ff;
					}

					&.add-new {
						justify-content: center;
						gap: 10px;
						color: #667eea;
						border-style: dashed;

						&:hover {
							background: #f5f7fa;
						}
					}

					.address-info {
						flex: 1;

						.receiver {
							display: flex;
							align-items: center;
							gap: 15px;
							margin-bottom: 10px;

							.name {
								font-size: 16px;
								font-weight: 600;
								color: #303133;
							}

							.phone {
								font-size: 14px;
								color: #606266;
							}
						}

						.address-detail {
							font-size: 14px;
							color: #909399;
							line-height: 1.6;
						}
					}

					.check-icon {
						font-size: 24px;
					}
				}
			}
		}

		.goods-section {
			.goods-list {
				.goods-item {
					display: grid;
					grid-template-columns: 80px 1fr 100px 80px 100px;
					gap: 20px;
					align-items: center;
					padding: 15px 0;
					border-bottom: 1px solid #f5f7fa;

					&:last-child {
						border-bottom: none;
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

					.product-total {
						font-size: 18px;
						color: #f56c6c;
						font-weight: bold;
						text-align: right;
					}
				}
			}
		}

		.summary-section {
			.summary-item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 12px 0;
				font-size: 14px;

				&.total {
					padding-top: 20px;
					margin-top: 15px;
					border-top: 2px solid #f5f7fa;

					.label {
						font-size: 18px;
						font-weight: 600;
						color: #303133;
					}

					.value {
						font-size: 28px;
						color: #f56c6c;
						font-weight: bold;
					}
				}

				.label {
					color: #606266;
				}

				.value {
					color: #303133;
					font-weight: 500;
				}
			}
		}

		.submit-section {
			text-align: center;
			margin-top: 30px;

			.el-button {
				width: 300px;
				height: 50px;
				font-size: 18px;
			}
		}
	}
}
</style>
