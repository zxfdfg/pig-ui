import request from '@/utils/request'

// 创建SKU
export const createSku = (data: any) => {
	return request({
		url: '/product/sku',
		method: 'post',
		data
	})
}

// 更新SKU
export const updateSku = (data: any) => {
	return request({
		url: '/product/sku',
		method: 'put',
		data
	})
}

// 删除SKU
export const deleteSku = (id: number) => {
	return request({
		url: `/product/sku/${id}`,
		method: 'delete'
	})
}

// 查询商品的所有SKU
export const getSkusByProductId = (productId: number) => {
	return request({
		url: `/product/sku/product/${productId}`,
		method: 'get'
	})
}

// 分页查询SKU
export const getSkuPage = (params: any) => {
	return request({
		url: '/product/sku/page',
		method: 'get',
		params
	})
}
