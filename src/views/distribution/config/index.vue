<template>
	<div class="config-container">
		<el-card shadow="hover">
			<template #header>
				<div class="card-header">
					<span>佣金配置</span>
					<el-button type="primary" @click="handleAdd">新增配置</el-button>
				</div>
			</template>

			<!-- 表格 -->
			<el-table :data="tableData" border style="width: 100%" v-loading="loading">
				<el-table-column prop="name" label="配置名称" />
				<el-table-column prop="level" label="分销层级" width="100">
					<template #default="{ row }">
						<el-tag v-if="row.level === 1">一级</el-tag>
						<el-tag v-else-if="row.level === 2" type="success">二级</el-tag>
						<el-tag v-else-if="row.level === 3" type="warning">三级</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="commissionRate" label="佣金比例(%)" width="120" />
				<el-table-column prop="distributorLevel" label="分销商等级" width="120">
					<template #default="{ row }">
						<span v-if="row.distributorLevel === 0">全部</span>
						<el-tag v-else-if="row.distributorLevel === 1">普通</el-tag>
						<el-tag v-else-if="row.distributorLevel === 2" type="success">铜牌</el-tag>
						<el-tag v-else-if="row.distributorLevel === 3" type="warning">银牌</el-tag>
						<el-tag v-else-if="row.distributorLevel === 4" type="danger">金牌</el-tag>
						<el-tag v-else-if="row.distributorLevel === 5" type="info">钻石</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="status" label="状态" width="100">
					<template #default="{ row }">
						<el-tag v-if="row.status === 1" type="success">启用</el-tag>
						<el-tag v-else type="danger">禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="remark" label="备注" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="{ row }">
						<el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
						<el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 新增/编辑对话框 -->
		<el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
			<el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
				<el-form-item label="配置名称" prop="name">
					<el-input v-model="formData.name" placeholder="请输入配置名称" />
				</el-form-item>
				<el-form-item label="分销层级" prop="level">
					<el-select v-model="formData.level" placeholder="请选择分销层级" style="width: 100%">
						<el-option label="一级" :value="1" />
						<el-option label="二级" :value="2" />
						<el-option label="三级" :value="3" />
					</el-select>
				</el-form-item>
				<el-form-item label="佣金比例(%)" prop="commissionRate">
					<el-input-number
						v-model="formData.commissionRate"
						:min="0"
						:max="100"
						:precision="2"
						style="width: 100%"
					/>
				</el-form-item>
				<el-form-item label="分销商等级">
					<el-select v-model="formData.distributorLevel" placeholder="请选择分销商等级" style="width: 100%">
						<el-option label="全部" :value="0" />
						<el-option label="普通" :value="1" />
						<el-option label="铜牌" :value="2" />
						<el-option label="银牌" :value="3" />
						<el-option label="金牌" :value="4" />
						<el-option label="钻石" :value="5" />
					</el-select>
				</el-form-item>
				<el-form-item label="状态">
					<el-radio-group v-model="formData.status">
						<el-radio :value="1">启用</el-radio>
						<el-radio :value="0">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleSubmit">确定</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="Config">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConfigList, addConfig, updateConfig, deleteConfig } from '/@/api/distribution/config'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增配置')
const formRef = ref()

const formData = reactive({
	id: null,
	name: '',
	level: 1,
	commissionRate: 0,
	distributorLevel: 0,
	status: 1,
	remark: '',
})

const formRules = {
	name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
	level: [{ required: true, message: '请选择分销层级', trigger: 'change' }],
	commissionRate: [{ required: true, message: '请输入佣金比例', trigger: 'blur' }],
}

const handleQuery = async () => {
	loading.value = true
	try {
		const res = await getConfigList()
		tableData.value = res.data || []
	} catch (error) {
		console.error('获取配置列表失败:', error)
		ElMessage.error('获取配置列表失败')
	} finally {
		loading.value = false
	}
}

const handleAdd = () => {
	dialogTitle.value = '新增配置'
	resetForm()
	dialogVisible.value = true
}

const handleEdit = (row: any) => {
	dialogTitle.value = '编辑配置'
	Object.assign(formData, row)
	dialogVisible.value = true
}

const handleDelete = (row: any) => {
	ElMessageBox.confirm('确定要删除该配置吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(async () => {
			try {
				await deleteConfig(row.id)
				ElMessage.success('删除成功')
				handleQuery()
			} catch (error) {
				console.error('删除失败:', error)
				ElMessage.error('删除失败')
			}
		})
		.catch(() => {})
}

const handleSubmit = async () => {
	if (!formRef.value) return

	await formRef.value.validate(async (valid: boolean) => {
		if (!valid) return

		try {
			if (formData.id) {
				await updateConfig(formData)
				ElMessage.success('修改成功')
			} else {
				await addConfig(formData)
				ElMessage.success('新增成功')
			}
			dialogVisible.value = false
			handleQuery()
		} catch (error) {
			console.error('保存失败:', error)
			ElMessage.error('保存失败')
		}
	})
}

const resetForm = () => {
	formData.id = null
	formData.name = ''
	formData.level = 1
	formData.commissionRate = 0
	formData.distributorLevel = 0
	formData.status = 1
	formData.remark = ''
}

onMounted(() => {
	handleQuery()
})
</script>

<style scoped lang="scss">
.config-container {
	padding: 20px;

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}
</style>
