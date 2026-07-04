import axios from '@/configs/axios'

export const fetchPaymentMethodList = async (): Promise<ApiResponse<PaymentMethod[]>> => {
    const res = await axios.get('/payment-method')
    return res.data
}

export const fetchPaymentMethodById = async (id: number): Promise<ApiResponse<PaymentMethod>> => {
    const res = await axios.get(`/payment-method/${id}`)
    return res.data
}
