// apis/delivery.api.ts
import axios from '../configs/axios'
// READ ALL
export const fetchDeliveryList = async (): Promise<ApiResponse<Delivery[]>> => {
    const res = await axios.get('/delivery')
    return res.data
}

// READ ONE
export const fetchDeliveryById = async (id: number): Promise<ApiResponse<Delivery>> => {
    const res = await axios.get(`/delivery/${id}`)
    return res.data
}

// CREATE
export const createDelivery = async (data: CreateDeliveryPayload): Promise<ApiResponse<Delivery>> => {
    const res = await axios.post('/delivery', data)
    return res.data
}

// UPDATE
export const updateDelivery = async (id: number, data: UpdateDeliveryPayload): Promise<ApiResponse<Delivery>> => {
    const res = await axios.patch(`/delivery/${id}`, data)
    return res.data
}

// DELETE
export const deleteDelivery = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/delivery/${id}`)
    return res.data
}
