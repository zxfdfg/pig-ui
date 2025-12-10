<template>
	<div class="cdkey-container">
		<!-- 搜索栏 -->
		<el-card class="search-card" shadow="never">
			<el-form :inline="true" :model="searchForm" class="search-form">
				<el-form-item label="商品名称">
					<el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
				</el-form-item>
				<el-form-item label="CDKEY">
					<el-input v-model="searchForm.cdkey" placeholder="请输入CDKEY" clearable />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
						<el-option label="未使用" :value="0" />
						<el-option label="已使用" :value="1" />
						<el-option label="已过期" :value="2" />
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
			<el-button type="primary" @click="handleImport">批量导入CDKEY</el-button>
		</el-card>

		<!-- CDKEY列表 -->
		<el-card class="table-card" shadow="never">
			<el-table v-loading="loading" :data="cdkeyList" border stripe>
				<el-table-column prop="id" label="ID" width="80" />
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
				<el-table-column prop="cdkey" label="CDKEY" min-width="200" show-overflow-tooltip />
				<el-table-column prop="status" label="状态" width="100">
					<template #default="{ row }">
						<el-tag :type="getStatusType(row.status)">
							{{ getStatusText(row.status) }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="orderId" label="订单ID" width="120" />
				<el-table-column prop="distributorId" label="分销商ID" width="120" />
				<el-table-column prop="usedTime" label="使用时间" width="180" />
				<el-table-column prop="expireTime" label="过期时间" width="180" />
				<el-table-column label="操作" width="150" fixed="right">
					<template #default="{ row }">
						<el-button link type="primary" size="small" @click="handleView(row)">查看详情</el-button>
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

		<!-- 导入对话框 -->
		<el-dialog
			v-model="importDialogVisible"
			title="批量导入CDKEY"
			width="600px"
			:close-on-click-modal="false"
			@close="handleImportDialogClose"
		>
			<el-form ref="importFormRef" :model="importForm" :rules="importRules" label-width="100px">
				<el-form-item label="商品" prop="productId">
					<el-select v-model="importForm.productId" placeholder="请选择商品" filterable>
						<el-option
							v-for="product in productList"
							:key="product.id"
							:label="product.name"
							:value="product.id"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="CDKEY列表" prop="cdkeys">
					<el-input
						v-model="importForm.cdkeys"
						type="textarea"
						:rows="10"
						placeholder="每行一个CDKEY，支持批量粘贴"
					/>
				</el-form-item>
				<el-form-item label="过期时间">
					<el-date-picker
						v-model="importForm.expireTime"
						type="datetime"
						placeholder="选择过期时间（可选）"
						value-format="YYYY-MM-DD HH:mm:ss"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="importDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleImportSubmit">确定导入</el-button>
			</template>
		</el-dialog>

		<!-- 详情对话框 -->
		<el-dialog v-model="detailDialogVisible" title="CDKEY详情" width="600px">
			<el-descriptions :column="1" border>
				<el-descriptions-item label="ID">{{ currentCdkey?.id }}</el-descriptions-item>
				<el-descriptions-item label="商品ID">{{ currentCdkey?.productId }}</el-descriptions-item>
				<el-descriptions-item label="商品名称">{{ currentCdkey?.productName }}</el-descriptions-item>
				<el-descriptions-item label="CDKEY">{{ currentCdkey?.cdkey }}</el-descriptions-item>
				<el-descriptions-item label="状态">
					<el-tag :type="getStatusType(currentCdkey?.status)">
						{{ getStatusText(currentCdkey?.status) }}
					</el-tag>
				</el-descriptions-item>
				<el-descriptions-item label="订单ID">{{ currentCdkey?.orderId || '-' }}</el-descriptions-item>
				<el-descriptions-item label="分销商ID">{{ currentCdkey?.distributorId || '-' }}</el-descriptions-item>
				<el-descriptions-item label="使用时间">{{ currentCdkey?.usedTime || '-' }}</el-descriptions-item>
				<el-descriptions-item label="过期时间">{{ currentCdkey?.expireTime || '-' }}</el-descriptions-item>
				<el-descriptions-item label="创建时间">{{ currentCdkey?.createTime }}</el-descriptions-item>
			</el-descriptions>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="CdkeyList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { getCdkeyPage, getCdkeyById, importCdkey } from '/@/api/product/cdkey'
import { getProductPage } from '/@/api/product/product'

// 搜索表单
const searchForm = reactive({
	productName: '',
	cdkey: '',
	status: null
})

// 分页
const pagination = reactive({
	current: 1,
	size: 10,
	total: 0
})

// CDKEY列表
const loading = ref(false)
const cdkeyList = ref([])

// 商品列表
const productList = ref([])

// 导入对话框
const importDialogVisible = ref(false)
const importFormRef = ref<FormInstance>()
const importForm = reactive({
	productId: null,
	cdkeys: '',
	expireTime: ''
})

// 导入表单验证规则
const importRules = {
	productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
	cdkeys: [{ required: true, message: '请输入CDKEY列表', trigger: 'blur' }]
}

// 详情对话框
const detailDialogVisible = ref(false)
const currentCdkey = ref<any>(null)

// 查询CDKEY列表
const handleSearch = async () => {
	loading.value = true
	try {
		const params = {
			current: pagination.current,
			size: pagination.size,
			...searchForm
		}
		const res = await getCdkeyPage(params)
		cdkeyList.value = res.data.records
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
	searchForm.cdkey = ''
	searchForm.status = null
	pagination.current = 1
	handleSearch()
}

// 加载商品列表
const loadProductList = async () => {
	try {
		const res = await getProductPage({ current: 1, size: 1000, type: 1 })
		productList.value = res.data.records
	} catch (error) {
		ElMessage.error('加载商品失败')
	}
}

// 获取状态类型
const getStatusType = (status: number) => {
	const types: any = { 0: 'success', 1: 'info', 2: 'danger' }
	return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
	const texts: any = { 0: '未使用', 1: '已使用', 2: '已过期' }
	return texts[status] || '未知'
}

// 批量导入
const handleImport = () => {
	importDialogVisible.value = true
}

// 提交导入
const handleImportSubmit = async () => {
	if (!importFormRef.value) return
	await importFormRef.value.validate(async (valid) => {
		if (valid) {
			try {
				const cdkeyList = importForm.cdkeys
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.length > 0)

				if (cdkeyList.length === 0) {
					ElMessage.warning('请输入至少一个CDKEY')
					return
				}

				const data = {
					productId: importForm.productId,
					cdkeys: cdkeyList,
					expireTime: importForm.expireTime || null
				}

				await importCdkey(data)
				ElMessage.success(`成功导入 ${cdkeyList.length} 个CDKEY`)
				importDialogVisible.value = false
				handleSearch()
			} catch (error: any) {
				ElMessage.error(error.msg || '导入失败')
			}
		}
	})
}

// 关闭导入对话框
const handleImportDialogClose = () => {
	importFormRef.value?.resetFields()
	importForm.cdkeys = ''
	importForm.expireTime = ''
}

// 查看详情
const handleView = async (row: any) => {
	try {
		const res = await getCdkeyById(row.id)
		currentCdkey.value = res.data
		detailDialogVisible.value = true
	} catch (error) {
		ElMessage.error('加载详情失败')
	}
}

onMounted(() => {
	loadProductList()
	handleSearch()
})
</script>

<style scoped lang="scss">
.cdkey-container {
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
