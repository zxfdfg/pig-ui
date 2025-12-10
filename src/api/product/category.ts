import request from '@/utils/request'

// 创建分类
export const createCategory = (data: any) => {
	return request({
		url: '/product/category',
		method: 'post',
		data
	})
}

// 更新分类
export const updateCategory = (data: any) => {
	return request({
		url: '/product/category',
		method: 'put',
		data
	})
}

// 删除分类
export const deleteCategory = (id: number) => {
	return request({
		url: `/product/category/${id}`,
		method: 'delete'
	})
}

// 查询分类树
export const getCategoryTree = () => {
	return request({
		url: '/product/category/tree',
		method: 'get'
	})
}

// 查询分类下的商品
export const getProductsByCategory = (id: number) => {
	return request({
		url: `/product/category/${id}/products`,
		method: 'get'
	})
}
