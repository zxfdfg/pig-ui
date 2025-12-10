import request from '@/utils/request'

/**
 * 获取地址列表
 */
export const getAddressList = () => {
	return request({
		url: '/product/shop/address/list',
		method: 'get'
	})
}

/**
 * 获取默认地址
 */
export const getDefaultAddress = () => {
	return request({
		url: '/product/shop/address/default',
		method: 'get'
	})
}

/**
 * 新增地址
 * @param data 地址信息
 */
export const addAddress = (data: any) => {
	return request({
		url: '/product/shop/address',
		method: 'post',
		data
	})
}

/**
 * 更新地址
 * @param data 地址信息
 */
export const updateAddress = (data: any) => {
	return request({
		url: '/product/shop/address',
		method: 'put',
		data
	})
}

/**
 * 删除地址
 * @param id 地址ID
 */
export const deleteAddress = (id: number) => {
	return request({
		url: `/product/shop/address/${id}`,
		method: 'delete'
	})
}

/**
 * 设为默认地址
 * @param id 地址ID
 */
export const setDefaultAddress = (id: number) => {
	return request({
		url: `/product/shop/address/default/${id}`,
		method: 'put'
	})
}
