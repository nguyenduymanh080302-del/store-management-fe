import axios from "@/configs/axios";

const buildProductFormData = (
    data: CreateProductPayload | UpdateProductPayload,
    imageFiles?: File[],
) => {
    const formData = new FormData();

    if (data.name !== undefined) formData.append('name', data.name);
    if (data.slug !== undefined) formData.append('slug', data.slug);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.categoryId !== undefined) formData.append('categoryId', String(data.categoryId));
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));

    if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
            formData.append('images', file);
        });
    }

    if (data.units && data.units.length > 0) {
        formData.append('units', JSON.stringify(data.units));
    }

    if ('deleteImageIds' in data && data.deleteImageIds && data.deleteImageIds.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(data.deleteImageIds));
    }

    return formData;
};

// READ ALL
export const fetchProductList = async (
    params?: GetProductsQuery,
): Promise<ApiResponse<PaginatedData<Product>>> => {
    const res = await axios.get('/product', { params });
    return res.data;
};

// READ ONE
export const fetchProductById = async (id: number): Promise<ApiResponse<Product>> => {
    const res = await axios.get(`/product/${id}`);
    return res.data;
};

// CREATE
export const createProduct = async (data: CreateProductPayload, imageFiles?: File[]): Promise<ApiResponse<Product>> => {
    const res = await axios.post('/product', buildProductFormData(data, imageFiles));
    return res.data;
};

// UPDATE
export const updateProduct = async (id: number, data: UpdateProductPayload, imageFiles?: File[]): Promise<ApiResponse<Product>> => {
    const res = await axios.patch(`/product/${id}`, buildProductFormData(data, imageFiles));
    return res.data;
};

// DELETE
export const deleteProduct = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/product/${id}`);
    return res.data;
};
