<template>
	<div class="distribution-center">
		<!-- 分销商信息卡片 -->
		<el-card class="info-card" shadow="hover">
			<template #header>
				<div class="card-header">
					<span>我的分销信息</span>
					<el-tag v-if="distributorInfo" :type="getLevelType(distributorInfo.level)">
						{{ distributorInfo.levelName }}
					</el-tag>
				</div>
			</template>
			<div v-if="distributorInfo" class="info-content">
				<el-row :gutter="20">
					<el-col :span="6">
						<div class="stat-item">
							<div class="stat-value">{{ distributorInfo.directCount }}</div>
							<div class="stat-label">直推人数</div>
						</div>
					</el-col>
					<el-col :span="6">
						<div class="stat-item">
							<div class="stat-value">{{ distributorInfo.teamCount }}</div>
							<div class="stat-label">团队人数</div>
						</div>
					</el-col>
					<el-col :span="6">
						<div class="stat-item">
							<div class="stat-value">¥{{ distributorInfo.totalCommission }}</div>
							<div class="stat-label">累计佣金</div>
						</div>
					</el-col>
					<el-col :span="6">
						<div class="stat-item">
							<div class="stat-value">¥{{ distributorInfo.availableCommission }}</div>
							<div class="stat-label">可提现佣金</div>
						</div>
					</el-col>
				</el-row>
			</div>
			<div v-else class="no-distributor">
				<el-empty description="您还不是分销商">
					<el-button type="primary" @click="showApplyDialog">申请成为分销商</el-button>
				</el-empty>
			</div>
		</el-card>

		<!-- 今日数据统计 -->
		<el-row :gutter="20" class="stats-row">
			<el-col :span="8">
				<el-card shadow="hover">
					<div class="stat-card">
						<el-icon class="stat-icon" color="#409EFF"><ShoppingCart /></el-icon>
						<div class="stat-info">
							<div class="stat-title">今日订单</div>
							<div class="stat-number">{{ todayStats.orderCount }}</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="8">
				<el-card shadow="hover">
					<div class="stat-card">
						<el-icon class="stat-icon" color="#67C23A"><Money /></el-icon>
						<div class="stat-info">
							<div class="stat-title">今日销售额</div>
							<div class="stat-number">¥{{ todayStats.salesAmount.toFixed(2) }}</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="8">
				<el-card shadow="hover">
					<div class="stat-card">
						<el-icon class="stat-icon" color="#E6A23C"><Wallet /></el-icon>
						<div class="stat-info">
							<div class="stat-title">今日佣金</div>
							<div class="stat-number">¥{{ todayStats.commissionAmount.toFixed(2) }}</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 快捷入口 -->
		<el-card class="quick-entry" shadow="hover">
			<template #header>
				<span>快捷入口</span>
			</template>
			<el-row :gutter="20">
				<el-col :span="6">
					<div class="entry-item" @click="goToTeam">
						<el-icon class="entry-icon" color="#409EFF"><User /></el-icon>
						<div class="entry-text">我的团队</div>
					</div>
				</el-col>
				<el-col :span="6">
					<div class="entry-item" @click="goToCommission">
						<el-icon class="entry-icon" color="#67C23A"><Money /></el-icon>
						<div class="entry-text">佣金明细</div>
					</div>
				</el-col>
				<el-col :span="6">
					<div class="entry-item" @click="goToWithdraw">
						<el-icon class="entry-icon" color="#E6A23C"><Wallet /></el-icon>
						<div class="entry-text">申请提现</div>
					</div>
				</el-col>
				<el-col :span="6">
					<div class="entry-item" @click="showQrCode">
						<el-icon class="entry-icon" color="#F56C6C"><Share /></el-icon>
						<div class="entry-text">推广二维码</div>
					</div>
				</el-col>
			</el-row>
		</el-card>

		<!-- 申请分销商对话框 -->
		<el-dialog v-model="applyDialogVisible" title="申请成为分销商" width="500px">
			<el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" label-width="100px">
				<el-form-item label="真实姓名" prop="realName">
					<el-input v-model="applyForm.realName" placeholder="请输入真实姓名" />
				</el-form-item>
				<el-form-item label="联系电话" prop="phone">
					<el-input v-model="applyForm.phone" placeholder="请输入联系电话" />
				</el-form-item>
				<el-form-item label="身份证号" prop="idCard">
					<el-input v-model="applyForm.idCard" placeholder="请输入身份证号" />
				</el-form-item>
				<el-form-item label="推荐人ID" prop="parentId">
					<el-input v-model="applyForm.parentId" placeholder="选填，如有推荐人请填写" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="applyDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitApply">提交申请</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="DistributionCenter">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDistributorInfo, applyDistributor } from '/@/api/distribution/distributor'
import { getCommissionStats } from '/@/api/distribution/commission'

const router = useRouter()

const distributorInfo = ref<any>(null)
const todayStats = ref({
	orderCount: 0,
	salesAmount: 0,
	commissionAmount: 0
})
const applyDialogVisible = ref(false)
const applyFormRef = ref()

const applyForm = ref({
	realName: '',
	phone: '',
	idCard: '',
	parentId: ''
})

const applyRules = {
	realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
	phone: [
		{ required: true, message: '请输入联系电话', trigger: 'blur' },
		{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
	],
	idCard: [
		{ required: true, message: '请输入身份证号', trigger: 'blur' },
		{ pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
	]
}

// 获取分销商信息
const fetchDistributorInfo = async () => {
	try {
		const res = await getDistributorInfo()
		if (res.code === 0 && res.data) {
			distributorInfo.value = res.data
		}
	} catch (error: any) {
		// 如果返回404或未找到，说明用户还不是分销商
		if (error?.response?.status === 404 || error?.code === 404) {
			distributorInfo.value = null
		} else {
			console.error('获取分销商信息失败', error)
		}
	}
}

// 获取今日统计数据
const fetchTodayStats = async () => {
	try {
		const res = await getCommissionStats()
		if (res.code === 0 && res.data) {
			// 这里可以根据实际返回的数据结构调整
			todayStats.value = {
				orderCount: res.data.todayOrderCount || 0,
				salesAmount: res.data.todaySalesAmount || 0,
				commissionAmount: res.data.todayCommission || 0
			}
		}
	} catch (error) {
		console.error('获取今日统计失败', error)
	}
}

// 获取等级类型
const getLevelType = (level: number) => {
	const types: any = {
		1: '',
		2: 'warning',
		3: 'success',
		4: 'danger',
		5: 'danger'
	}
	return types[level] || ''
}

// 显示申请对话框
const showApplyDialog = () => {
	applyDialogVisible.value = true
}

// 提交申请
const submitApply = async () => {
	try {
		await applyFormRef.value.validate()
		const res = await applyDistributor(applyForm.value)
		if (res.code === 0) {
			ElMessage.success('申请提交成功，请等待审核')
			applyDialogVisible.value = false
			// 重置表单
			applyForm.value = {
				realName: '',
				phone: '',
				idCard: '',
				parentId: ''
			}
			// 刷新分销商信息
			fetchDistributorInfo()
		} else {
			ElMessage.error(res.msg || '申请提交失败')
		}
	} catch (error: any) {
		ElMessage.error(error?.msg || '申请提交失败')
	}
}

// 跳转到我的团队
const goToTeam = () => {
	router.push('/distribution/distributor')
}

// 跳转到佣金明细
const goToCommission = () => {
	router.push('/distribution/commission')
}

// 跳转到申请提现
const goToWithdraw = () => {
	router.push('/distribution/withdraw')
}

// 显示推广二维码
const showQrCode = () => {
	ElMessage.info('推广二维码功能开发中')
}

onMounted(() => {
	fetchDistributorInfo()
	fetchTodayStats()
})
</script>

<style scoped lang="scss">
.distribution-center {
	padding: 20px;

	.info-card {
		margin-bottom: 20px;

		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.info-content {
			.stat-item {
				text-align: center;
				padding: 20px 0;

				.stat-value {
					font-size: 28px;
					font-weight: bold;
					color: #409eff;
					margin-bottom: 10px;
				}

				.stat-label {
					font-size: 14px;
					color: #909399;
				}
			}
		}

		.no-distributor {
			padding: 40px 0;
		}
	}

	.stats-row {
		margin-bottom: 20px;

		.stat-card {
			display: flex;
			align-items: center;
			padding: 10px 0;

			.stat-icon {
				font-size: 48px;
				margin-right: 20px;
			}

			.stat-info {
				flex: 1;

				.stat-title {
					font-size: 14px;
					color: #909399;
					margin-bottom: 10px;
				}

				.stat-number {
					font-size: 24px;
					font-weight: bold;
					color: #303133;
				}
			}
		}
	}

	.quick-entry {
		.entry-item {
			text-align: center;
			padding: 30px 0;
			cursor: pointer;
			transition: all 0.3s;

			&:hover {
				background-color: #f5f7fa;
				border-radius: 4px;
			}

			.entry-icon {
				font-size: 48px;
				margin-bottom: 10px;
			}

			.entry-text {
				font-size: 14px;
				color: #606266;
			}
		}
	}
}
</style>
