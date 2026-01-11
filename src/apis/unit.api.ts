import axios from "../configs/axios"

export const fetchUnitList = async (): Promise<ApiResponse<Unit[]>> => {
    const res = await axios.get('/unit')
    return res.data
}

export const fetchUnitById = async (id: number): Promise<ApiResponse<Unit>> => {
    const res = await axios.get(`/unit/${id}`)
    return res.data
}

export const createUnit = async (data: CreateUnitPayload): Promise<ApiResponse<Unit>> => {
    const res = await axios.post('/unit', data)
    return res.data
}

export const updateUnit = async (id: number, data: UpdateUnitPayload): Promise<ApiResponse<Unit>> => {
    const res = await axios.patch(`/unit/${id}`, data)
    return res.data
}

export const deleteUnit = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/unit/${id}`)
    return res.data
}