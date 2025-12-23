import { ApiResponse } from "types/api"
import axios from "./axios"

export interface SigninPayload {
    username: string
    password: string
}

export const signinApi = async (payload: Pick<Account, "username" | "password">): Promise<ApiResponse<any>> => {
    const res = await axios.post('/auth/signin', payload)
    return res.data
}
