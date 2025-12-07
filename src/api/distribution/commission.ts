import request from '/@/utils/request'

/**
 * 获取佣金列表
 * @param params 查询参数
 */
export const getCommissionList = (params: any) => {
	return request({
		url: '/distribution/commission/page',
		method: 'get',
		params,
	})
}

/**
 * 获取佣金统计
 */
export const getCommissionStats = () => {
	return request({
		url: '/distribution/commission/stats',
		method: 'get',
	})
}

/**
 * 导出佣金数据
 * @param params 查询参数
 */
export const exportCommission = (params: any) => {
	return request({
		url: '/distribution/commission/export',
		method: 'get',
		params,
		responseType: 'blob',
	})
}
