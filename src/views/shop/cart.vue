<template>
	<div class="cart-container">
		<div class="cart-content">
			<h1 class="page-title">🛒 购物车</h1>

			<div v-if="cartList.length > 0" class="cart-main">
				<!-- 购物车列表 -->
				<div class="cart-list">
					<div class="cart-header">
						<el-checkbox v-model="allSelected" @change="handleSelectAll">全选</el-checkbox>
						<span class="header-title">商品信息</span>
						<span class="header-price">单价</span>
						<span class="header-quantity">数量</span>
						<span class="header-total">小计</span>
						<span class="header-action">操作</span>
					</div>

					<div v-for="item in cartList" :key="item.id" class="cart-item">
						<el-checkbox v-model="item.selected" @change="handleSelectItem(item)" />
						<div class="item-product">
							<img :src="item.productImage" :alt="item.productName" class="product-image" />
							<div class="product-info">
								<div class="product-name">{{ item.productName }}</div>
								<div v-if="item.skuName" class="product-sku">{{ item.skuName }}</div>
							</div>
						</div>
						<div class="item-price">¥{{ item.price }}</div>
						<div class="item-quantity">
							<el-input-number v-model="item.quantity" :min="1" :max="item.stock" @change="handleQuantityChange(item)" />
						</div>
						<div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
						<div class="item-action">
							<el-button type="danger" text @click="handleRemove(item)">删除</el-button>
						</div>
					</div>
				</div>

				<!-- 结算栏 -->
				<div class="cart-footer">
					<div class="footer-left">
						<el-checkbox v-model="allSelected" @change="handleSelectAll">全选</el-checkbox>
						<el-button text @click="handleClearSelected">删除选中商品</el-button>
					</div>
					<div class="footer-right">
						<div class="total-info">
							<span class="label">已选商品</span>
							<span class="count">{{ selectedCount }}</span>
							<span class="label">件</span>
						</div>
						<div class="total-price">
							<span class="label">合计：</span>
							<span class="price">¥{{ totalPrice }}</span>
						</div>
						<el-button type="danger" size="large" :disabled="selectedCount === 0" @click="handleCheckout">
							去结算
						</el-button>
					</div>
				</div>
			</div>

			<!-- 空购物车 -->
			<div v-else class="empty-cart">
				<el-empty description="购物车是空的">
					<el-button type="primary" @click="goToShop">去逛逛</el-button>
				</el-empty>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="Cart">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
	getCartList as fetchCartList,
	updateCartQuantity,
	deleteCartItem,
	batchDeleteCartItems,
	selectCartItem,
	selectAllCartItems
} from '@/api/shop/cart'

const router = useRouter()

// 购物车列表
const cartList = ref([])

// 全选状态
const allSelected = computed({
	get: () => cartList.value.length > 0 && cartList.value.every((item) => item.selected),
	set: (val) => {
		cartList.value.forEach((item) => (item.selected = val))
	}
})

// 选中数量
const selectedCount = computed(() => {
	return cartList.value.filter((item) => item.selected).reduce((sum, item) => sum + item.quantity, 0)
})

// 总价
const totalPrice = computed(() => {
	return cartList.value
		.filter((item) => item.selected)
		.reduce((sum, item) => sum + item.price * item.quantity, 0)
		.toFixed(2)
})

// 获取购物车列表
const getCartList = async () => {
	try {
		const res = await fetchCartList()
		cartList.value = res.data.map((item: any) => ({
			...item,
			selected: item.selected === 1
		}))
	} catch (error) {
		ElMessage.error('获取购物车失败')
	}
}

// 全选/取消全选
const handleSelectAll = async () => {
	try {
		await selectAllCartItems(allSelected.value ? 1 : 0)
	} catch (error) {
		ElMessage.error('操作失败')
	}
}

// 选中单个商品
const handleSelectItem = async (item: any) => {
	try {
		await selectCartItem(item.id, item.selected ? 1 : 0)
	} catch (error) {
		ElMessage.error('操作失败')
		item.selected = !item.selected
	}
}

// 修改数量
const handleQuantityChange = async (item: any) => {
	try {
		await updateCartQuantity(item.id, item.quantity)
	} catch (error) {
		ElMessage.error('更新数量失败')
		getCartList()
	}
}

// 删除商品
const handleRemove = async (item: any) => {
	try {
		await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})

		await deleteCartItem(item.id)
		ElMessage.success('删除成功')
		getCartList()
	} catch (error: any) {
		if (error !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

// 删除选中商品
const handleClearSelected = async () => {
	const selectedItems = cartList.value.filter((item) => item.selected)
	if (selectedItems.length === 0) {
		ElMessage.warning('请先选择要删除的商品')
		return
	}

	try {
		await ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.length} 件商品吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		})

		await batchDeleteCartItems(selectedItems.map((item) => item.id))
		ElMessage.success('删除成功')
		getCartList()
	} catch (error: any) {
		if (error !== 'cancel') {
			ElMessage.error('删除失败')
		}
	}
}

// 去结算
const handleCheckout = () => {
	const selectedItems = cartList.value.filter((item) => item.selected)
	if (selectedItems.length === 0) {
		ElMessage.warning('请先选择要结算的商品')
		return
	}

	// 跳转到订单确认页
	router.push({
		path: '/shop/checkout',
		query: {
			from: 'cart',
			cartIds: selectedItems.map((item) => item.id).join(',')
		}
	})
}

// 去逛逛
const goToShop = () => {
	router.push('/shop')
}

onMounted(() => {
	getCartList()
})
</script>

<style scoped lang="scss">
.cart-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40px 20px;
}

.cart-content {
	max-width: 1200px;
	margin: 0 auto;

	.page-title {
		font-size: 32px;
		font-weight: bold;
		color: #fff;
		margin-bottom: 30px;
		text-align: center;
	}

	.cart-main {
		background: #fff;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

		.cart-list {
			.cart-header {
				display: grid;
				grid-template-columns: 50px 1fr 120px 150px 120px 80px;
				gap: 20px;
				align-items: center;
				padding: 20px;
				background: #f5f7fa;
				font-weight: 600;
				color: #606266;
			}

			.cart-item {
				display: grid;
				grid-template-columns: 50px 1fr 120px 150px 120px 80px;
				gap: 20px;
				align-items: center;
				padding: 20px;
				border-bottom: 1px solid #f5f7fa;
				transition: background 0.3s;

				&:hover {
					background: #fafafa;
				}

				.item-product {
					display: flex;
					gap: 15px;
					align-items: center;

					.product-image {
						width: 80px;
						height: 80px;
						border-radius: 8px;
						object-fit: cover;
					}

					.product-info {
						flex: 1;

						.product-name {
							font-size: 14px;
							color: #303133;
							margin-bottom: 5px;
							font-weight: 500;
						}

						.product-sku {
							font-size: 12px;
							color: #909399;
						}
					}
				}

				.item-price {
					font-size: 16px;
					color: #f56c6c;
					font-weight: 600;
				}

				.item-total {
					font-size: 18px;
					color: #f56c6c;
					font-weight: bold;
				}
			}
		}

		.cart-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20px;
			background: #fafafa;
			border-top: 2px solid #f5f7fa;

			.footer-left {
				display: flex;
				align-items: center;
				gap: 20px;
			}

			.footer-right {
				display: flex;
				align-items: center;
				gap: 30px;

				.total-info {
					font-size: 14px;
					color: #606266;

					.count {
						color: #f56c6c;
						font-weight: bold;
						margin: 0 5px;
					}
				}

				.total-price {
					.label {
						font-size: 16px;
						color: #606266;
					}

					.price {
						font-size: 28px;
						color: #f56c6c;
						font-weight: bold;
						margin-left: 10px;
					}
				}

				.el-button {
					height: 50px;
					padding: 0 40px;
					font-size: 16px;
				}
			}
		}
	}

	.empty-cart {
		background: #fff;
		border-radius: 16px;
		padding: 80px 20px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}
}
</style>
