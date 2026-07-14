type Warehouse = {
    id: number
    name: string
    address?: string | null
    isActive?: boolean
    createdAt: string
    updatedAt: string
}

type CreateWarehousePayload = Pick<Warehouse, 'name' | 'address' | 'isActive'>

type UpdateWarehousePayload = Partial<CreateWarehousePayload> & {
    id: number
}
