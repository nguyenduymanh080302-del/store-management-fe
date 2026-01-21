type Supplier = {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    debt: number;
    createdAt: string;
    updatedAt: string;
};

type CreateSupplierPayload = Pick<
    Supplier,
    'name' | 'email' | 'phone' | 'address' | 'debt'
>;

type UpdateSupplierPayload = Partial<CreateSupplierPayload> & {
    id: number;
};
