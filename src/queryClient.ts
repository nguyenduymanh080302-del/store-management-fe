import { QueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import { useAuthStore } from 'stores/auth.store'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30 * 1000, // 30s
            gcTime: 5 * 60 * 1000, // 5 min
        },
        mutations: {
            onError: (error: any) => {
                // Global mutation error handler
                notification.error({
                    title: "Error"
                })

                // Auto logout on 401
                if (error?.response?.status === 401) {
                    useAuthStore.getState().logout()
                }
            },
        },
    },
})
