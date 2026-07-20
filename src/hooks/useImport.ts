import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createImport } from '@/apis/import.api'
import { WAREHOUSE_QUERY_KEY } from '@/hooks/useWarehouse'

export const useCreateImportMutation = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createImport,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: WAREHOUSE_QUERY_KEY.list }),
    })
}
