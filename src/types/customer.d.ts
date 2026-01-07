type Customer = {
    id: number
    name: string
    email: string
    phone: string
    address: string
    debt: number
    createdAt: string
    updatedAt: string
}

interface SelectOption<T = string> {
    value: T;
    label: React.ReactNode;
    disabled?: boolean;
}