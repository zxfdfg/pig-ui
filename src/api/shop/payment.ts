import request from '@/utils/request'

/**
 * 创建支付单
 * @param data 支付参数
 */
export const createPayment = (data: any) => {
	return request({
		url: '/product/shop/payment/create',
		method: 'post',
		data
	})
}

/**
 * 模拟支付
 * @param paymentNo 支付单号
 */
export const mockPay = (paymentNo: string) => {
	return request({
		url: '/product/shop/payment/mock-pay',
		method: 'post',
		data: { paymentNo }
	})
}

/**
 * 查询支付状态
 * @param orderNo 订单号
 */
export const getPaymentStatus = (orderNo: string) => {
	return request({
		url: `/product/shop/payment/status/${orderNo}`,
		method: 'get'
	})
}
