<template>
	<div class="product-detail-container">
		<!-- 返回按钮 -->
		<div class="back-button">
			<el-button icon="ArrowLeft" @click="goBack">返回商品列表</el-button>
		</div>

		<div class="product-detail">
			<!-- 左侧：商品图片 -->
			<div class="product-images">
				<div class="main-image">
					<img :src="currentImage" alt="商品图片" />
				</div>
				<div class="image-list">
					<div
						v-for="(img, index) in product.images"
						:key="index"
						:class="['image-item', { active: currentImage === img }]"
						@click="currentImage = img"
					>
						<img :src="img" alt="商品图片" />
					</div>
				</div>
			</div>

			<!-- 右侧：商品信息 -->
			<div class="product-info-panel">
				<h1 class="product-title">{{ product.name }}</h1>
				<div class="product-subtitle">{{ product.description }}</div>

				<div class="price-section">
					<div class="current-price">
						<span class="label">价格</span>
						<span class="price">
							<span class="symbol">¥</span>
							<span class="value">{{ selectedSku.price || product.price }}</span>
						</span>
					</div>
					<div class="stock-info">
						<span class="label">库存</span>
						<span class="value">{{ selectedSku.stock || product.stock }}</span>
					</div>
				</div>

				<!-- SKU选择 -->
				<div v-if="product.skus && product.skus.length > 0" class="sku-section">
					<div class="sku-title">规格选择</div>
					<div class="sku-options">
						<div
							v-for="sku in product.skus"
							:key="sku.id"
							:class="['sku-item', { active: selectedSku.id === sku.id, disabled: sku.stock <= 0 }]"
							@click="selectSku(sku)"
						>
							{{ sku.name }}
							<span v-if="sku.stock <= 0" class="sold-out-tag">售罄</span>
						</div>
					</div>
				</div>

				<!-- 数量选择 -->
				<div class="quantity-section">
					<span class="label">数量</span>
					<el-input-number v-model="quantity" :min="1" :max="selectedSku.stock || product.stock" />
				</div>

				<!-- 推广链接 -->
				<div v-if="distributorId" class="distributor-info">
					<el-icon><User /></el-icon>
					<span>由分销商推荐</span>
				</div>

				<!-- 操作按钮 -->
				<div class="action-buttons">
					<el-button
						type="primary"
						size="large"
						icon="ShoppingCart"
						:disabled="(selectedSku.stock || product.stock) <= 0"
						@click="addToCart"
					>
						加入购物车
					</el-button>
					<el-button
						type="danger"
						size="large"
						icon="ShoppingBag"
						:disabled="(selectedSku.stock || product.stock) <= 0"
						@click="buyNow"
					>
						立即购买
					</el-button>
				</div>
			</div>
		</div>

		<!-- 商品详情 -->
		<div class="product-description">
			<div class="description-title">商品详情</div>
			<div class="description-content" v-html="product.detail"></div>
		</div>
	</div>
</template>

<script setup lang="ts" name="ProductDetail">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductById as fetchProductById } from '@/api/shop/product'
import { addToCart as addToCartApi } from '@/api/shop/cart'

const router = useRouter()
const route = useRoute()

// 商品ID
const productId = ref(route.params.id)

// 分销商ID（从URL参数获取）
const distributorId = ref(route.query.distributorId)

// 商品信息
const product = ref({
	id: 1,
	name: '高端商品名称',
	description: '这是一个非常优质的商品，值得您的选择',
	price: 999.0,
	stock: 100,
	images: [
		'https://via.placeholder.com/600x600?text=Image1',
		'https://via.placeholder.com/600x600?text=Image2',
		'https://via.placeholder.com/600x600?text=Image3',
		'https://via.placeholder.com/600x600?text=Image4'
	],
	skus: [
		{ id: 1, name: '标准版', price: 999.0, stock: 50 },
		{ id: 2, name: '豪华版', price: 1299.0, stock: 30 },
		{ id: 3, name: '旗舰版', price: 1599.0, stock: 0 }
	],
	detail: `
    <h3>产品特点</h3>
    <p>1. 高品质材料，精工细作</p>
    <p>2. 人性化设计，使用便捷</p>
    <p>3. 售后无忧，品质保证</p>
    <h3>产品参数</h3>
    <p>尺寸：标准尺寸</p>
    <p>重量：适中</p>
    <p>材质：优质材料</p>
  `
})

// 当前显示的图片
const currentImage = ref(product.value.images[0])

// 选中的SKU
const selectedSku = ref(product.value.skus?.[0] || {})

// 购买数量
const quantity = ref(1)

// 获取商品详情
const getProductDetail = async () => {
	try {
		const res = await fetchProductById(Number(productId.value))
		product.value = res.data

		// 处理图片
		if (product.value.images && product.value.images.length > 0) {
			currentImage.value = product.value.images[0]
		}

		// 处理SKU
		if (product.value.skus && product.value.skus.length > 0) {
			selectedSku.value = product.value.skus.find((sku: any) => sku.stock > 0) || product.value.skus[0]
		}
	} catch (error) {
		ElMessage.error('获取商品详情失败')
		router.back()
	}
}

// 选择SKU
const selectSku = (sku: any) => {
	if (sku.stock <= 0) {
		ElMessage.warning('该规格已售罄')
		return
	}
	selectedSku.value = sku
	quantity.value = 1
}

// 加入购物车
const addToCart = async () => {
	try {
		await addToCartApi({
			productId: product.value.id,
			skuId: selectedSku.value.id || null,
			quantity: quantity.value
		})
		ElMessage.success('已加入购物车')
	} catch (error) {
		ElMessage.error('加入购物车失败')
	}
}

// 立即购买
const buyNow = () => {
	// 跳转到订单确认页
	router.push({
		path: '/shop/checkout',
		query: {
			productId: product.value.id,
			skuId: selectedSku.value.id,
			quantity: quantity.value,
			distributorId: distributorId.value
		}
	})
}

// 返回
const goBack = () => {
	router.back()
}

onMounted(() => {
	getProductDetail()
})
</script>

<style scoped lang="scss">
.product-detail-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 20px;
}

.back-button {
	max-width: 1200px;
	margin: 0 auto 20px;
}

.product-detail {
	max-width: 1200px;
	margin: 0 auto;
	background: #fff;
	border-radius: 16px;
	padding: 40px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 60px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

	.product-images {
		.main-image {
			width: 100%;
			height: 500px;
			border-radius: 12px;
			overflow: hidden;
			background: #f5f7fa;
			margin-bottom: 20px;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		.image-list {
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 10px;

			.image-item {
				height: 100px;
				border-radius: 8px;
				overflow: hidden;
				cursor: pointer;
				border: 2px solid transparent;
				transition: all 0.3s;

				&:hover {
					border-color: #667eea;
				}

				&.active {
					border-color: #667eea;
				}

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}
	}

	.product-info-panel {
		.product-title {
			font-size: 28px;
			font-weight: bold;
			color: #303133;
			margin-bottom: 10px;
		}

		.product-subtitle {
			font-size: 14px;
			color: #909399;
			margin-bottom: 30px;
		}

		.price-section {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border-radius: 12px;
			padding: 20px;
			margin-bottom: 30px;
			display: flex;
			justify-content: space-between;
			align-items: center;

			.current-price {
				.label {
					display: block;
					color: rgba(255, 255, 255, 0.8);
					font-size: 14px;
					margin-bottom: 5px;
				}

				.price {
					color: #fff;
					font-weight: bold;

					.symbol {
						font-size: 20px;
					}

					.value {
						font-size: 36px;
					}
				}
			}

			.stock-info {
				text-align: right;

				.label {
					display: block;
					color: rgba(255, 255, 255, 0.8);
					font-size: 14px;
					margin-bottom: 5px;
				}

				.value {
					color: #fff;
					font-size: 24px;
					font-weight: bold;
				}
			}
		}

		.sku-section {
			margin-bottom: 30px;

			.sku-title {
				font-size: 16px;
				font-weight: 600;
				color: #303133;
				margin-bottom: 15px;
			}

			.sku-options {
				display: flex;
				flex-wrap: wrap;
				gap: 10px;

				.sku-item {
					padding: 10px 20px;
					border: 2px solid #dcdfe6;
					border-radius: 8px;
					cursor: pointer;
					transition: all 0.3s;
					position: relative;

					&:hover:not(.disabled) {
						border-color: #667eea;
						color: #667eea;
					}

					&.active {
						border-color: #667eea;
						background: #667eea;
						color: #fff;
					}

					&.disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}

					.sold-out-tag {
						position: absolute;
						top: -8px;
						right: -8px;
						background: #f56c6c;
						color: #fff;
						font-size: 12px;
						padding: 2px 6px;
						border-radius: 4px;
					}
				}
			}
		}

		.quantity-section {
			margin-bottom: 30px;
			display: flex;
			align-items: center;
			gap: 20px;

			.label {
				font-size: 16px;
				font-weight: 600;
				color: #303133;
			}
		}

		.distributor-info {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 12px;
			background: #f0f9ff;
			border-radius: 8px;
			color: #409eff;
			margin-bottom: 30px;
			font-size: 14px;
		}

		.action-buttons {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 15px;

			.el-button {
				height: 50px;
				font-size: 16px;
			}
		}
	}
}

.product-description {
	max-width: 1200px;
	margin: 30px auto 0;
	background: #fff;
	border-radius: 16px;
	padding: 40px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

	.description-title {
		font-size: 24px;
		font-weight: bold;
		color: #303133;
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 2px solid #f5f7fa;
	}

	.description-content {
		color: #606266;
		line-height: 1.8;

		:deep(h3) {
			font-size: 18px;
			margin: 20px 0 10px;
		}

		:deep(p) {
			margin: 10px 0;
		}
	}
}
</style>
