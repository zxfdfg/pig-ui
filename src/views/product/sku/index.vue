<template>
	<div class="sku-container">
		<!-- 搜索栏 -->
		<el-card class="search-card" shadow="never">
			<el-form :inline="true" :model="searchForm" class="search-form">
				<el-form-item label="商品名称">
					<el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
				</el-form-item>
				<el-form-item label="SKU编码">
					<el-input v-model="searchForm.skuCode" placeholder="请输入SKU编码" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 操作栏 -->
		<el-card class="toolbar-card" shadow="never">
			<el-button type="primary" @click="handleAdd">新增SKU</el-button>
		</el-card>

		<!-- SKU列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="skuList" border stripe>
				<el-table-column prop="id" label="SKU ID" width="80" />
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
				<el-table-column prop="skuCode" label="SKU编码" width="150" />
				<el-table-column prop="attributes" label="规格属性" min-width="200">
					<template #default="{ row }">
						<el-tag v-for="(value, key) in parseAttributes(row.attributes)" :key="key" style="margin-right: 5px">
							{{ key }}: {{ value }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="price" label="价格" width="100">
					<template #default="{ row }"> ¥{{ row.price }} </template>
				</el-table-column>
				<el-table-column prop="stock" label="库存" width="100" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="{ row }">
						<el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
						<el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

		<!-- SKU表单对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="600px"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
				<el-form-item label="商品" prop="productId">
					<el-select v-model="form.productId" placeholder="请选择商品" filterable>
						<el-option
							v-for="product in productList"
							:key="product.id"
							:label="product.name"
							:value="product.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="SKU编码" prop="skuCode">
					<el-input v-model="form.skuCode" placeholder="请输入SKU编码" />
				</el-form-item>
				<el-form-item label="规格属性">
					<div v-for="(attr, index) in form.attributeList" :key="index" style="display: flex; margin-bottom: 10px">
						<el-input v-model="attr.key" placeholder="属性名" style="width: 150px; margin-right: 10px" />
						<el-input v-model="attr.value" placeholder="属性值" style="width: 150px; margin-right: 10px" />
						<el-button type="danger" @click="removeAttribute(index)">删除</el-button>
					</div>
					<el-button type="primary" @click="addAttribute">添加属性</el-button>
				</el-form-item>
				<el-form-item label="价格" prop="price">
					<el-input-number v-model="form.price" :min="0" :precision="2" :step="1" />
				</el-form-item>
				<el-form-item label="库存">
					<el-input-number v-model="form.stock" :min="0" :step="1" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="SkuList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { getSkuPage, createSku, updateSku, deleteSku } from '/@/api/product/sku'
import { getProductPage } from '/@/api/product/product'

// 搜索表单
const searchForm = reactive({
	productName: '',
	skuCode: ''
})

// 分页
const pagination = reactive({
	current: 1,
	size: 10,
	total: 0
})

// SKU列表
const loading = ref(false)
const skuList = ref([])

// 商品列表
const productList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive({
	id: null,
	productId: null,
	skuCode: '',
	attributeList: [] as Array<{ key: string; value: string }>,
	price: 0,
	stock: 0
})

// 表单验证规则
const rules = {
	productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
	skuCode: [{ required: true, message: '请输入SKU编码', trigger: 'blur' }],
	price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
}

// 查询SKU列表
const handleSearch = async () => {
	loading.value = true
	try {
		const params = {
			current: pagination.current,
			size: pagination.size,
			...searchForm
		}
		const res = await getSkuPage(params)
		skuList.value = res.data.records
		pagination.total = res.data.total
	} catch (error) {
		ElMessage.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 重置搜索
const handleReset = () => {
	searchForm.productName = ''
	searchForm.skuCode = ''
	pagination.current = 1
	handleSearch()
}

// 加载商品列表
const loadProductList = async () => {
	try {
		const res = await getProductPage({ current: 1, size: 1000 })
		productList.value = res.data.records
	} catch (error) {
		ElMessage.error('加载商品失败')
	}
}

// 解析属性
const parseAttributes = (attributes: string) => {
	try {
		return JSON.parse(attributes || '{}')
	} catch {
		return {}
	}
}

// 添加属性
const addAttribute = () => {
	form.attributeList.push({ key: '', value: '' })
}

// 删除属性
const removeAttribute = (index: number) => {
	form.attributeList.splice(index, 1)
}

// 新增
const handleAdd = () => {
	dialogTitle.value = '新增SKU'
	form.attributeList = []
	dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
	dialogTitle.value = '编辑SKU'
	Object.assign(form, row)
	// 解析属性
	const attrs = parseAttributes(row.attributes)
	form.attributeList = Object.entries(attrs).map(([key, value]) => ({ key, value: value as string }))
	dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
	ElMessageBox.confirm('确定要删除该SKU吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(async () => {
			try {
				await deleteSku(row.id)
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
				// 转换属性为JSON字符串
				const attributes: any = {}
				form.attributeList.forEach((attr) => {
					if (attr.key && attr.value) {
						attributes[attr.key] = attr.value
					}
				})

				const data = {
					...form,
					attributes: JSON.stringify(attributes)
				}

				if (form.id) {
					await updateSku(data)
					ElMessage.success('更新成功')
				} else {
					await createSku(data)
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
	form.attributeList = []
}

onMounted(() => {
	loadProductList()
	handleSearch()
})
</script>

<style scoped lang="scss">
.sku-container {
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
