import request from '@/utils/request'

/**
 * 从购物车创建订单
 * @param data 订单参数
 */
export const createOrderFromCart = (data: any) => {
	return request({
		url: '/product/shop/order/create-from-cart',
		method: 'post',
		data
	})
}

/**
 * 立即购买创建订单
 * @param data 订单参数
 */
export const createOrderDirect = (data: any) => {
	return request({
		url: '/product/shop/order/create-direct',
		method: 'post',
		data
	})
}

/**
 * 分页查询订单
 * @param params 查询参数
 */
export const getOrderPage = (params: any) => {
	return request({
		url: '/product/shop/order/page',
		method: 'get',
		params
	})
}

/**
 * 查询订单详情
 * @param id 订单ID
 */
export const getOrderById = (id: number) => {
	return request({
		url: `/product/shop/order/${id}`,
		method: 'get'
	})
}

/**
 * 根据订单号查询订单
 * @param orderNo 订单号
 */
export const getOrderByNo = (orderNo: string) => {
	return request({
		url: `/product/shop/order/no/${orderNo}`,
		method: 'get'
	})
}

/**
 * 取消订单
 * @param id 订单ID
 * @param reason 取消原因
 */
export const cancelOrder = (id: number, reason: string) => {
	return request({
		url: `/product/shop/order/cancel/${id}`,
		method: 'put',
		data: { reason }
	})
}

/**
 * 确认收货
 * @param id 订单ID
 */
export const confirmOrder = (id: number) => {
	return request({
		url: `/product/shop/order/confirm/${id}`,
		method: 'put'
	})
}
