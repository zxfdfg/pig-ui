<template>
	<div class="shop-container">
		<!-- 顶部导航 -->
		<div class="shop-header">
			<div class="header-content">
				<div class="logo">🛍️ PIG商城</div>
				<div class="search-bar">
					<el-input v-model="searchKeyword" placeholder="搜索商品" prefix-icon="Search" @keyup.enter="handleSearch">
						<template #append>
							<el-button icon="Search" @click="handleSearch" />
						</template>
					</el-input>
				</div>
				<div class="header-actions">
					<el-badge :value="cartCount" class="cart-badge">
						<el-button icon="ShoppingCart" circle @click="goToCart" />
					</el-badge>
					<el-button icon="User" circle @click="goToOrders" />
				</div>
			</div>
		</div>

		<!-- 分类导航 -->
		<div class="category-nav">
			<div class="category-content">
				<div
					v-for="cat in categories"
					:key="cat.id"
					:class="['category-item', { active: selectedCategory === cat.id }]"
					@click="selectCategory(cat.id)"
				>
					{{ cat.name }}
				</div>
			</div>
		</div>

		<!-- 商品列表 -->
		<div class="product-list">
			<div class="product-grid">
				<div v-for="product in productList" :key="product.id" class="product-card" @click="goToDetail(product.id)">
					<div class="product-image">
						<img :src="product.image || '/default-product.png'" :alt="product.name" />
						<div v-if="product.stock <= 0" class="sold-out-mask">已售罄</div>
					</div>
					<div class="product-info">
						<div class="product-name">{{ product.name }}</div>
						<div class="product-desc">{{ product.description }}</div>
						<div class="product-footer">
							<div class="product-price">
								<span class="price-symbol">¥</span>
								<span class="price-value">{{ product.price }}</span>
							</div>
							<el-button
								type="primary"
								size="small"
								icon="ShoppingCart"
								:disabled="product.stock <= 0"
								@click.stop="addToCart(product)"
							>
								加入购物车
							</el-button>
						</div>
					</div>
				</div>
			</div>

			<!-- 分页 -->
			<div class="pagination-wrapper">
				<el-pagination
					v-model:current-page="queryForm.current"
					v-model:page-size="queryForm.size"
					:total="total"
					:page-sizes="[12, 24, 36, 48]"
					layout="total, sizes, prev, pager, next, jumper"
					@size-change="getProductList"
					@current-change="getProductList"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="Shop">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductPage as fetchProductPage } from '@/api/shop/product'
import { addToCart as addToCartApi } from '@/api/shop/cart'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 分类列表
const categories = ref([
	{ id: null, name: '全部' },
	{ id: 1, name: '数码产品' },
	{ id: 2, name: '生活用品' },
	{ id: 3, name: '图书音像' },
	{ id: 4, name: '服装鞋包' }
])

// 选中的分类
const selectedCategory = ref(null)

// 商品列表
const productList = ref([])
const total = ref(0)
const cartCount = ref(0)

// 查询参数
const queryForm = ref({
	current: 1,
	size: 12,
	categoryId: null,
	keyword: ''
})

// 获取商品列表
const getProductList = async () => {
	try {
		const res = await fetchProductPage(queryForm.value)
		productList.value = res.data.records
		total.value = res.data.total
	} catch (error) {
		ElMessage.error('获取商品列表失败')
	}
}

// 搜索
const handleSearch = () => {
	queryForm.value.keyword = searchKeyword.value
	queryForm.value.current = 1
	getProductList()
}

// 选择分类
const selectCategory = (categoryId: any) => {
	selectedCategory.value = categoryId
	queryForm.value.categoryId = categoryId
	queryForm.value.current = 1
	getProductList()
}

// 加入购物车
const addToCart = async (product: any) => {
	try {
		await addToCartApi({
			productId: product.id,
			skuId: product.defaultSkuId || null,
			quantity: 1
		})
		ElMessage.success('已加入购物车')
		cartCount.value++
	} catch (error) {
		ElMessage.error('加入购物车失败')
	}
}

// 跳转到商品详情
const goToDetail = (productId: number) => {
	router.push(`/shop/product/${productId}`)
}

// 跳转到购物车
const goToCart = () => {
	router.push('/shop/cart')
}

// 跳转到订单列表
const goToOrders = () => {
	router.push('/shop/orders')
}

onMounted(() => {
	getProductList()
})
</script>

<style scoped lang="scss">
.shop-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding-bottom: 40px;
}

.shop-header {
	background: #fff;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	position: sticky;
	top: 0;
	z-index: 100;

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 30px;

		.logo {
			font-size: 24px;
			font-weight: bold;
			color: #667eea;
			white-space: nowrap;
		}

		.search-bar {
			flex: 1;
			max-width: 600px;
		}

		.header-actions {
			display: flex;
			gap: 15px;

			.cart-badge {
				:deep(.el-badge__content) {
					background-color: #f56c6c;
				}
			}
		}
	}
}

.category-nav {
	background: #fff;
	margin-top: 2px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

	.category-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 15px 20px;
		display: flex;
		gap: 30px;
		overflow-x: auto;

		.category-item {
			padding: 8px 20px;
			border-radius: 20px;
			cursor: pointer;
			white-space: nowrap;
			transition: all 0.3s;
			color: #666;
			font-size: 14px;

			&:hover {
				background: #f5f7fa;
				color: #667eea;
			}

			&.active {
				background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
				color: #fff;
			}
		}
	}
}

.product-list {
	max-width: 1200px;
	margin: 30px auto;
	padding: 0 20px;

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 30px;

		.product-card {
			background: #fff;
			border-radius: 12px;
			overflow: hidden;
			cursor: pointer;
			transition: all 0.3s;
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

			&:hover {
				transform: translateY(-8px);
				box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
			}

			.product-image {
				position: relative;
				width: 100%;
				height: 280px;
				overflow: hidden;
				background: #f5f7fa;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 0.3s;
				}

				&:hover img {
					transform: scale(1.1);
				}

				.sold-out-mask {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: rgba(0, 0, 0, 0.6);
					color: #fff;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 24px;
					font-weight: bold;
				}
			}

			.product-info {
				padding: 15px;

				.product-name {
					font-size: 16px;
					font-weight: 600;
					color: #303133;
					margin-bottom: 8px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.product-desc {
					font-size: 13px;
					color: #909399;
					margin-bottom: 15px;
					height: 36px;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}

				.product-footer {
					display: flex;
					align-items: center;
					justify-content: space-between;

					.product-price {
						color: #f56c6c;
						font-weight: bold;

						.price-symbol {
							font-size: 14px;
						}

						.price-value {
							font-size: 24px;
						}
					}
				}
			}
		}
	}

	.pagination-wrapper {
		display: flex;
		justify-content: center;
		padding: 20px 0;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}
}
</style>
