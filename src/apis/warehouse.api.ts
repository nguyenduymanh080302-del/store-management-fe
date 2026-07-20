import axios from '@/configs/axios'

export const fetchWarehouseList = async (): Promise<ApiResponse<Warehouse[]>> => {
    const res = await axios.get('/warehouse')
    return res.data
}

export const fetchWarehouseById = async (id: number): Promise<ApiResponse<Warehouse>> => {
    const res = await axios.get(`/warehouse/${id}`)
    return res.data
}

export const createWarehouse = async (data: CreateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    const res = await axios.post('/warehouse', data)
    return res.data
}

export const updateWarehouse = async (id: number, data: UpdateWarehousePayload): Promise<ApiResponse<Warehouse>> => {
    const res = await axios.patch(`/warehouse/${id}`, data)
    return res.data
}

export const deleteWarehouse = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/warehouse/${id}`)
    return res.data
}
