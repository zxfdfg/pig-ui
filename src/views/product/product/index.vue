<template>
	<div class="product-container">
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
				<el-form-item label="商品状态">
					<el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
						<el-option label="草稿" :value="0" />
						<el-option label="上架" :value="1" />
						<el-option label="下架" :value="2" />
						<el-option label="售罄" :value="3" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 操作栏 -->
		<el-card class="toolbar-card" shadow="never">
			<el-button v-auth="'product_product_add'" type="primary" @click="handleAdd">新增商品</el-button>
		</el-card>

		<!-- 商品列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="productList" border stripe>
				<el-table-column prop="id" label="商品ID" width="80" />
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
				<el-table-column prop="name" label="商品名称" min-width="150" show-overflow-tooltip />
				<el-table-column prop="categoryId" label="分类" width="120">
					<template #default="{ row }">
						{{ getCategoryName(row.categoryId) }}
					</template>
				</el-table-column>
				<el-table-column prop="type" label="类型" width="100">
					<template #default="{ row }">
						<el-tag :type="row.type === 0 ? 'success' : 'warning'">
							{{ row.type === 0 ? '实物' : '虚拟' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="price" label="价格" width="100">
					<template #default="{ row }"> ¥{{ row.price }} </template>
				</el-table-column>
				<el-table-column prop="stock" label="库存" width="100" />
				<el-table-column prop="sales" label="销量" width="100" />
				<el-table-column prop="status" label="状态" width="100">
					<template #default="{ row }">
						<el-tag :type="getStatusType(row.status)">
							{{ getStatusText(row.status) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="250" fixed="right">
					<template #default="{ row }">
						<el-button v-auth="'product_product_edit'" link type="primary" size="small" @click="handleEdit(row)">
							编辑
						</el-button>
						<el-button
							v-if="row.status === 2 || row.status === 0"
							v-auth="'product_product_status'"
							link
							type="success"
							size="small"
							@click="handleOnline(row)"
						>
							上架
						</el-button>
						<el-button
							v-if="row.status === 1"
							v-auth="'product_product_status'"
							link
							type="warning"
							size="small"
							@click="handleOffline(row)"
						>
							下架
						</el-button>
						<el-button v-auth="'product_product_del'" link type="danger" size="small" @click="handleDelete(row)">
							删除
						</el-button>
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

		<!-- 商品表单对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="800px"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
				<el-form-item label="商品名称" prop="name">
					<el-input v-model="form.name" placeholder="请输入商品名称" />
				</el-form-item>
				<el-form-item label="商品分类" prop="categoryId">
					<el-tree-select
						v-model="form.categoryId"
						:data="categoryTree"
						:props="{ label: 'name', value: 'id' }"
						placeholder="请选择分类"
						check-strictly
					/>
				</el-form-item>
				<el-form-item label="商品类型" prop="type">
					<el-radio-group v-model="form.type">
						<el-radio :label="0">实物商品</el-radio>
						<el-radio :label="1">虚拟商品</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="商品价格" prop="price">
					<el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
				</el-form-item>
				<el-form-item label="成本价">
					<el-input-number v-model="form.costPrice" :min="0" :precision="2" :step="1" />
				</el-form-item>
				<el-form-item label="市场价">
					<el-input-number v-model="form.marketPrice" :min="0" :precision="2" :step="1" />
				</el-form-item>
				<el-form-item label="库存数量">
					<el-input-number v-model="form.stock" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="库存预警">
					<el-input-number v-model="form.stockWarning" :min="0" :step="1" />
				</el-form-item>
				<el-form-item label="商品描述">
					<el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="ProductList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
	getProductPage,
	createProduct,
	updateProduct,
	deleteProduct,
	updateProductStatus
} from '/@/api/product/product'
import { getCategoryTree } from '/@/api/product/category'

// 搜索表单
const searchForm = reactive({
	name: '',
	categoryId: null,
	status: null
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
const categoryMap = ref(new Map())

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive({
	id: null,
	name: '',
	categoryId: null,
	type: 0,
	price: 0,
	costPrice: 0,
	marketPrice: 0,
	stock: 0,
	stockWarning: 10,
	description: ''
})

// 表单验证规则
const rules = {
	name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
	categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
	type: [{ required: true, message: '请选择商品类型', trigger: 'change' }],
	price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }]
}

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
	searchForm.status = null
	pagination.current = 1
	handleSearch()
}

// 加载分类树
const loadCategoryTree = async () => {
	try {
		const res = await getCategoryTree()
		categoryTree.value = res.data
		// 构建分类映射
		buildCategoryMap(res.data)
	} catch (error) {
		ElMessage.error('加载分类失败')
	}
}

// 构建分类映射
const buildCategoryMap = (categories: any[]) => {
	categories.forEach((category) => {
		categoryMap.value.set(category.id, category.name)
		if (category.children && category.children.length > 0) {
			buildCategoryMap(category.children)
		}
	})
}

// 获取分类名称
const getCategoryName = (categoryId: number) => {
	return categoryMap.value.get(categoryId) || '-'
}

// 获取状态类型
const getStatusType = (status: number) => {
	const types: any = { 0: 'info', 1: 'success', 2: 'warning', 3: 'danger' }
	return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
	const texts: any = { 0: '草稿', 1: '上架', 2: '下架', 3: '售罄' }
	return texts[status] || '未知'
}

// 新增
const handleAdd = () => {
	dialogTitle.value = '新增商品'
	dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
	dialogTitle.value = '编辑商品'
	Object.assign(form, row)
	dialogVisible.value = true
}

// 上架
const handleOnline = async (row: any) => {
	try {
		await updateProductStatus(row.id, 1)
		ElMessage.success('上架成功')
		handleSearch()
	} catch (error: any) {
		ElMessage.error(error.msg || '上架失败')
	}
}

// 下架
const handleOffline = async (row: any) => {
	try {
		await updateProductStatus(row.id, 2)
		ElMessage.success('下架成功')
		handleSearch()
	} catch (error: any) {
		ElMessage.error(error.msg || '下架失败')
	}
}

// 删除
const handleDelete = (row: any) => {
	ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(async () => {
			try {
				await deleteProduct(row.id)
				ElMessage.success('删除成功')
				handleSearch()
			} catch (error: any) {
				ElMessage.error(error.msg || '删除失败')
			}
		})
		.catch(() => {})
}

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (valid) {
			try {
				if (form.id) {
					await updateProduct(form)
					ElMessage.success('更新成功')
				} else {
					await createProduct(form)
					ElMessage.success('创建成功')
				}
				dialogVisible.value = false
				handleSearch()
			} catch (error: any) {
				ElMessage.error(error.msg || '操作失败')
			}
		}
	})
}

// 关闭对话框
const handleDialogClose = () => {
	formRef.value?.resetFields()
	form.id = null
}

onMounted(() => {
	loadCategoryTree()
	handleSearch()
})
</script>

<style scoped lang="scss">
.product-container {
	padding: 20px;

	.search-card,
	.toolbar-card,
	.table-card {
		margin-bottom: 20px;
	}

	.el-pagination {
		margin-top: 20px;
		justify-content: flex-end;
	}
}
</style>
