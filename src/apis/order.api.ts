import axios from '@/configs/axios'

export const fetchOrderList = async (
    params?: GetOrdersQuery
): Promise<ApiResponse<PaginatedData<Order>>> => {
    const res = await axios.get('/order', { params })
    return res.data
}

export const fetchOrderById = async (id: number): Promise<ApiResponse<Order>> => {
    const res = await axios.get(`/order/${id}`)
    return res.data
}

export const createOrder = async (data: CreateOrderPayload): Promise<ApiResponse<Order>> => {
    const res = await axios.post('/order', data)
    return res.data
}

export const updateOrder = async (
    id: number,
    data: UpdateOrderPayload
): Promise<ApiResponse<Order>> => {
    const res = await axios.patch(`/order/${id}`, data)
    return res.data
}

export const deleteOrder = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/order/${id}`)
    return res.data
}
