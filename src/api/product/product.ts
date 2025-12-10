import request from '@/utils/request'

// 创建商品
export const createProduct = (data: any) => {
	return request({
		url: '/product/product',
		method: 'post',
		data
	})
}

// 更新商品
export const updateProduct = (data: any) => {
	return request({
		url: '/product/product',
		method: 'put',
		data
	})
}

// 删除商品
export const deleteProduct = (id: number) => {
	return request({
		url: `/product/product/${id}`,
		method: 'delete'
	})
}

// 查询商品详情
export const getProductDetail = (id: number) => {
	return request({
		url: `/product/product/${id}`,
		method: 'get'
	})
}

// 分页查询商品
export const getProductPage = (params: any) => {
	return request({
		url: '/product/product/page',
		method: 'get',
		params
	})
}

// 更新商品状态
export const updateProductStatus = (id: number, status: number) => {
	return request({
		url: `/product/product/status/${id}`,
		method: 'put',
		params: { status }
	})
}
