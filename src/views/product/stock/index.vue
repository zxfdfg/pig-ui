<template>
	<div class="stock-container">
		<!-- 搜索栏 -->
		<el-card class="search-card" shadow="never">
			<el-form :inline="true" :model="searchForm" class="search-form">
				<el-form-item label="商品名称">
					<el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
				</el-form-item>
				<el-form-item label="库存状态">
					<el-select v-model="searchForm.stockStatus" placeholder="请选择状态" clearable>
						<el-option label="正常" value="normal" />
						<el-option label="低库存" value="low" />
						<el-option label="售罄" value="out" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSearch">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>

		<!-- 库存列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="stockList" border stripe>
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
				<el-table-column prop="stock" label="当前库存" width="120">
					<template #default="{ row }">
						<el-tag :type="getStockType(row)">{{ row.stock }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="stockWarning" label="预警值" width="100" />
				<el-table-column prop="sales" label="销量" width="100" />
				<el-table-column label="库存状态" width="120">
					<template #default="{ row }">
						<el-tag :type="getStockStatusType(row)">
							{{ getStockStatusText(row) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="250" fixed="right">
					<template #default="{ row }">
						<el-button v-auth="'product:stock:increase'" link type="primary" size="small" @click="handleIncrease(row)">增加库存</el-button>
						<el-button v-auth="'product:stock:decrease'" link type="warning" size="small" @click="handleDecrease(row)">减少库存</el-button>
						<el-button link type="info" size="small" @click="handleViewLog(row)">库存日志</el-button>
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

		<!-- 库存操作对话框 -->
		<el-dialog
			v-model="dialogVisible"
			:title="dialogTitle"
			width="500px"
			:close-on-click-modal="false"
			@close="handleDialogClose"
		>
			<el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
				<el-form-item label="商品名称">
					<el-input :value="currentProduct?.productName" disabled />
				</el-form-item>
				<el-form-item label="当前库存">
					<el-input :value="currentProduct?.stock" disabled />
				</el-form-item>
				<el-form-item label="变更数量" prop="quantity">
					<el-input-number v-model="form.quantity" :min="1" :step="1" />
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>

		<!-- 库存日志对话框 -->
		<el-dialog v-model="logDialogVisible" title="库存日志" width="800px">
			<el-table :data="logList" border stripe max-height="400">
				<el-table-column prop="id" label="日志ID" width="80" />
				<el-table-column prop="type" label="类型" width="100">
					<template #default="{ row }">
						<el-tag :type="row.type === 0 ? 'success' : 'warning'">
							{{ row.type === 0 ? '入库' : '出库' }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="quantity" label="数量" width="100" />
				<el-table-column prop="beforeStock" label="变更前" width="100" />
				<el-table-column prop="afterStock" label="变更后" width="100" />
				<el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
				<el-table-column prop="createTime" label="操作时间" width="180" />
			</el-table>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="StockList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { getStockPage, increaseStock, decreaseStock, getStockLog } from '/@/api/product/stock'

// 搜索表单
const searchForm = reactive({
	productName: '',
	stockStatus: ''
})

// 分页
const pagination = reactive({
	current: 1,
	size: 10,
	total: 0
})

// 库存列表
const loading = ref(false)
const stockList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentProduct = ref<any>(null)
const operationType = ref<'increase' | 'decrease'>('increase')
const formRef = ref<FormInstance>()
const form = reactive({
	quantity: 1,
	remark: ''
})

// 表单验证规则
const rules = {
	quantity: [{ required: true, message: '请输入变更数量', trigger: 'blur' }]
}

// 库存日志
const logDialogVisible = ref(false)
const logList = ref([])

// 查询库存列表
const handleSearch = async () => {
	loading.value = true
	try {
		const params = {
			current: pagination.current,
			size: pagination.size,
			...searchForm
		}
		const res = await getStockPage(params)
		stockList.value = res.data.records
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
	searchForm.stockStatus = ''
	pagination.current = 1
	handleSearch()
}

// 获取库存类型
const getStockType = (row: any) => {
	if (row.stock === 0) return 'danger'
	if (row.stock <= row.stockWarning) return 'warning'
	return 'success'
}

// 获取库存状态类型
const getStockStatusType = (row: any) => {
	if (row.stock === 0) return 'danger'
	if (row.stock <= row.stockWarning) return 'warning'
	return 'success'
}

// 获取库存状态文本
const getStockStatusText = (row: any) => {
	if (row.stock === 0) return '售罄'
	if (row.stock <= row.stockWarning) return '低库存'
	return '正常'
}

// 增加库存
const handleIncrease = (row: any) => {
	dialogTitle.value = '增加库存'
	currentProduct.value = row
	operationType.value = 'increase'
	dialogVisible.value = true
}

// 减少库存
const handleDecrease = (row: any) => {
	dialogTitle.value = '减少库存'
	currentProduct.value = row
	operationType.value = 'decrease'
	dialogVisible.value = true
}

// 查看库存日志
const handleViewLog = async (row: any) => {
	try {
		const res = await getStockLog(row.productId)
		logList.value = res.data
		logDialogVisible.value = true
	} catch (error) {
		ElMessage.error('加载日志失败')
	}
}

// 提交表单
const handleSubmit = async () => {
	if (!formRef.value) return
	await formRef.value.validate(async (valid) => {
		if (valid) {
			try {
				const data = {
					productId: currentProduct.value.productId,
					quantity: form.quantity,
					remark: form.remark
				}

				if (operationType.value === 'increase') {
					await increaseStock(data)
					ElMessage.success('增加库存成功')
				} else {
					await decreaseStock(data)
					ElMessage.success('减少库存成功')
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
	form.quantity = 1
	form.remark = ''
}

onMounted(() => {
	handleSearch()
})
</script>

<style scoped lang="scss">
.stock-container {
	padding: 20px;

	.search-card,
	.table-card {
		margin-bottom: 20px;
	}

	.el-pagination {
		margin-top: 20px;
		justify-content: flex-end;
	}
}
</style>
