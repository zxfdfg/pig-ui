<template>
	<div class="withdraw-container">
		<el-card shadow="hover">
			<template #header>
				<div class="card-header">
					<span>提现管理</span>
				</div>
			</template>

			<!-- 搜索表单 -->
			<el-form :inline="true" :model="queryForm" class="search-form">
				<el-form-item label="提现单号">
					<el-input v-model="queryForm.withdrawNo" placeholder="请输入提现单号" clearable />
				</el-form-item>
				<el-form-item label="状态">
					<el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
						<el-option label="全部" value="" />
						<el-option label="待审核" :value="0" />
						<el-option label="审核通过" :value="1" />
						<el-option label="审核拒绝" :value="2" />
						<el-option label="已打款" :value="3" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleQuery">查询</el-button>
					<el-button @click="handleReset">重置</el-button>
				</el-form-item>
			</el-form>

			<!-- 表格 -->
			<el-table :data="tableData" border style="width: 100%" v-loading="loading">
				<el-table-column prop="withdrawNo" label="提现单号" width="180" />
				<el-table-column prop="distributorName" label="分销商" width="120" />
				<el-table-column prop="amount" label="提现金额" width="120" />
				<el-table-column prop="fee" label="手续费" width="100" />
				<el-table-column prop="actualAmount" label="实际到账" width="120" />
				<el-table-column prop="status" label="状态" width="100">
					<template #default="{ row }">
						<el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
						<el-tag v-else-if="row.status === 1" type="success">审核通过</el-tag>
						<el-tag v-else-if="row.status === 2" type="danger">审核拒绝</el-tag>
						<el-tag v-else-if="row.status === 3" type="info">已打款</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="申请时间" width="180" />
				<el-table-column label="操作" width="200" fixed="right">
					<template #default="{ row }">
						<el-button v-if="row.status === 0" link type="success" size="small" @click="handleAudit(row, 1)"
							>通过</el-button
						>
						<el-button v-if="row.status === 0" link type="danger" size="small" @click="handleAudit(row, 2)"
							>拒绝</el-button
						>
						<el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
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

<script setup lang="ts" name="Withdraw">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWithdrawList, auditWithdraw } from '/@/api/distribution/withdraw'

const queryForm = ref({
	withdrawNo: '',
	status: '',
	current: 1,
	size: 10,
})

const tableData = ref([])
const total = ref(0)
const loading = ref(false)

const handleQuery = async () => {
	loading.value = true
	try {
		const res = await getWithdrawList(queryForm.value)
		if (res.code === 0) {
			tableData.value = res.data.records || []
			total.value = res.data.total || 0
		}
	} catch (error) {
		console.error('查询提现列表失败', error)
		ElMessage.error('查询失败')
	} finally {
		loading.value = false
	}
}

const handleReset = () => {
	queryForm.value = {
		withdrawNo: '',
		status: '',
		current: 1,
		size: 10,
	}
	handleQuery()
}

const handleView = (row: any) => {
	ElMessageBox.alert(
		`
		<div style="text-align: left;">
			<p><strong>提现单号：</strong>${row.withdrawNo}</p>
			<p><strong>分销商：</strong>${row.distributorName}</p>
			<p><strong>提现金额：</strong>¥${row.amount}</p>
			<p><strong>手续费：</strong>¥${row.fee}</p>
			<p><strong>实际到账：</strong>¥${row.actualAmount}</p>
			<p><strong>状态：</strong>${getStatusText(row.status)}</p>
			<p><strong>申请时间：</strong>${row.createTime}</p>
			${row.auditTime ? `<p><strong>审核时间：</strong>${row.auditTime}</p>` : ''}
			${row.remark ? `<p><strong>备注：</strong>${row.remark}</p>` : ''}
		</div>
		`,
		'提现详情',
		{
			confirmButtonText: '确定',
			dangerouslyUseHTMLString: true
		}
	)
}

const getStatusText = (status: number) => {
	const texts: any = { 0: '待审核', 1: '审核通过', 2: '审核拒绝', 3: '已打款' }
	return texts[status] || ''
}

const handleAudit = async (row: any, status: number) => {
	const text = status === 1 ? '通过' : '拒绝'
	try {
		let remark = ''
		if (status === 2) {
			const result = await ElMessageBox.prompt('请输入拒绝原因', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /.+/,
				inputErrorMessage: '请输入拒绝原因'
			})
			remark = result.value
		} else {
			await ElMessageBox.confirm(`确定要${text}该提现申请吗？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			})
		}
		
		const res = await auditWithdraw(row.id, status, remark)
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

onMounted(() => {
	handleQuery()
})
</script>

<style scoped lang="scss">
.withdraw-container {
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
