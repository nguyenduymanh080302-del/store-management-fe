type ApiResponse<T> = {
    data?: T;
    message: string;
    status: number;
}

type PaginationMeta = {
    page: number
    limit: number
    total: number
    totalPages: number
}

type PaginatedData<T> = {
    items: T[]
    pagination: PaginationMeta
}
