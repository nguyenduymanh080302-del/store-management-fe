import axios from "../configs/axios";

// READ ALL
export const fetchSupplierList = async (): Promise<ApiResponse<Supplier[]>> => {
    const res = await axios.get('/supplier');
    return res.data;
};

// READ ONE
export const fetchSupplierById = async (id: number): Promise<ApiResponse<Supplier>> => {
    const res = await axios.get(`/supplier/${id}`);
    return res.data;
};

// CREATE
export const createSupplier = async (data: CreateSupplierPayload): Promise<ApiResponse<Supplier>> => {
    const res = await axios.post('/supplier', data);
    return res.data;
};

// UPDATE
export const updateSupplier = async (id: number, data: UpdateSupplierPayload): Promise<ApiResponse<Supplier>> => {
    const res = await axios.patch(`/supplier/${id}`, data);
    return res.data;
};

// DELETE
export const deleteSupplier = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/supplier/${id}`);
    return res.data;
};
