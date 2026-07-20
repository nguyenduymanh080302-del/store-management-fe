type Warehouse = {
    id: number
    name: string
    address?: string | null
    isActive?: boolean
    createdAt: string
    updatedAt: string
    products?: WarehouseProductStock[]
}

type WarehouseProductStock = {
    productId: number
    unitId: number
    quantity: number
}

type CreateWarehousePayload = Pick<Warehouse, 'name' | 'address' | 'isActive'>

type UpdateWarehousePayload = Partial<CreateWarehousePayload> & {
    id: number
}
