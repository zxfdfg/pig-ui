import request from '/@/utils/request'

/**
 * 申请成为分销商
 * @param data
 */
export const applyDistributor = (data: any) => {
	return request({
		url: '/distribution/distributor/apply',
		method: 'post',
		data
	})
}

/**
 * 获取分销商信息
 */
export const getDistributorInfo = () => {
	return request({
		url: '/distribution/distributor/info',
		method: 'get'
	})
}

/**
 * 获取下级分销商列表
 * @param params
 */
export const getChildrenList = (params: any) => {
	return request({
		url: '/distribution/distributor/children',
		method: 'get',
		params
	})
}

/**
 * 获取团队统计
 */
export const getTeamStats = () => {
	return request({
		url: '/distribution/distributor/team/stats',
		method: 'get'
	})
}

/**
 * 分页查询分销商列表
 * @param params
 */
export const getDistributorPage = (params: any) => {
	return request({
		url: '/distribution/distributor/page',
		method: 'get',
		params
	})
}

/**
 * 根据ID查询分销商
 * @param id
 */
export const getDistributorById = (id: number) => {
	return request({
		url: `/distribution/distributor/${id}`,
		method: 'get'
	})
}

/**
 * 审核分销商
 * @param id
 * @param status
 * @param remark
 */
export const auditDistributor = (id: number, status: number, remark?: string) => {
	return request({
		url: `/distribution/distributor/audit/${id}`,
		method: 'put',
		data: { status, remark }
	})
}

/**
 * 更新分销商
 * @param data
 */
export const updateDistributor = (data: any) => {
	return request({
		url: '/distribution/distributor',
		method: 'put',
		data
	})
}
