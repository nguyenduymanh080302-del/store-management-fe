import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    fetchProductList,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "apis/product.api"

/* ======================
   QUERY KEYS
====================== */
export const PRODUCT_QUERY_KEY = {
    list: (params?: GetProductsQuery) => ['productList', params] as const,
    detail: (id?: number) => ['product', id] as const,
}

/* ======================
   QUERIES
====================== */

export const useProductListQuery = (params?: GetProductsQuery) =>
    useQuery({
        queryKey: PRODUCT_QUERY_KEY.list(params),
        queryFn: () => fetchProductList(params),
    })

export const useProductByIdQuery = (id?: number) =>
    useQuery({
        queryKey: PRODUCT_QUERY_KEY.detail(id),
        queryFn: () => fetchProductById(id!),
        enabled: !!id,
    })

/* ======================
   MUTATIONS
====================== */

export const useCreateProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            data,
            imageFiles,
        }: {
            data: CreateProductPayload
            imageFiles?: File[]
        }) => createProduct(data, imageFiles),

        onSuccess: (res) => {
            const newProduct = res.data
            if (!newProduct) return

            queryClient.invalidateQueries({
                queryKey: ['productList'],
            })
        },
    })
}

export const useUpdateProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            id,
            data,
            imageFiles,
        }: {
            id: number
            data: UpdateProductPayload
            imageFiles?: File[]
        }) => updateProduct(id, data, imageFiles),

        onSuccess: (res, { id }) => {
            const updatedProduct = res.data
            if (!updatedProduct) return

            queryClient.invalidateQueries({
                queryKey: ['productList'],
            })

            queryClient.setQueryData<ApiResponse<Product>>(
                PRODUCT_QUERY_KEY.detail(id),
                (old) => {
                    if (!old?.data) return old

                    return {
                        ...old,
                        data: updatedProduct,
                    }
                }
            )
        },
    })
}

export const useDeleteProductMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProduct,

        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({
                queryKey: ['productList'],
            })
            queryClient.removeQueries({
                queryKey: PRODUCT_QUERY_KEY.detail(deletedId),
            })
        },
    })
}
