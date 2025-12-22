import { ORDER_STATUS } from "utils/enum"

type Order = {
    id: number
    orderCode: string
    customerId: number
    customer: Customer
    customerName: string
    customerEmail: string
    customerPhone: string
    customerAddress: string
    customerPayment: number
    paymentMethodId: number
    paymentMethod: PaymentMethod
    vatValue: number
    discountValue: number
    products: Product[]
    totalAmount: number
    toPayAmount: number
    status: ORDER_STATUS
    creatorId: number
    createBy: Account
    createdAt: string
    updatedAt: string
}