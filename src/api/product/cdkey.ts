import request from '@/utils/request'

// 分页查询CDKEY
export const getCdkeyPage = (params: any) => {
	return request({
		url: '/product/cdkey/page',
		method: 'get',
		params
	})
}

// 查询CDKEY详情
export const getCdkeyById = (id: number) => {
	return request({
		url: `/product/cdkey/${id}`,
		method: 'get'
	})
}

// 批量导入CDKEY
export const importCdkey = (data: any) => {
	return request({
		url: '/product/cdkey/import',
		method: 'post',
		data
	})
}

// 查询商品的CDKEY列表
export const getProductCdkeys = (productId: number) => {
	return request({
		url: `/product/cdkey/product/${productId}`,
		method: 'get'
	})
}
