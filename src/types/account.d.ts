type Account = {
    id: number
    name: string
    avatar: string
    phone: string
    address: string
    username: string
    password: string
    email: string
    isActive: boolean
    roleId: number
    role: Role
    warehouseId?: number | null
    createdAt: string
    updatedAt: string
}
