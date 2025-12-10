import request from '@/utils/request'

// 商品总览统计
export const getProductOverview = () => {
	return request({
		url: '/product/statistics/overview',
		method: 'get'
	})
}

// 分类统计
export const getCategoryStatistics = () => {
	return request({
		url: '/product/statistics/category',
		method: 'get'
	})
}

// 库存统计
export const getStockStatistics = () => {
	return request({
		url: '/product/statistics/stock',
		method: 'get'
	})
}

// 分销统计
export const getDistributionStatistics = (productId: number) => {
	return request({
		url: `/product/statistics/distribution/${productId}`,
		method: 'get'
	})
}

// 利润分析
export const getProfitAnalysis = (productId: number) => {
	return request({
		url: `/product/statistics/profit/${productId}`,
		method: 'get'
	})
}

// 导出数据
export const exportData = (params: any) => {
	return request({
		url: '/product/statistics/export',
		method: 'post',
		data: params,
		responseType: 'blob'
	})
}
