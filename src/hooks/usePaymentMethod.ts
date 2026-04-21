import { useQuery } from '@tanstack/react-query'
import {
    fetchPaymentMethodById,
    fetchPaymentMethodList,
} from 'apis/paymentMethod.api'

export const PAYMENT_METHOD_QUERY_KEY = {
    list: ['paymentMethodList'] as const,
    detail: (id?: number) => ['paymentMethod', id] as const,
}

export const usePaymentMethodListQuery = () =>
    useQuery({
        queryKey: PAYMENT_METHOD_QUERY_KEY.list,
        queryFn: fetchPaymentMethodList,
    })

export const usePaymentMethodByIdQuery = (id?: number) =>
    useQuery({
        queryKey: PAYMENT_METHOD_QUERY_KEY.detail(id),
        queryFn: () => fetchPaymentMethodById(id!),
        enabled: !!id,
    })
