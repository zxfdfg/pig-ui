import request from '/@/utils/request'

/**
 * 获取提现列表
 * @param params 查询参数
 */
export const getWithdrawList = (params: any) => {
	return request({
		url: '/distribution/withdraw/page',
		method: 'get',
		params,
	})
}

/**
 * 提现审核
 * @param id 提现ID
 * @param status 审核状态：1-通过 2-拒绝
 * @param remark 审核备注
 */
export const auditWithdraw = (id: number, status: number, remark?: string) => {
	return request({
		url: `/distribution/withdraw/audit/${id}`,
		method: 'put',
		data: { status, remark },
	})
}

/**
 * 导出提现数据
 * @param params 查询参数
 */
export const exportWithdraw = (params: any) => {
	return request({
		url: '/distribution/withdraw/export',
		method: 'get',
		params,
		responseType: 'blob',
	})
}
