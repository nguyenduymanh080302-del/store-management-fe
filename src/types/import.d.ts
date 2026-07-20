type ImportProductPayload = {
    productId: number
    unitId: number
    quantity: number
}

type CreateImportPayload = {
    warehouseId: number
    supplierId: number
    products: ImportProductPayload[]
}
