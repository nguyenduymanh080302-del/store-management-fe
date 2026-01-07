import axios from "../configs/axios"

export const fetchCategoryList = async (): Promise<ApiResponse<Category[]>> => {
    const res = await axios.get('/category')
    return res.data
}

export const fetchCategoryById = async (id: number): Promise<ApiResponse<Category>> => {
    const res = await axios.get(`/category/${id}`)
    return res.data
}

export const createCategory = async (data: CreateCategoryPayload): Promise<ApiResponse<Category>> => {
    const res = await axios.post('/category', data)
    return res.data
}

export const updateCategory = async (id: number, data: UpdateCategoryPayload): Promise<ApiResponse<Category>> => {
    const res = await axios.patch(`/category/${id}`, data)
    return res.data
}

export const deleteCategory = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/category/${id}`)
    return res.data
}