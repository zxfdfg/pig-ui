import request from '@/utils/request'

// 增加库存
export const increaseStock = (productId: number, quantity: number, remark?: string) => {
	return request({
		url: '/product/stock/increase',
		method: 'put',
		params: { productId, quantity, remark }
	})
}

// 减少库存
export const decreaseStock = (productId: number, quantity: number, remark?: string) => {
	return request({
		url: '/product/stock/decrease',
		method: 'put',
		params: { productId, quantity, remark }
	})
}

// 查询商品库存
export const getStock = (productId: number) => {
	return request({
		url: `/product/stock/${productId}`,
		method: 'get'
	})
}

// 查询低库存商品
export const getLowStockProducts = () => {
	return request({
		url: '/product/stock/low',
		method: 'get'
	})
}

// 查询库存日志
export const getStockLogs = (productId: number) => {
	return request({
		url: `/product/stock/log/${productId}`,
		method: 'get'
	})
}

// 分页查询库存
export const getStockPage = (params: any) => {
	return request({
		url: '/product/stock/page',
		method: 'get',
		params
	})
}

// 查询库存日志（别名）
export const getStockLog = (productId: number) => {
	return getStockLogs(productId)
}
