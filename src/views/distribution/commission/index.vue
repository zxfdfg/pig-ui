<template>
	<div class="commission-page">
		<!-- 佣金统计卡片 -->
		<el-row :gutter="20" class="stats-row">
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-item">
						<div class="stat-label">总佣金</div>
						<div class="stat-value">¥{{ stats.totalCommission || 0 }}</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-item">
						<div class="stat-label">可提现</div>
						<div class="stat-value available">¥{{ stats.availableCommission || 0 }}</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-item">
						<div class="stat-label">已提现</div>
						<div class="stat-value">¥{{ stats.withdrawnCommission || 0 }}</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-item">
						<div class="stat-label">冻结中</div>
						<div class="stat-value frozen">¥{{ stats.frozenCommission || 0 }}</div>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 佣金列表 -->
		<el-card shadow="hover">
			<template #header>
				<div class="card-header">
					<span>佣金明细</span>
					<el-radio-group v-model="queryParams.status" @change="handleQuery">
						<el-radio-button :value="null">全部</el-radio-button>
						<el-radio-button :value="0">待结算</el-radio-button>
						<el-radio-button :value="1">已结算</el-radio-button>
						<el-radio-button :value="2">已取消</el-radio-button>
					</el-radio-group>
				</div>
			</template>

			<el-table v-loading="loading" :data="commissionList" border>
				<el-table-column label="订单号" prop="orderNo" width="180" />
				<el-table-column label="订单金额" prop="orderAmount" width="120">
					<template #default="{ row }">
						<span>¥{{ row.orderAmount }}</span>
					</template>
				</el-table-column>
				<el-table-column label="佣金比例" prop="commissionRate" width="100">
					<template #default="{ row }">
						<span>{{ row.commissionRate }}%</span>
					</template>
				</el-table-column>
				<el-table-column label="佣金金额" prop="commissionAmount" width="120">
					<template #default="{ row }">
						<span class="commission-amount">¥{{ row.commissionAmount }}</span>
					</template>
				</el-table-column>
				<el-table-column label="分销层级" prop="level" width="100">
					<template #default="{ row }">
						<el-tag :type="getLevelType(row.level)">{{ getLevelText(row.level) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="状态" prop="status" width="100">
					<template #default="{ row }">
						<el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="创建时间" prop="createTime" width="180" />
				<el-table-column label="结算时间" prop="settleTime" width="180" />
				<el-table-column label="备注" prop="remark" show-overflow-tooltip />
			</el-table>

			<el-pagination
				v-model:current-page="queryParams.current"
				v-model:page-size="queryParams.size"
				:page-sizes="[10, 20, 50, 100]"
				:total="total"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="fetchCommissionList"
				@current-change="fetchCommissionList"
				style="margin-top: 20px; justify-content: flex-end"
			/>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="CommissionList">
import { ref, reactive, onMounted } from 'vue'
import { getCommissionList, getCommissionStats } from '/@/api/distribution/commission'

const loading = ref(false)
const commissionList = ref([])
const total = ref(0)

const stats = reactive({
	totalCommission: 0,
	availableCommission: 0,
	withdrawnCommission: 0,
	frozenCommission: 0
})

const queryParams = reactive({
	current: 1,
	size: 10,
	status: null
})

// 获取佣金统计
const fetchStats = async () => {
	try {
		const res = await getCommissionStats()
		Object.assign(stats, res.data)
	} catch (error) {
		console.error('获取佣金统计失败', error)
	}
}

// 获取佣金列表
const fetchCommissionList = async () => {
	loading.value = true
	try {
		const res = await getCommissionList(queryParams)
		commissionList.value = res.data.records
		total.value = res.data.total
	} catch (error) {
		console.error('获取佣金列表失败', error)
	} finally {
		loading.value = false
	}
}

// 查询
const handleQuery = () => {
	queryParams.current = 1
	fetchCommissionList()
}

// 获取层级类型
const getLevelType = (level: number) => {
	const types: any = { 1: 'success', 2: 'warning', 3: 'info' }
	return types[level] || ''
}

// 获取层级文本
const getLevelText = (level: number) => {
	const texts: any = { 1: '一级', 2: '二级', 3: '三级' }
	return texts[level] || ''
}

// 获取状态类型
const getStatusType = (status: number) => {
	const types: any = { 0: 'warning', 1: 'success', 2: 'info' }
	return types[status] || ''
}

// 获取状态文本
const getStatusText = (status: number) => {
	const texts: any = { 0: '待结算', 1: '已结算', 2: '已取消' }
	return texts[status] || ''
}

onMounted(() => {
	fetchStats()
	fetchCommissionList()
})
</script>

<style scoped lang="scss">
.commission-page {
	padding: 20px;

	.stats-row {
		margin-bottom: 20px;

		.stat-item {
			text-align: center;
			padding: 20px 0;

			.stat-label {
				font-size: 14px;
				color: #909399;
				margin-bottom: 10px;
			}

			.stat-value {
				font-size: 28px;
				font-weight: bold;
				color: #303133;

				&.available {
					color: #67c23a;
				}

				&.frozen {
					color: #e6a23c;
				}
			}
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.commission-amount {
		color: #67c23a;
		font-weight: bold;
	}
}
</style>
