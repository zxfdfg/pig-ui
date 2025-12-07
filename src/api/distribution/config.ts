import request from '/@/utils/request'

/**
 * 获取佣金配置列表
 */
export const getConfigList = () => {
	return request({
		url: '/distribution/config/list',
		method: 'get',
	})
}

/**
 * 获取佣金配置详情
 * @param id 配置ID
 */
export const getConfigDetail = (id: number) => {
	return request({
		url: `/distribution/config/${id}`,
		method: 'get',
	})
}

/**
 * 新增佣金配置
 * @param data 配置数据
 */
export const addConfig = (data: any) => {
	return request({
		url: '/distribution/config',
		method: 'post',
		data,
	})
}

/**
 * 修改佣金配置
 * @param data 配置数据
 */
export const updateConfig = (data: any) => {
	return request({
		url: '/distribution/config',
		method: 'put',
		data,
	})
}

/**
 * 删除佣金配置
 * @param id 配置ID
 */
export const deleteConfig = (id: number) => {
	return request({
		url: `/distribution/config/${id}`,
		method: 'delete',
	})
}
