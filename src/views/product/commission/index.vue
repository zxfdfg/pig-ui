<template>
	<div class="commission-container">
		<!-- 搜索栏 -->
		<el-card class="search-card" shadow="never">
			<el-form :inline="true" :model="searchForm" class="search-form">
				<el-form-item label="配置类型">
					<el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
						<el-option label="商品佣金" :value="0" />
						<el-option label="分类默认佣金" :value="1" />
					</el-select>
				</el-form-item>
				<el-form-item label="商品名称">
					<el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 操作栏 -->
		<el-card class="toolbar-card" shadow="never">
			<el-button type="primary" @click="handleAdd">新增佣金配置</el-button>
			<el-button type="success" @click="handleBatchSet">批量设置</el-button>
		</el-card>

		<!-- 佣金配置列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="configList" border stripe>
				<el-table-column prop="id" label="配置ID" width="80" />
				<el-table-column prop="type" label="类型" width="120">
					<template #default="{ row }">
						<el-tag :type="row.type === 0 ? 'primary' : 'success'">
							{{ row.type === 0 ? '商品佣金' : '分类默认' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
				<el-table-column prop="categoryId" label="分类ID" width="100" />
				<el-table-column prop="level1Rate" label="一级佣金" width="100">
					<template #default="{ row }"> {{ row.level1Rate }}% </template>
				</el-table-column>
				<el-table-column prop="level2Rate" label="二级佣金" width="100">
					<template #default="{ row }"> {{ row.level2Rate }}% </template>
				</el-table-column>
				<el-table-column prop="level3Rate" label="三级佣金" width="100">
					<template #default="{ row }"> {{ row.level3Rate }}% </template>
				</el-table-column>
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

		<!-- 佣金配置表单对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="600px"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
				<el-form-item label="配置类型" prop="type">
					<el-radio-group v-model="form.type" @change="handleTypeChange">
						<el-radio :label="0">商品佣金</el-radio>
						<el-radio :label="1">分类默认佣金</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-if="form.type === 0" label="商品" prop="productId">
					<el-select v-model="form.productId" placeholder="请选择商品" filterable>
						<el-option
							v-for="product in productList"
							:key="product.id"
							:label="product.name"
							:value="product.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item v-if="form.type === 1" label="分类" prop="categoryId">
					<el-tree-select
						v-model="form.categoryId"
						:data="categoryTree"
						:props="{ label: 'name', value: 'id' }"
						placeholder="请选择分类"
						check-strictly
					/>
				</el-form-item>
				<el-form-item label="一级佣金比例" prop="level1Rate">
					<el-input-number v-model="form.level1Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-form-item label="二级佣金比例" prop="level2Rate">
					<el-input-number v-model="form.level2Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-form-item label="三级佣金比例" prop="level3Rate">
					<el-input-number v-model="form.level3Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-alert
					title="提示：佣金比例必须递减，即一级≥二级≥三级，且总和不超过100%"
					type="info"
					:closable="false"
					style="margin-bottom: 20px"
				/>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>

		<!-- 批量设置对话框 -->
		<el-dialog
			v-model="batchDialogVisible"
			title="批量设置佣金"
			width="600px"
			:close-on-click-modal="false"
			@close="handleBatchDialogClose"
		>
			<el-form ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="120px">
				<el-form-item label="选择分类" prop="categoryId">
					<el-tree-select
						v-model="batchForm.categoryId"
						:data="categoryTree"
						:props="{ label: 'name', value: 'id' }"
						placeholder="请选择分类"
						check-strictly
					/>
				</el-form-item>
				<el-form-item label="一级佣金比例" prop="level1Rate">
					<el-input-number v-model="batchForm.level1Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-form-item label="二级佣金比例" prop="level2Rate">
					<el-input-number v-model="batchForm.level2Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-form-item label="三级佣金比例" prop="level3Rate">
					<el-input-number v-model="batchForm.level3Rate" :min="0" :max="100" :precision="2" :step="0.1" />
					<span style="margin-left: 10px">%</span>
				</el-form-item>
				<el-alert
					title="将为该分类下的所有商品设置相同的佣金比例"
					type="warning"
					:closable="false"
					style="margin-bottom: 20px"
				/>
			</el-form>
			<template #footer>
				<el-button @click="batchDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleBatchSubmit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="CommissionConfig">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
	getCommissionConfigPage,
	createCommissionConfig,
	updateCommissionConfig,
	deleteCommissionConfig,
	batchSetCommission
} from '/@/api/product/commission'
import { getProductPage } from '/@/api/product/product'
import { getCategoryTree } from '/@/api/product/category'

// 搜索表单
const searchForm = reactive({
	type: null,
	productName: ''
})

// 分页
const pagination = reactive({
	current: 1,
	size: 10,
	total: 0
})

// 配置列表
const loading = ref(false)
const configList = ref([])

// 商品列表
const productList = ref([])

// 分类树
const categoryTree = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const form = reactive({
	id: null,
	type: 0,
	productId: null,
	categoryId: null,
	level1Rate: 0,
	level2Rate: 0,
	level3Rate: 0
})

// 表单验证规则
const rules = {
	type: [{ required: true, message: '请选择配置类型', trigger: 'change' }],
	productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
	categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
	level1Rate: [{ required: true, message: '请输入一级佣金比例', trigger: 'blur' }]
}

// 批量设置对话框
const batchDialogVisible = ref(false)
const batchFormRef = ref<FormInstance>()
const batchForm = reactive({
	categoryId: null,
	level1Rate: 0,
	level2Rate: 0,
	level3Rate: 0
})

// 批量设置验证规则
const batchRules = {
	categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
	level1Rate: [{ required: true, message: '请输入一级佣金比例', trigger: 'blur' }]
}

// 查询配置列表
const handleSearch = async () => {
	loading.value = true
	try {
		const params = {
			current: pagination.current,
			size: pagination.size,
			...searchForm
		}
		const res = await getCommissionConfigPage(params)
		configList.value = res.data.records
		pagination.total = res.data.total
	} catch (error) {
		ElMessage.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 重置搜索
const handleReset = () => {
	searchForm.type = null
	searchForm.productName = ''
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

// 加载分类树
const loadCategoryTree = async () => {
	try {
		const res = await getCategoryTree()
		categoryTree.value = res.data
	} catch (error) {
		ElMessage.error('加载分类失败')
	}
}

// 类型变更
const handleTypeChange = () => {
	form.productId = null
	form.categoryId = null
}

// 新增
const handleAdd = () => {
	dialogTitle.value = '新增佣金配置'
	dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
	dialogTitle.value = '编辑佣金配置'
	Object.assign(form, row)
	dialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
	ElMessageBox.confirm('确定要删除该佣金配置吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	})
		.then(async () => {
			try {
				await deleteCommissionConfig(row.id)
				ElMessage.success('删除成功')
				handleSearch()
			} catch (error: any) {
				ElMessage.error(error.msg || '删除失败')
			}
		})
		.catch(() => {})
}

// 批量设置
const handleBatchSet = () => {
	batchDialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (valid) {
			// 验证佣金比例递减
			if (form.level1Rate < form.level2Rate || form.level2Rate < form.level3Rate) {
				ElMessage.warning('佣金比例必须递减：一级≥二级≥三级')
				return
			}

			// 验证总和不超过100%
			const total = form.level1Rate + form.level2Rate + form.level3Rate
			if (total > 100) {
				ElMessage.warning('佣金比例总和不能超过100%')
				return
			}

			try {
				if (form.id) {
					await updateCommissionConfig(form)
					ElMessage.success('更新成功')
				} else {
					await createCommissionConfig(form)
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

// 提交批量设置
const handleBatchSubmit = async () => {
	if (!batchFormRef.value) return
	await batchFormRef.value.validate(async (valid) => {
		if (valid) {
			// 验证佣金比例递减
			if (
				batchForm.level1Rate < batchForm.level2Rate ||
				batchForm.level2Rate < batchForm.level3Rate
			) {
				ElMessage.warning('佣金比例必须递减：一级≥二级≥三级')
				return
			}

			// 验证总和不超过100%
			const total = batchForm.level1Rate + batchForm.level2Rate + batchForm.level3Rate
			if (total > 100) {
				ElMessage.warning('佣金比例总和不能超过100%')
				return
			}

			try {
				await batchSetCommission(batchForm)
				ElMessage.success('批量设置成功')
				batchDialogVisible.value = false
				handleSearch()
			} catch (error: any) {
				ElMessage.error(error.msg || '批量设置失败')
			}
		}
	})
}

// 关闭对话框
const handleDialogClose = () => {
	formRef.value?.resetFields()
	form.id = null
	form.type = 0
	form.productId = null
	form.categoryId = null
}

// 关闭批量设置对话框
const handleBatchDialogClose = () => {
	batchFormRef.value?.resetFields()
}

onMounted(() => {
	loadProductList()
	loadCategoryTree()
	handleSearch()
})
</script>

<style scoped lang="scss">
.commission-container {
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
