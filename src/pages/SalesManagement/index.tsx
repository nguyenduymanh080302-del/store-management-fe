import {
    Button,
    Col,
    Flex,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Spin,
    Table,
    Tag,
    Typography,
} from 'antd'
import type { ColumnType } from 'antd/es/table'
import { IconPlus, IconTrash } from 'assets/icons'
import FormattedMessage from 'components/FormattedMessage'
import dayjs from 'dayjs'
import { useCustomerListQuery } from 'hooks/useCustomer'
import { useDeliveryListQuery } from 'hooks/useDelivery'
import {
    useCreateOrderMutation,
    useDeleteOrderMutation,
    useOrderListQuery,
    useUpdateOrderMutation,
} from 'hooks/useOrder'
import { usePaymentMethodListQuery } from 'hooks/usePaymentMethod'
import { useProductListQuery } from 'hooks/useProduct'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from 'stores/app.store'
import { useAuthStore } from 'stores/auth.store'
import { DATE_FORMAT_BY_LOCALE } from 'utils/constant'
import { ORDER_STATUS } from 'utils/enum'
import { normalizeSpace } from 'utils/hepler'

type OrderLineFormValue = {
    productId?: number | string
    unitId?: number | string
    quantity?: number | string
    sellPrice?: number | string
    extraPrice?: number | string
    vatPercent?: number | string
}

type OrderFormValues = Omit<
    CreateOrderPayload,
    | 'customerId'
    | 'paymentMethodId'
    | 'deliveryId'
    | 'warehouseId'
    | 'discountValue'
    | 'paidAmount'
    | 'products'
> & {
    customerId?: number | string
    paymentMethodId?: number | string
    deliveryId?: number | string
    warehouseId?: number | string
    discountValue?: number | string
    paidAmount?: number | string
    products?: OrderLineFormValue[]
}

const statusColorMap: Record<ORDER_STATUS, string> = {
    [ORDER_STATUS.PENDING]: 'gold',
    [ORDER_STATUS.CANCELED]: 'red',
    [ORDER_STATUS.PREPARING]: 'blue',
    [ORDER_STATUS.DELIVERING]: 'cyan',
    [ORDER_STATUS.DONE]: 'green',
}

const formatAmount = (value?: number, locale?: string) =>
    new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        maximumFractionDigits: 2,
    }).format(value || 0)

const generateOrderCode = () => `ORD-${dayjs().format('YYYYMMDDHHmmss')}`

const normalizeOrderValues = (raw: OrderFormValues): CreateOrderPayload => ({
    orderCode: raw.orderCode,
    customerId: raw.customerId ? Number(raw.customerId) : undefined,
    customerName: raw.customerName,
    customerEmail: raw.customerEmail,
    customerPhone: raw.customerPhone,
    customerAddress: raw.customerAddress,
    customerPayment: Number(raw.customerPayment || 0),
    paymentMethodId: Number(raw.paymentMethodId),
    vatValue: Number(raw.vatValue || 0),
    discountValue:
        raw.discountValue === undefined || raw.discountValue === ''
            ? undefined
            : Number(raw.discountValue),
    totalAmount: Number(raw.totalAmount || 0),
    toPayAmount: Number(raw.toPayAmount || 0),
    status: raw.status || ORDER_STATUS.PENDING,
    deliveryId: raw.deliveryId ? Number(raw.deliveryId) : undefined,
    warehouseId: Number(raw.warehouseId),
    deliveryPerson: raw.deliveryPerson || undefined,
    deliveryPhone: raw.deliveryPhone || undefined,
    paidAmount:
        raw.paidAmount === undefined || raw.paidAmount === ''
            ? undefined
            : Number(raw.paidAmount),
    products: (raw.products || []).map((item) => ({
        productId: Number(item.productId),
        unitId: Number(item.unitId),
        quantity: Number(item.quantity),
        sellPrice: Number(item.sellPrice || 0),
        extraPrice:
            item.extraPrice === undefined || item.extraPrice === ''
                ? undefined
                : Number(item.extraPrice),
        vatPercent: Number(item.vatPercent || 0),
    })),
})

const SalesManagement = () => {
    const locale = useAppStore((state) => state.locale)
    const account = useAuthStore((state) => state.account)
    const intl = useIntl()
    const t = (id: string, defaultMessage: string) =>
        intl.formatMessage({ id, defaultMessage })

    const [filters, setFilters] = useState<GetOrdersQuery>({
        page: 1,
        limit: 10,
    })
    const [searchValue, setSearchValue] = useState('')
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState<ModalActionMode>('create')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [form] = Form.useForm<OrderFormValues>()

    const { data, isLoading } = useOrderListQuery(filters)
    const { data: customerData } = useCustomerListQuery()
    const { data: deliveryData } = useDeliveryListQuery()
    const { data: paymentMethodData } = usePaymentMethodListQuery()
    const { data: productData } = useProductListQuery({ page: 1, limit: 100 })

    const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation()
    const { mutateAsync: updateOrder, isPending: isUpdating } = useUpdateOrderMutation()
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrderMutation()

    const customers = customerData?.data || []
    const deliveries = deliveryData?.data || []
    const paymentMethods = (paymentMethodData?.data || []).filter((item) => item.isActive)
    const products = (productData?.data?.items || []).filter((item) => item.isActive)
    const orderData = data?.data
    const orderList = orderData?.items || []
    const pagination = orderData?.pagination

    const orderStatusOptions = Object.values(ORDER_STATUS).map((status) => ({
        label: t(`order.status.${status.toLowerCase()}`, status),
        value: status,
    }))

    const watchedProducts = Form.useWatch('products', form) || []
    const watchedDiscountValue = Form.useWatch('discountValue', form)

    const subtotal = watchedProducts.reduce((sum: number, item: OrderLineFormValue) => {
        const quantity = Number(item?.quantity || 0)
        const sellPrice = Number(item?.sellPrice || 0)
        const extraPrice = Number(item?.extraPrice || 0)
        return sum + (sellPrice + extraPrice) * quantity
    }, 0)

    const vatValue = watchedProducts.reduce((sum: number, item: OrderLineFormValue) => {
        const quantity = Number(item?.quantity || 0)
        const sellPrice = Number(item?.sellPrice || 0)
        const extraPrice = Number(item?.extraPrice || 0)
        const vatPercent = Number(item?.vatPercent || 0)
        return sum + ((sellPrice + extraPrice) * quantity * vatPercent) / 100
    }, 0)

    const discountValue = Number(watchedDiscountValue || 0)
    const toPayAmount = Math.max(subtotal + vatValue - discountValue, 0)

    useEffect(() => {
        form.setFieldsValue({
            totalAmount: Number(subtotal.toFixed(2)),
            vatValue: Number(vatValue.toFixed(2)),
            toPayAmount: Number(toPayAmount.toFixed(2)),
        })
    }, [form, subtotal, vatValue, toPayAmount])

    if (isLoading) return <Spin fullscreen />

    const getProductById = (productId?: number | string) =>
        products.find((item) => item.id === Number(productId))

    const getUnitByProduct = (productId?: number | string, unitId?: number | string) =>
        getProductById(productId)?.units.find((item) => item.unitId === Number(unitId))

    const handleChangeMode = (nextMode: ModalActionMode, order?: Order) => {
        setMode(nextMode)

        switch (nextMode) {
            case 'create':
                form.resetFields()
                form.setFieldsValue({
                    orderCode: generateOrderCode(),
                    status: ORDER_STATUS.PENDING,
                    warehouseId: account?.warehouseId ?? undefined,
                    discountValue: 0,
                    customerPayment: 0,
                    paidAmount: 0,
                    products: [{ quantity: 1, extraPrice: 0, vatPercent: 0 }],
                })
                break
            case 'edit':
                if (order) {
                    form.setFieldsValue({
                        orderCode: order.orderCode,
                        customerId: order.customerId ?? undefined,
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        customerPhone: order.customerPhone,
                        customerAddress: order.customerAddress,
                        customerPayment: order.customerPayment,
                        paymentMethodId: order.paymentMethodId,
                        vatValue: order.vatValue,
                        discountValue: order.discountValue ?? 0,
                        totalAmount: order.totalAmount,
                        toPayAmount: order.toPayAmount,
                        status: order.status,
                        deliveryId: order.deliveryId ?? undefined,
                        warehouseId: order.warehouseId,
                        deliveryPerson: order.deliveryPerson ?? undefined,
                        deliveryPhone: order.deliveryPhone ?? undefined,
                        paidAmount: order.paidAmount ?? 0,
                        products: order.products.map((item) => ({
                            productId: item.productId,
                            unitId: item.unitId,
                            quantity: item.quantity,
                            sellPrice: item.sellPrice,
                            extraPrice: item.extraPrice,
                            vatPercent: item.vatPercent,
                        })),
                    })
                    setSelectedOrder(order)
                }
                break
            case 'delete':
                if (order) setSelectedOrder(order)
                break
        }

        setOpen(true)
    }

    const handleClose = () => {
        form.resetFields()
        setSelectedOrder(null)
        setMode('create')
        setOpen(false)
    }

    const handleSubmit = async () => {
        try {
            if (mode === 'delete') {
                await deleteOrder(selectedOrder!.id)
                handleClose()
                return
            }

            const values = await form.validateFields()
            const payload = normalizeOrderValues(values)

            if (mode === 'create') {
                await createOrder(payload)
            } else {
                await updateOrder({
                    id: selectedOrder!.id,
                    data: payload,
                })
            }

            handleClose()
        } catch (error) {
            console.error('Order action failed:', error)
        }
    }

    const handleCustomerChange = (customerId?: number) => {
        const selectedCustomer = customers.find((item) => item.id === customerId)

        if (!selectedCustomer) return

        form.setFieldsValue({
            customerName: selectedCustomer.name,
            customerEmail: selectedCustomer.email || '',
            customerPhone: selectedCustomer.phone || '',
            customerAddress: selectedCustomer.address || '',
        })
    }

    const handleDeliveryChange = (deliveryId?: number) => {
        const selectedDelivery = deliveries.find((item) => item.id === deliveryId)

        if (!selectedDelivery) return

        form.setFieldsValue({
            deliveryPerson: selectedDelivery.name,
            deliveryPhone: selectedDelivery.phone || '',
        })
    }

    const handleProductChange = (index: number, productId?: number) => {
        const product = getProductById(productId)
        const firstUnit = product?.units[0]

        form.setFieldValue(['products', index, 'unitId'], firstUnit?.unitId)
        form.setFieldValue(['products', index, 'sellPrice'], firstUnit?.sellPrice ?? 0)
        form.setFieldValue(['products', index, 'extraPrice'], 0)
        form.setFieldValue(['products', index, 'vatPercent'], firstUnit?.vatPercent ?? 0)
    }

    const handleUnitChange = (index: number, unitId?: number) => {
        const productId = form.getFieldValue(['products', index, 'productId'])
        const unit = getUnitByProduct(productId, unitId)

        form.setFieldValue(['products', index, 'sellPrice'], unit?.sellPrice ?? 0)
        form.setFieldValue(['products', index, 'extraPrice'], 0)
        form.setFieldValue(['products', index, 'vatPercent'], unit?.vatPercent ?? 0)
    }

    const columns: ColumnType<Order>[] = [
        {
            title: (
                <FormattedMessage
                    id="table.column.order-code"
                    defaultMessage="Order Code"
                />
            ),
            dataIndex: 'orderCode',
            render: (_, record) => (
                <Button type="link" className="px-0" onClick={() => handleChangeMode('edit', record)}>
                    {record.orderCode}
                </Button>
            ),
        },
        {
            title: <FormattedMessage id="table.column.customer" />,
            dataIndex: 'customerName',
        },
        {
            title: (
                <FormattedMessage id="table.column.payment" defaultMessage="Payment" />
            ),
            render: (_, record) => record.paymentMethod?.name || '--',
        },
        {
            title: (
                <FormattedMessage id="table.column.status" defaultMessage="Status" />
            ),
            dataIndex: 'status',
            render: (value: ORDER_STATUS) => (
                <Tag color={statusColorMap[value]}>
                    {t(`order.status.${value.toLowerCase()}`, value)}
                </Tag>
            ),
        },
        {
            title: (
                <FormattedMessage id="table.column.total" defaultMessage="Total" />
            ),
            dataIndex: 'totalAmount',
            render: (value: number) => formatAmount(value, locale),
        },
        {
            title: (
                <FormattedMessage id="table.column.to-pay" defaultMessage="To Pay" />
            ),
            dataIndex: 'toPayAmount',
            render: (value: number) => formatAmount(value, locale),
        },
        {
            title: <FormattedMessage id="table.column.created-at" />,
            dataIndex: 'createdAt',
            render: (value: string) =>
                value
                    ? dayjs(value).locale(locale).format(DATE_FORMAT_BY_LOCALE[locale])
                    : '--',
        },
        {
            title: '',
            render: (_, record) => (
                <Button
                    type="primary"
                    className="bg-red-3"
                    onClick={() => handleChangeMode('delete', record)}
                >
                    <IconTrash height={18} width={18} />
                </Button>
            ),
        },
    ]

    return (
        <Flex vertical gap={12}>
            <Flex justify="space-between" gap={12} wrap>
                <Flex gap={12} wrap style={{ flex: 1 }}>
                    <Input.Search
                        allowClear
                        value={searchValue}
                        placeholder={intl.formatMessage({
                            id: 'management.sales.filter.search-placeholder',
                            defaultMessage: 'Search by order code, customer, or phone',
                        })}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onSearch={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                page: 1,
                                search: value || undefined,
                            }))
                        }
                        style={{ width: 320, maxWidth: '100%' }}
                    />
                    <Select
                        allowClear
                        value={filters.status}
                        placeholder={intl.formatMessage({
                            id: 'management.sales.filter.status-placeholder',
                            defaultMessage: 'Filter status',
                        })}
                        options={orderStatusOptions}
                        onChange={(value) =>
                            setFilters((prev) => ({
                                ...prev,
                                page: 1,
                                status: value,
                            }))
                        }
                        style={{ width: 180 }}
                    />
                </Flex>

                <Button type="primary" onClick={() => handleChangeMode('create')}>
                    <IconPlus width={16} color="var(--color-neutral-0)" />
                    <FormattedMessage
                        id="management.sales.btn.create-order"
                        defaultMessage="Create Order"
                    />
                </Button>
            </Flex>

            <Table<Order>
                rowKey="id"
                columns={columns}
                dataSource={orderList}
                pagination={{
                    current: pagination?.page || 1,
                    pageSize: pagination?.limit || 10,
                    total: pagination?.total || 0,
                    hideOnSinglePage: false,
                    onChange: (page, pageSize) =>
                        setFilters((prev) => ({
                            ...prev,
                            page,
                            limit: pageSize,
                        })),
                }}
                showSorterTooltip={false}
            />

            <Modal
                open={open}
                width={1100}
                title={
                    mode === 'delete' ? (
                        <FormattedMessage
                            id="management.sales.modal.title.delete-order"
                            defaultMessage="Delete Order"
                        />
                    ) : (
                        <FormattedMessage
                            id={`management.sales.modal.title.${mode}-order`}
                            defaultMessage={mode === 'create' ? 'Create Order' : 'Edit Order'}
                        />
                    )
                }
                onCancel={handleClose}
                onOk={handleSubmit}
                okText={
                    <FormattedMessage
                        id={`management.sales.modal.btn.${mode}`}
                        defaultMessage={mode === 'create' ? 'Create' : mode === 'edit' ? 'Update' : 'Delete'}
                    />
                }
                okButtonProps={{
                    className: mode === 'delete' ? 'bg-red-3' : 'bg-main-primary',
                    loading: isCreating || isUpdating || isDeleting,
                }}
                cancelText={
                    <FormattedMessage
                        id="management.sales.modal.btn.cancel"
                        defaultMessage="Cancel"
                    />
                }
            >
                {mode === 'delete' ? (
                    <Flex vertical justify="center" align="center" className="p-24 border-red-4 border-2 rounded-12">
                        <FormattedMessage
                            id="management.sales.modal.confirm-delete"
                            defaultMessage="Are you sure you want to delete this order?"
                        />
                        <Typography.Text strong className="mx-4">
                            {selectedOrder?.orderCode}
                        </Typography.Text>
                    </Flex>
                ) : (
                    <Form form={form} layout="vertical" preserve={false}>
                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.order-code"
                                            defaultMessage="Order Code"
                                        />
                                    }
                                    name="orderCode"
                                    normalize={normalizeSpace}
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.order-code-is-required"
                                                    defaultMessage="Order code is required"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.status"
                                            defaultMessage="Status"
                                        />
                                    }
                                    name="status"
                                    initialValue={ORDER_STATUS.PENDING}
                                >
                                    <Select options={orderStatusOptions} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.customer"
                                            defaultMessage="Customer"
                                        />
                                    }
                                    name="customerId"
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={customers.map((item) => ({
                                            label: `${item.name} (${item.phone || item.email || t('management.sales.form.default.no-contact', 'No contact')})`,
                                            value: item.id,
                                        }))}
                                        placeholder={t('management.sales.form.placeholder.select-customer', 'Select customer')}
                                        onChange={handleCustomerChange}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.payment-method"
                                            defaultMessage="Payment Method"
                                        />
                                    }
                                    name="paymentMethodId"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.payment-method-is-required"
                                                    defaultMessage="Payment method is required"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Select
                                        options={paymentMethods.map((item) => ({
                                            label: item.name,
                                            value: item.id,
                                        }))}
                                        placeholder={t('management.sales.form.placeholder.select-payment-method', 'Select payment method')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.customer-name"
                                            defaultMessage="Customer Name"
                                        />
                                    }
                                    name="customerName"
                                    normalize={normalizeSpace}
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.customer-name-is-required"
                                                    defaultMessage="Customer name is required"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.customer-email"
                                            defaultMessage="Customer Email"
                                        />
                                    }
                                    name="customerEmail"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.customer-email-is-required"
                                                    defaultMessage="Customer email is required"
                                                />
                                            ),
                                        },
                                        {
                                            type: 'email',
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.customer-email-invalid"
                                                    defaultMessage="Invalid email address"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.customer-phone"
                                            defaultMessage="Customer Phone"
                                        />
                                    }
                                    name="customerPhone"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.customer-phone-is-required"
                                                    defaultMessage="Customer phone is required"
                                                />
                                            ),
                                        },
                                        {
                                            pattern: /^(03|05|07|08|09)\d{8}$/,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.customer-phone-invalid-vn"
                                                    defaultMessage="Customer phone must be a valid VN number"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.warehouse-id"
                                            defaultMessage="Warehouse ID"
                                        />
                                    }
                                    name="warehouseId"
                                    rules={[
                                        {
                                            required: true,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.warehouse-id-is-required"
                                                    defaultMessage="Warehouse ID is required"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <InputNumber min={1} className="w-full" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label={
                                <FormattedMessage
                                    id="management.sales.form.label.customer-address"
                                    defaultMessage="Customer Address"
                                />
                            }
                            name="customerAddress"
                            normalize={normalizeSpace}
                            rules={[
                                {
                                    required: true,
                                    message: (
                                        <FormattedMessage
                                            id="message.sales.customer-address-is-required"
                                            defaultMessage="Customer address is required"
                                        />
                                    ),
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Row gutter={12}>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.delivery-provider"
                                            defaultMessage="Delivery Provider"
                                        />
                                    }
                                    name="deliveryId"
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        optionFilterProp="label"
                                        options={deliveries.map((item) => ({
                                            label: item.name,
                                            value: item.id,
                                        }))}
                                        placeholder={t('management.sales.form.placeholder.select-delivery-provider', 'Select delivery provider')}
                                        onChange={handleDeliveryChange}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.delivery-person"
                                            defaultMessage="Delivery Person"
                                        />
                                    }
                                    name="deliveryPerson"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.delivery-phone"
                                            defaultMessage="Delivery Phone"
                                        />
                                    }
                                    name="deliveryPhone"
                                    rules={[
                                        {
                                            pattern: /^(03|05|07|08|09)\d{8}$/,
                                            message: (
                                                <FormattedMessage
                                                    id="message.sales.delivery-phone-invalid-vn"
                                                    defaultMessage="Delivery phone must be a valid VN number"
                                                />
                                            ),
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.List
                            name="products"
                            rules={[
                                {
                                    validator: async (_, value) => {
                                        if (!value || value.length < 1) {
                                            throw new Error(
                                                t(
                                                    'message.sales.at-least-one-product',
                                                    'At least one product is required'
                                                )
                                            )
                                        }
                                    },
                                },
                            ]}
                        >
                            {(fields, { add, remove }, { errors }) => (
                                <Flex vertical gap={12}>
                                    <Flex justify="space-between" align="center">
                                        <Typography.Title level={5} className="m-0">
                                            <FormattedMessage
                                                id="management.sales.form.label.order-items"
                                                defaultMessage="Order Items"
                                            />
                                        </Typography.Title>
                                        <Button onClick={() => add({ quantity: 1, extraPrice: 0, vatPercent: 0 })}>
                                            {t('management.sales.form.btn.add-item', 'Add Item')}
                                        </Button>
                                    </Flex>

                                    {fields.map((field) => {
                                        const productId = form.getFieldValue(['products', field.name, 'productId'])
                                        const currentProduct = getProductById(productId)
                                        const unitOptions = (currentProduct?.units || []).map((unit) => ({
                                            label: unit.unit?.name || `Unit ${unit.unitId}`,
                                            value: unit.unitId,
                                        }))
                                        const selectedUnit = getUnitByProduct(
                                            productId,
                                            form.getFieldValue(['products', field.name, 'unitId'])
                                        )

                                        return (
                                            <Flex
                                                key={field.key}
                                                vertical
                                                gap={12}
                                                className="border-1 border-neutral-4 rounded-12 p-12"
                                            >
                                                <Flex justify="space-between" align="center">
                                                    <Typography.Text strong>
                                                        {intl.formatMessage(
                                                            {
                                                                id: 'management.sales.form.order-item',
                                                                defaultMessage: 'Item #{index}',
                                                            },
                                                            { index: field.name + 1 }
                                                        )}
                                                    </Typography.Text>
                                                    <Button danger onClick={() => remove(field.name)}>
                                                        <IconTrash width={18} height={18} />
                                                    </Button>
                                                </Flex>

                                                <Row gutter={12}>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.product"
                                                                    defaultMessage="Product"
                                                                />
                                                            }
                                                            name={[field.name, 'productId']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: (
                                                                        <FormattedMessage
                                                                            id="message.sales.product-required"
                                                                            defaultMessage="Product is required"
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                showSearch
                                                                optionFilterProp="label"
                                                                options={products.map((item) => ({
                                                                    label: item.name,
                                                                    value: item.id,
                                                                }))}
                                                                placeholder={t('management.sales.form.placeholder.select-product', 'Select product')}
                                                                onChange={(value) => handleProductChange(field.name, value)}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.unit"
                                                                    defaultMessage="Unit"
                                                                />
                                                            }
                                                            name={[field.name, 'unitId']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: (
                                                                        <FormattedMessage
                                                                            id="message.sales.unit-required"
                                                                            defaultMessage="Unit is required"
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                options={unitOptions}
                                                                placeholder={t('management.sales.form.placeholder.select-unit', 'Select unit')}
                                                                onChange={(value) => handleUnitChange(field.name, value)}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                <Row gutter={12}>
                                                    <Col xs={24} md={6}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.quantity"
                                                                    defaultMessage="Quantity"
                                                                />
                                                            }
                                                            name={[field.name, 'quantity']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: (
                                                                        <FormattedMessage
                                                                            id="message.sales.quantity-is-required"
                                                                            defaultMessage="Quantity is required"
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <InputNumber min={1} className="w-full" />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={6}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.sell-price"
                                                                    defaultMessage="Sell Price"
                                                                />
                                                            }
                                                            name={[field.name, 'sellPrice']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: (
                                                                        <FormattedMessage
                                                                            id="message.sales.sell-price-is-required"
                                                                            defaultMessage="Sell price is required"
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <InputNumber 
                                                                min={0} 
                                                                className="w-full"
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={6}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.extra-price"
                                                                    defaultMessage="Extra Price"
                                                                />
                                                            }
                                                            name={[field.name, 'extraPrice']}
                                                        >
                                                            <InputNumber 
                                                                min={0} 
                                                                className="w-full"
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={24} md={6}>
                                                        <Form.Item
                                                            label={
                                                                <FormattedMessage
                                                                    id="management.sales.form.label.vat-percent"
                                                                    defaultMessage="VAT (%)"
                                                                />
                                                            }
                                                            name={[field.name, 'vatPercent']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: (
                                                                        <FormattedMessage
                                                                            id="message.sales.vat-is-required"
                                                                            defaultMessage="VAT is required"
                                                                        />
                                                                    ),
                                                                },
                                                            ]}
                                                        >
                                                            <InputNumber min={0} max={100} className="w-full" />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>

                                                {selectedUnit?.extraPrices?.length ? (
                                                    <Typography.Text type="secondary">
                                                        {t(
                                                            'management.sales.form.label.available-extra-prices',
                                                            'Available extra prices:'
                                                        )}{' '}
                                                        {selectedUnit.extraPrices
                                                            .map((item) => `${item.label}: ${formatAmount(item.price, locale)}`)
                                                            .join(' | ')}
                                                    </Typography.Text>
                                                ) : null}
                                            </Flex>
                                        )
                                    })}

                                    {errors.length ? (
                                        <Typography.Text type="danger">{errors[0]}</Typography.Text>
                                    ) : null}
                                </Flex>
                            )}
                        </Form.List>

                        <Row gutter={12} className="mt-12">
                            <Col xs={24} md={5}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.subtotal"
                                            defaultMessage="Subtotal"
                                        />
                                    }
                                    name="totalAmount"
                                >
                                    <InputNumber 
                                        min={0} 
                                        className="w-full" 
                                        readOnly
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.vat-value"
                                            defaultMessage="VAT Value"
                                        />
                                    }
                                    name="vatValue"
                                >
                                    <InputNumber 
                                        min={0} 
                                        className="w-full" 
                                        readOnly
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.discount"
                                            defaultMessage="Discount"
                                        />
                                    }
                                    name="discountValue"
                                >
                                    <InputNumber 
                                        min={0} 
                                        className="w-full"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={5}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.paid-amount"
                                            defaultMessage="Paid Amount"
                                        />
                                    }
                                    name="paidAmount"
                                >
                                    <InputNumber 
                                        min={0} 
                                        className="w-full"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={4}>
                                <Form.Item
                                    label={
                                        <FormattedMessage
                                            id="management.sales.form.label.to-pay"
                                            defaultMessage="To Pay"
                                        />
                                    }
                                    name="toPayAmount"
                                >
                                    <InputNumber 
                                        min={0} 
                                        className="w-full" 
                                        readOnly
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Modal>
        </Flex>
    )
}

export default SalesManagement
