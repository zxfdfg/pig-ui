import request from '@/utils/request'

/**
 * 添加到购物车
 * @param data 购物车信息
 */
export const addToCart = (data: any) => {
	return request({
		url: '/product/shop/cart',
		method: 'post',
		data
	})
}

/**
 * 获取购物车列表
 */
export const getCartList = () => {
	return request({
		url: '/product/shop/cart/list',
		method: 'get'
	})
}

/**
 * 更新购物车商品数量
 * @param id 购物车ID
 * @param quantity 数量
 */
export const updateCartQuantity = (id: number, quantity: number) => {
	return request({
		url: `/product/shop/cart/${id}/quantity`,
		method: 'put',
		params: { quantity }
	})
}

/**
 * 删除购物车商品
 * @param id 购物车ID
 */
export const deleteCartItem = (id: number) => {
	return request({
		url: `/product/shop/cart/${id}`,
		method: 'delete'
	})
}

/**
 * 批量删除购物车商品
 * @param ids 购物车ID列表
 */
export const batchDeleteCartItems = (ids: number[]) => {
	return request({
		url: '/product/shop/cart/batch',
		method: 'delete',
		data: ids
	})
}

/**
 * 清空购物车
 */
export const clearCart = () => {
	return request({
		url: '/product/shop/cart/clear',
		method: 'delete'
	})
}

/**
 * 选中/取消选中商品
 * @param id 购物车ID
 * @param selected 是否选中：0-否，1-是
 */
export const selectCartItem = (id: number, selected: number) => {
	return request({
		url: `/product/shop/cart/${id}/select`,
		method: 'put',
		params: { selected }
	})
}

/**
 * 全选/取消全选
 * @param selected 是否选中：0-否，1-是
 */
export const selectAllCartItems = (selected: number) => {
	return request({
		url: '/product/shop/cart/select-all',
		method: 'put',
		params: { selected }
	})
}
