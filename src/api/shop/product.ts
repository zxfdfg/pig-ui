import request from '@/utils/request'

/**
 * 分页查询商品
 * @param params 查询参数
 */
export const getProductPage = (params: any) => {
	return request({
		url: '/product/product/page',
		method: 'get',
		params
	})
}

/**
 * 查询商品详情
 * @param id 商品ID
 */
export const getProductById = (id: number) => {
	return request({
		url: `/product/product/${id}`,
		method: 'get'
	})
}

/**
 * 查询商品分类列表
 */
export const getCategoryList = () => {
	return request({
		url: '/product/category/list',
		method: 'get'
	})
}
