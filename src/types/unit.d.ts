type Unit = {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}

type CreateUnitPayload = Pick<Unit, 'name'>

type UpdateUnitPayload = Partial<CreateUnitPayload> & {
    id: number
}

