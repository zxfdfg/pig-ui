<template>
	<div class="distributor-container">
		<el-card shadow="hover">
			<template #header>
				<div class="card-header">
					<span>分销商管理</span>
				</div>
			</template>

			<!-- 搜索表单 -->
			<el-form :inline="true" :model="queryForm" class="search-form">
				<el-form-item label="分销商名称">
					<el-input v-model="queryForm.username" placeholder="请输入分销商名称" clearable />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
						<el-option label="全部" value="" />
						<el-option label="启用" :value="1" />
						<el-option label="禁用" :value="0" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>

			<!-- 表格 -->
			<el-table :data="tableData" border style="width: 100%" v-loading="loading">
				<el-table-column prop="id" label="ID" width="80" />
				<el-table-column prop="userId" label="用户ID" width="100" />
				<el-table-column prop="username" label="分销商名称" />
				<el-table-column prop="level" label="等级" width="100">
					<template #default="{ row }">
						<el-tag v-if="row.level === 1">普通</el-tag>
						<el-tag v-else-if="row.level === 2" type="success">铜牌</el-tag>
						<el-tag v-else-if="row.level === 3" type="warning">银牌</el-tag>
						<el-tag v-else-if="row.level === 4" type="danger">金牌</el-tag>
						<el-tag v-else-if="row.level === 5" type="info">钻石</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="totalSales" label="累计销售额" width="120" />
				<el-table-column prop="totalCommission" label="累计佣金" width="120" />
				<el-table-column prop="status" label="状态" width="100">
					<template #default="{ row }">
						<el-tag v-if="row.status === 1" type="success">启用</el-tag>
						<el-tag v-else type="danger">禁用</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="180" />
				<el-table-column label="操作" width="250" fixed="right">
					<template #default="{ row }">
						<el-button v-if="row.status === 0" link type="success" size="small" @click="handleAudit(row, 1)">通过</el-button>
						<el-button v-if="row.status === 0" link type="danger" size="small" @click="handleAudit(row, 2)">拒绝</el-button>
						<el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
						<el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!-- 分页 -->
			<el-pagination
				v-model:current-page="queryForm.current"
				v-model:page-size="queryForm.size"
				:page-sizes="[10, 20, 50, 100]"
				:total="total"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="handleQuery"
				@current-change="handleQuery"
				style="margin-top: 20px; justify-content: flex-end"
			/>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="Distributor">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '/@/utils/request'

// 查询表单
const queryForm = ref({
	username: '',
	status: '',
	current: 1,
	size: 10,
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 查询
const handleQuery = async () => {
	loading.value = true
	try {
		const res = await request({
			url: '/distribution/distributor/page',
			method: 'get',
			params: queryForm.value
		})
		if (res.code === 0) {
			tableData.value = res.data.records || []
			total.value = res.data.total || 0
		}
	} catch (error) {
		console.error('查询分销商列表失败', error)
		ElMessage.error('查询失败')
	} finally {
		loading.value = false
	}
}

// 重置
const handleReset = () => {
	queryForm.value = {
		username: '',
		status: '',
		current: 1,
		size: 10,
	}
	handleQuery()
}

// 查看
const handleView = async (row: any) => {
	try {
		const res = await request({
			url: `/distribution/distributor/${row.id}`,
			method: 'get'
		})
		if (res.code === 0) {
			ElMessageBox.alert(JSON.stringify(res.data, null, 2), '分销商详情', {
				confirmButtonText: '确定'
			})
		}
	} catch (error) {
		ElMessage.error('查询详情失败')
	}
}

// 编辑
const handleEdit = async (row: any) => {
	ElMessageBox.prompt('请输入新的等级（1-5）', '编辑分销商', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		inputPattern: /^[1-5]$/,
		inputErrorMessage: '请输入1-5之间的数字'
	}).then(async ({ value }) => {
		try {
			const res = await request({
				url: '/distribution/distributor',
				method: 'put',
				data: {
					id: row.id,
					level: parseInt(value)
				}
			})
			if (res.code === 0) {
				ElMessage.success('修改成功')
				handleQuery()
			} else {
				ElMessage.error(res.msg || '修改失败')
			}
		} catch (error) {
			ElMessage.error('修改失败')
		}
	}).catch(() => {})
}

// 审核
const handleAudit = async (row: any, status: number) => {
	const text = status === 1 ? '通过' : '拒绝'
	try {
		await ElMessageBox.confirm(`确定要${text}该分销商申请吗？`, '提示', {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		})
		
		const res = await request({
			url: `/distribution/distributor/audit/${row.id}`,
			method: 'put',
			data: { status }
		})
		
		if (res.code === 0) {
			ElMessage.success(`${text}成功`)
			handleQuery()
		} else {
			ElMessage.error(res.msg || `${text}失败`)
		}
	} catch (error: any) {
		if (error !== 'cancel') {
			ElMessage.error(`${text}失败`)
		}
	}
}

// 删除
const handleDelete = (row: any) => {
	ElMessageBox.confirm('确定要删除该分销商吗？', '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning',
	}).then(() => {
		ElMessage.warning('删除功能暂未实现')
	}).catch(() => {})
}

onMounted(() => {
	handleQuery()
})
</script>

<style scoped lang="scss">
.distributor-container {
	padding: 20px;

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.search-form {
		margin-bottom: 20px;
	}
}
</style>
