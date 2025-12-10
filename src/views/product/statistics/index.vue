<template>
	<div class="statistics-container">
		<!-- 商品总览 -->
		<el-row :gutter="20">
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-card">
						<div class="stat-icon" style="background: #409eff">
							<el-icon :size="30"><Goods /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ overview.totalCount }}</div>
							<div class="stat-label">商品总数</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-card">
						<div class="stat-icon" style="background: #67c23a">
							<el-icon :size="30"><CircleCheck /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ overview.onlineCount }}</div>
							<div class="stat-label">上架商品</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-card">
						<div class="stat-icon" style="background: #e6a23c">
							<el-icon :size="30"><CircleClose /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ overview.offlineCount }}</div>
							<div class="stat-label">下架商品</div>
						</div>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card shadow="hover">
					<div class="stat-card">
						<div class="stat-icon" style="background: #f56c6c">
							<el-icon :size="30"><WarningFilled /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ overview.soldOutCount }}</div>
							<div class="stat-label">售罄商品</div>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 分类统计 -->
		<el-row :gutter="20" style="margin-top: 20px">
			<el-col :span="12">
				<el-card shadow="never">
					<template #header>
						<div class="card-header">
							<span>分类商品数量统计</span>
						</div>
					</template>
					<div ref="categoryChartRef" style="height: 300px"></div>
				</el-card>
			</el-col>
			<el-col :span="12">
				<el-card shadow="never">
					<template #header>
						<div class="card-header">
							<span>库存状态统计</span>
						</div>
					</template>
					<div ref="stockChartRef" style="height: 300px"></div>
				</el-card>
			</el-col>
		</el-row>

		<!-- 低库存商品 -->
		<el-card shadow="never" style="margin-top: 20px">
			<template #header>
				<div class="card-header">
					<span>低库存预警</span>
					<el-button type="primary" size="small" @click="handleExport">导出数据</el-button>
				</div>
			</template>
			<el-table :data="lowStockList" border stripe>
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
				<el-table-column prop="stock" label="当前库存" width="120">
					<template #default="{ row }">
						<el-tag type="danger">{{ row.stock }}</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="stockWarning" label="预警值" width="100" />
				<el-table-column prop="sales" label="销量" width="100" />
				<el-table-column label="操作" width="150">
					<template #default="{ row }">
						<el-button link type="primary" size="small" @click="handleAddStock(row)">补充库存</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!-- 销售排行 -->
		<el-card shadow="never" style="margin-top: 20px">
			<template #header>
				<div class="card-header">
					<span>销售排行榜 TOP 10</span>
				</div>
			</template>
			<el-table :data="topSalesList" border stripe>
				<el-table-column type="index" label="排名" width="80" />
				<el-table-column prop="productId" label="商品ID" width="100" />
				<el-table-column prop="productName" label="商品名称" min-width="200" show-overflow-tooltip />
				<el-table-column prop="sales" label="销量" width="120" sortable />
				<el-table-column prop="salesAmount" label="销售额" width="150" sortable>
					<template #default="{ row }"> ¥{{ row.salesAmount }} </template>
				</el-table-column>
				<el-table-column prop="stock" label="剩余库存" width="120" />
			</el-table>
		</el-card>
	</div>
</template>

<script setup lang="ts" name="ProductStatistics">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Goods, CircleCheck, CircleClose, WarningFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import {
	getProductOverview,
	getCategoryStatistics,
	getStockStatistics,
	exportData
} from '/@/api/product/statistics'

// 商品总览
const overview = reactive({
	totalCount: 0,
	onlineCount: 0,
	offlineCount: 0,
	soldOutCount: 0
})

// 图表引用
const categoryChartRef = ref<HTMLElement>()
const stockChartRef = ref<HTMLElement>()

// 低库存列表
const lowStockList = ref([])

// 销售排行
const topSalesList = ref([])

// 加载商品总览
const loadOverview = async () => {
	try {
		const res = await getProductOverview()
		Object.assign(overview, res.data)
	} catch (error) {
		ElMessage.error('加载总览失败')
	}
}

// 加载分类统计
const loadCategoryStatistics = async () => {
	try {
		const res = await getCategoryStatistics()
		await nextTick()
		if (categoryChartRef.value) {
			const chart = echarts.init(categoryChartRef.value)
			const option = {
				tooltip: {
					trigger: 'item'
				},
				legend: {
					orient: 'vertical',
					left: 'left'
				},
				series: [
					{
						name: '商品数量',
						type: 'pie',
						radius: '50%',
						data: res.data.map((item: any) => ({
							name: item.categoryName,
							value: item.productCount
						})),
						emphasis: {
							itemStyle: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			}
			chart.setOption(option)
		}
	} catch (error) {
		ElMessage.error('加载分类统计失败')
	}
}

// 加载库存统计
const loadStockStatistics = async () => {
	try {
		const res = await getStockStatistics()
		lowStockList.value = res.data.lowStockList || []
		topSalesList.value = res.data.topSalesList || []

		await nextTick()
		if (stockChartRef.value) {
			const chart = echarts.init(stockChartRef.value)
			const option = {
				tooltip: {
					trigger: 'item'
				},
				legend: {
					orient: 'vertical',
					left: 'left'
				},
				series: [
					{
						name: '库存状态',
						type: 'pie',
						radius: '50%',
						data: [
							{ name: '正常', value: res.data.normalCount || 0 },
							{ name: '低库存', value: res.data.lowStockCount || 0 },
							{ name: '售罄', value: res.data.soldOutCount || 0 }
						],
						emphasis: {
							itemStyle: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: 'rgba(0, 0, 0, 0.5)'
							}
						}
					}
				]
			}
			chart.setOption(option)
		}
	} catch (error) {
		ElMessage.error('加载库存统计失败')
	}
}

// 补充库存
const handleAddStock = (row: any) => {
	ElMessage.info('请前往库存管理页面进行操作')
}

// 导出数据
const handleExport = async () => {
	try {
		const res = await exportData({})
		const blob = new Blob([res], { type: 'application/vnd.ms-excel' })
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `商品统计_${new Date().getTime()}.xlsx`
		link.click()
		window.URL.revokeObjectURL(url)
		ElMessage.success('导出成功')
	} catch (error) {
		ElMessage.error('导出失败')
	}
}

onMounted(() => {
	loadOverview()
	loadCategoryStatistics()
	loadStockStatistics()
})
</script>

<style scoped lang="scss">
.statistics-container {
	padding: 20px;

	.stat-card {
		display: flex;
		align-items: center;

		.stat-icon {
			width: 60px;
			height: 60px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: white;
			margin-right: 15px;
		}

		.stat-content {
			flex: 1;

			.stat-value {
				font-size: 28px;
				font-weight: bold;
				color: #303133;
			}

			.stat-label {
				font-size: 14px;
				color: #909399;
				margin-top: 5px;
			}
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
}
</style>
