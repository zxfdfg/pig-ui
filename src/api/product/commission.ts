import request from '@/utils/request'

// 分页查询佣金配置
export const getCommissionConfigPage = (params: any) => {
	return request({
		url: '/product/commission/config/page',
		method: 'get',
		params
	})
}

// 查询商品佣金配置
export const getProductCommission = (productId: number) => {
	return request({
		url: `/product/commission/config/${productId}`,
		method: 'get'
	})
}

// 查询分类佣金配置
export const getCategoryCommission = (categoryId: number) => {
	return request({
		url: `/product/commission/config/category/${categoryId}`,
		method: 'get'
	})
}

// 创建佣金配置
export const createCommissionConfig = (data: any) => {
	return request({
		url: '/product/commission/config',
		method: 'post',
		data
	})
}

// 更新佣金配置
export const updateCommissionConfig = (data: any) => {
	return request({
		url: '/product/commission/config',
		method: 'put',
		data
	})
}

// 删除佣金配置
export const deleteCommissionConfig = (id: number) => {
	return request({
		url: `/product/commission/config/${id}`,
		method: 'delete'
	})
}

// 批量设置佣金配置
export const batchSetCommission = (data: any) => {
	return request({
		url: '/product/commission/config/batch',
		method: 'post',
		data
	})
}
