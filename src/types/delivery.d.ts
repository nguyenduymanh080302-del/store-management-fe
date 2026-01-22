type Delivery = {
    id: number
    name: string
    email: string | null
    phone: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

type CreateDeliveryPayload = Pick<Delivery, 'name' | 'email' | 'phone' | 'isActive'>

type UpdateDeliveryPayload = Partial<CreateDeliveryPayload> & { id: number }
