<template>
	<div class="distributor-product-container">
		<!-- 搜索栏 -->
		<el-card class="search-card" shadow="never">
			<el-form :inline="true" :model="searchForm" class="search-form">
				<el-form-item label="商品名称">
					<el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
				</el-form-item>
				<el-form-item label="商品分类">
					<el-tree-select
						v-model="searchForm.categoryId"
						:data="categoryTree"
						:props="{ label: 'name', value: 'id' }"
						placeholder="请选择分类"
						clearable
						check-strictly
					/>
				</el-form-item>
				<el-form-item label="排序方式">
					<el-select v-model="searchForm.sortBy" placeholder="请选择排序" clearable>
						<el-option label="佣金从高到低" value="commission_desc" />
						<el-option label="价格从低到高" value="price_asc" />
						<el-option label="价格从高到低" value="price_desc" />
						<el-option label="销量从高到低" value="sales_desc" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 筛选栏 -->
		<el-card class="filter-card" shadow="never">
			<el-radio-group v-model="searchForm.commissionFilter" @change="handleSearch">
				<el-radio-button label="">全部商品</el-radio-button>
				<el-radio-button label="high">高佣商品（≥10%）</el-radio-button>
				<el-radio-button label="medium">中佣商品（5%-10%）</el-radio-button>
				<el-radio-button label="low">低佣商品（<5%）</el-radio-button>
			</el-radio-group>
		</el-card>

		<!-- 商品列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="productList" border stripe>
				<el-table-column prop="coverImage" label="封面图" width="100">
					<template #default="{ row }">
						<el-image
							v-if="row.coverImage"
							:src="row.coverImage"
							:preview-src-list="[row.coverImage]"
							fit="cover"
							style="width: 60px; height: 60px"
						/>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="商品名称" min-width="200" show-overflow-tooltip />
				<el-table-column prop="price" label="价格" width="120">
					<template #default="{ row }"> ¥{{ row.price }} </template>
				</el-table-column>
				<el-table-column prop="stock" label="库存" width="100" />
				<el-table-column prop="sales" label="销量" width="100" />
				<el-table-column label="佣金比例" width="250">
					<template #default="{ row }">
						<div style="display: flex; flex-direction: column; gap: 5px">
							<div>
								<el-tag type="danger" size="small">一级: {{ row.level1Rate }}%</el-tag>
							</div>
							<div>
								<el-tag type="warning" size="small">二级: {{ row.level2Rate }}%</el-tag>
							</div>
							<div>
								<el-tag type="info" size="small">三级: {{ row.level3Rate }}%</el-tag>
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="预期收益" width="150">
					<template #default="{ row }">
						<div style="color: #f56c6c; font-weight: bold">¥{{ calculateCommission(row) }}</div>
						<div style="font-size: 12px; color: #909399">（一级分销）</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="{ row }">
						<el-button type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
						<el-button type="success" size="small" @click="handleGenerateLink(row)">生成推广链接</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页 -->
			<el-pagination
				v-model:current-page="pagination.current"
				v-model:page-size="pagination.size"
				:total="pagination.total"
				:page-sizes="[10, 20, 50, 100]"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleSearch"
				@current-change="handleSearch"
			/>
		</el-card>

		<!-- 商品详情对话框 -->
		<el-dialog v-model="detailDialogVisible" title="商品详情" width="800px">
			<el-descriptions :column="2" border>
				<el-descriptions-item label="商品ID">{{ currentProduct?.id }}</el-descriptions-item>
				<el-descriptions-item label="商品名称">{{ currentProduct?.name }}</el-descriptions-item>
				<el-descriptions-item label="商品分类">{{ currentProduct?.categoryName }}</el-descriptions-item>
				<el-descriptions-item label="商品类型">
					<el-tag :type="currentProduct?.type === 0 ? 'success' : 'warning'">
						{{ currentProduct?.type === 0 ? '实物' : '虚拟' }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="价格">¥{{ currentProduct?.price }}</el-descriptions-item>
				<el-descriptions-item label="市场价">¥{{ currentProduct?.marketPrice }}</el-descriptions-item>
				<el-descriptions-item label="库存">{{ currentProduct?.stock }}</el-descriptions-item>
				<el-descriptions-item label="销量">{{ currentProduct?.sales }}</el-descriptions-item>
				<el-descriptions-item label="一级佣金">{{ currentProduct?.level1Rate }}%</el-descriptions-item>
				<el-descriptions-item label="二级佣金">{{ currentProduct?.level2Rate }}%</el-descriptions-item>
				<el-descriptions-item label="三级佣金">{{ currentProduct?.level3Rate }}%</el-descriptions-item>
				<el-descriptions-item label="预期收益">
					<span style="color: #f56c6c; font-weight: bold">¥{{ calculateCommission(currentProduct) }}</span>
				</el-descriptions-item>
				<el-descriptions-item label="商品描述" :span="2">
					{{ currentProduct?.description }}
				</el-descriptions-item>
			</el-descriptions>
		</el-dialog>

		<!-- 推广链接对话框 -->
		<el-dialog v-model="linkDialogVisible" title="推广链接" width="600px">
			<el-form label-width="100px">
				<el-form-item label="商品名称">
					<el-input :value="currentProduct?.name" disabled />
				</el-form-item>
				<el-form-item label="推广链接">
					<el-input v-model="promotionLink" readonly>
						<template #append>
							<el-button @click="handleCopyLink">复制</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="二维码">
					<div ref="qrcodeRef" style="width: 200px; height: 200px"></div>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="DistributorProduct">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getProductPage } from '/@/api/product/product'
import { getCategoryTree } from '/@/api/product/category'
import { useUserInfo } from '/@/stores/userInfo'
import QRCode from 'qrcode'

// 搜索表单
const searchForm = reactive({
	name: '',
	categoryId: null,
	sortBy: 'commission_desc',
	commissionFilter: '',
	status: 1 // 只查询上架商品
})

// 分页
const pagination = reactive({
	current: 1,
	size: 10,
	total: 0
})

// 商品列表
const loading = ref(false)
const productList = ref([])

// 分类树
const categoryTree = ref([])

// 详情对话框
const detailDialogVisible = ref(false)
const currentProduct = ref<any>(null)

// 推广链接对话框
const linkDialogVisible = ref(false)
const promotionLink = ref('')
const qrcodeRef = ref<HTMLElement>()

// 用户信息
const userStore = useUserInfo()

// 查询商品列表
const handleSearch = async () => {
	loading.value = true
	try {
		const params = {
			current: pagination.current,
			size: pagination.size,
			...searchForm
		}
		const res = await getProductPage(params)
		productList.value = res.data.records
		pagination.total = res.data.total
	} catch (error) {
		ElMessage.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 重置搜索
const handleReset = () => {
	searchForm.name = ''
	searchForm.categoryId = null
	searchForm.sortBy = 'commission_desc'
	searchForm.commissionFilter = ''
	pagination.current = 1
	handleSearch()
}

// 加载分类树
const loadCategoryTree = async () => {
	try {
		const res = await getCategoryTree()
		categoryTree.value = res.data
	} catch (error) {
		ElMessage.error('加载分类失败')
	}
}

// 计算佣金
const calculateCommission = (product: any) => {
	if (!product) return 0
	return ((product.price * product.level1Rate) / 100).toFixed(2)
}

// 查看详情
const handleViewDetail = (row: any) => {
	currentProduct.value = row
	detailDialogVisible.value = true
}

// 生成推广链接
const handleGenerateLink = async (row: any) => {
	currentProduct.value = row
	const distributorId = userStore.userInfo?.distributorId || 1
	promotionLink.value = `${window.location.origin}/product/${row.id}?distributor=${distributorId}`
	linkDialogVisible.value = true

	// 生成二维码
	await nextTick()
	if (qrcodeRef.value) {
		QRCode.toCanvas(qrcodeRef.value, promotionLink.value, {
			width: 200,
			margin: 1
		})
	}
}

// 复制链接
const handleCopyLink = () => {
	navigator.clipboard.writeText(promotionLink.value).then(() => {
		ElMessage.success('复制成功')
	})
}

onMounted(() => {
	loadCategoryTree()
	handleSearch()
})
</script>

<style scoped lang="scss">
.distributor-product-container {
	padding: 20px;

	.search-card,
	.filter-card,
	.table-card {
		margin-bottom: 20px;
	}

	.el-pagination {
		margin-top: 20px;
		justify-content: flex-end;
	}
}
</style>
