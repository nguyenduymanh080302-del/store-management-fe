import axios from '@/configs/axios'

export const createImport = async (data: CreateImportPayload): Promise<ApiResponse<unknown>> => {
    const res = await axios.post('/import', data)
    return res.data
}
