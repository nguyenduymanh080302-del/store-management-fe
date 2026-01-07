import axios from "../configs/axios"

export const signinApi = async (payload: Pick<Account, "username" | "password">): Promise<ApiResponse<any>> => {
    const res = await axios.post('/auth/signin', payload)
    return res.data
}

export const checkAuthentication = async (): Promise<ApiResponse<any>> => {
    const res = await axios.get('/auth/me')
    return res.data
}