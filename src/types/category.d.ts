type Category = {
    id: number
    name: string
    slug: string
    createdAt: string
    updatedAt: string
}

type CreateCategoryPayload = Pick<Category, 'name' | 'slug'>

type UpdateCategoryPayload = Partial<CreateCategoryPayload>