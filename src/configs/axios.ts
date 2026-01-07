import axios from 'axios'

const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
})

axiosConfig.interceptors.request.use(request => {
    const token = localStorage.getItem('accessToken')
    if (token) request.headers.Authorization = `Bearer ${token}`
    return request
})

axiosConfig.interceptors.response.use(response => {
    return response
})

export default axiosConfig
