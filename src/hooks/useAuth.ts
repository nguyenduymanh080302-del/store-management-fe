import { useMutation } from '@tanstack/react-query'
import { signinApi } from 'apis/auth.api'

export const useSignin = () => {
    return useMutation({
        mutationFn: signinApi,
    })
}
