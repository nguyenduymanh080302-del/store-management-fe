type Customer = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    debt: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type CreateCustomerPayload = Pick<Customer, 'name' | 'email' | 'phone' | 'address' | 'debt'>;

type UpdateCustomerPayload = Partial<CreateCustomerPayload> & { id: number; };
