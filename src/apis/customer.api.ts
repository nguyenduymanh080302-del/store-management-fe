import axios from "../configs/axios";

// READ ALL
export const fetchCustomerList = async (): Promise<ApiResponse<Customer[]>> => {
    const res = await axios.get('/customer');
    return res.data;
};

// READ ONE
export const fetchCustomerById = async (id: number): Promise<ApiResponse<Customer>> => {
    const res = await axios.get(`/customer/${id}`);
    return res.data;
};

// CREATE
export const createCustomer = async (data: CreateCustomerPayload): Promise<ApiResponse<Customer>> => {
    const res = await axios.post('/customer', data);
    return res.data;
};

// UPDATE
export const updateCustomer = async (id: number, data: UpdateCustomerPayload): Promise<ApiResponse<Customer>> => {
    const res = await axios.patch(`/customer/${id}`, data);
    return res.data;
};

// DELETE
export const deleteCustomer = async (id: number): Promise<ApiResponse<null>> => {
    const res = await axios.delete(`/customer/${id}`);
    return res.data;
};
