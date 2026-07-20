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
import { IconPlus, IconTrash } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import dayjs from 'dayjs'
import { useCustomerListQuery } from '@/hooks/useCustomer'
import { useDeliveryListQuery } from '@/hooks/useDelivery'
import {
    useCreateOrderMutation,
    useDeleteOrderMutation,
    useOrderListQuery,
    useUpdateOrderMutation,
} from '@/hooks/useOrder'
import { useProductListQuery } from '@/hooks/useProduct'
import { useWarehouseListQuery } from '@/hooks/useWarehouse'
import { useDebounce } from '@/hooks/useDebounce'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useAppStore } from '@/stores/app.store'
import { DATE_FORMAT_BY_LOCALE } from '@/utils/constant'
import { ORDER_STATUS } from '@/utils/enum'
import { normalizeSpace } from '@/utils/hepler'

type OrderLineFormValue = {
    warehouseId?: number | string
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
    | 'deliveryId'
    | 'discountValue'
    | 'paidAmount'
    | 'products'
> & {
    customerId?: number | string
    deliveryId?: number | string
    discountValue?: number | string
    paidAmount?: number | string
    products?: OrderLineFormValue[]
}

const statusColorMap: Record<ORDER_STATUS, string> = {
    [ORDER_STATUS.PENDING]: 'gold',
    [ORDER_STATUS.CANCELED]: 'red',
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
    vatValue: Number(raw.vatValue || 0),
    discountValue:
        raw.discountValue === undefined || raw.discountValue === ''
            ? undefined
            : Number(raw.discountValue),
    totalAmount: Number(raw.totalAmount || 0),
    status: raw.status || ORDER_STATUS.PENDING,
    deliveryId: raw.deliveryId ? Number(raw.deliveryId) : undefined,
    deliveryPerson: raw.deliveryPerson || undefined,
    deliveryPhone: raw.deliveryPhone || undefined,
    paidAmount:
        raw.paidAmount === undefined || raw.paidAmount === ''
            ? undefined
            : Number(raw.paidAmount),
    products: (raw.products || []).map((item) => ({
        warehouseId: Number(item.warehouseId),
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

    // Product search popup state
    const [productSearchOpen, setProductSearchOpen] = useState(false)
    const [currentProductField, setCurrentProductField] = useState<number | null>(null)
    const [productSearchValue, setProductSearchValue] = useState('')
    const debouncedProductSearch = useDebounce(productSearchValue, 500)
    const { data, isLoading } = useOrderListQuery(filters)
    const { data: customerData } = useCustomerListQuery()
    const { data: deliveryData } = useDeliveryListQuery()
    const { data: warehouseData, isLoading: isWarehousesLoading } = useWarehouseListQuery()
    const { data: productData } = useProductListQuery({ page: 1, limit: 100 })
    const { data: productSearchData, isLoading: isProductSearchLoading } = useProductListQuery({
        page: 1,
        limit: 20,
        search: debouncedProductSearch.trim() || undefined,
    })

    const { mutateAsync: createOrder, isPending: isCreating } = useCreateOrderMutation()
    const { mutateAsync: updateOrder, isPending: isUpdating } = useUpdateOrderMutation()
    const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrderMutation()

    const customers = customerData?.data || []
    const deliveries = deliveryData?.data || []
    const warehouses = warehouseData?.data || []
    // const paymentMethods = (paymentMethodData?.data || []).filter((item) => item.isActive)
    const products = (productData?.data?.items || []).filter((item) => item.isActive)
    const searchProducts = (productSearchData?.data?.items || []).filter((item) => item.isActive)
    const orderData = data?.data
    const orderList = orderData?.items || []
    const pagination = orderData?.pagination

    const orderStatusOptions = Object.values(ORDER_STATUS).map((status) => ({
        label: t(`order.status.${status.toLowerCase()}`, status),
        value: status,
    }))

    const watchedProducts = Form.useWatch('products', form) || []

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

    useEffect(() => {
        form.setFieldsValue({
            totalAmount: Number(subtotal.toFixed(2)),
            vatValue: Number(vatValue.toFixed(2)),
        })
    }, [form, subtotal, vatValue])

    // Debounce product search
    if (isLoading) return <Spin fullscreen />

    const getProductById = (productId?: number | string) =>
        products.find((item) => item.id === Number(productId))

    const getUnitByProduct = (productId?: number | string, unitId?: number | string) =>
        getProductById(productId)?.units.find((item) => item.unitId === Number(unitId))

    // Product search popup handlers
    const handleOpenProductSearch = (fieldName: number) => {
        setCurrentProductField(fieldName)
        const productId = form.getFieldValue(['products', fieldName, 'productId'])
        const currentProduct = getProductById(productId)
        setProductSearchValue(currentProduct?.name || '')
        setProductSearchOpen(true)
    }

    const handleCloseProductSearch = () => {
        setProductSearchOpen(false)
        setCurrentProductField(null)
        setProductSearchValue('')
    }

    const handleSelectProduct = (product: Product) => {
        if (currentProductField !== null) {
            handleProductChange(currentProductField, product.id)
            form.setFieldValue(['products', currentProductField, 'productId'], product.id)
        }
        handleCloseProductSearch()
    }

    const handleChangeMode = (nextMode: ModalActionMode, order?: Order) => {
        setMode(nextMode)

        switch (nextMode) {
            case 'create':
                form.resetFields()
                form.setFieldsValue({
                    orderCode: generateOrderCode(),
                    status: ORDER_STATUS.PENDING,
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
                        vatValue: order.vatValue,
                        discountValue: order.discountValue ?? 0,
                        totalAmount: order.totalAmount,
                        status: order.status,
                        deliveryId: order.deliveryId ?? undefined,
                        deliveryPerson: order.deliveryPerson ?? undefined,
                        deliveryPhone: order.deliveryPhone ?? undefined,
                        paidAmount: order.paidAmount ?? 0,
                        products: order.products.map((item) => ({
                            warehouseId: item.warehouseId ?? undefined,
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
        form.setFieldValue(['products', index, 'warehouseId'], undefined)
        form.setFieldValue(['products', index, 'sellPrice'], firstUnit?.sellPrice ?? 0)
        form.setFieldValue(['products', index, 'extraPrice'], 0)
        form.setFieldValue(['products', index, 'vatPercent'], firstUnit?.vatPercent ?? 0)
    }

    const handleUnitChange = (index: number, unitId?: number) => {
        const productId = form.getFieldValue(['products', index, 'productId'])
        const unit = getUnitByProduct(productId, unitId)

        form.setFieldValue(['products', index, 'warehouseId'], undefined)
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
                            <Col xs={12} md={12} lg={8}>
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
                            <Col xs={12} md={12} lg={8}>
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
                            <Col xs={24} md={8} lg={8}>
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
                            <Col xs={12} md={8} lg={6}>
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
                            <Col xs={12} md={8} lg={6}>
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
                            <Col xs={12} md={10} lg={6}>
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
                            </Col>
                            <Col xs={12} md={7} lg={6}>
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
                                            required: false,
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
                                        options={deliveries.map((item) => ({
                                            label: item.name,
                                            value: item.id,
                                        }))}
                                        placeholder={t('management.sales.form.placeholder.select-delivery-provider', 'Select delivery provider')}
                                        onChange={handleDeliveryChange}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={12} md={8}>
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
                            <Col xs={12} md={8}>
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
                                        const selectedUnitId = form.getFieldValue(['products', field.name, 'unitId'])
                                        const warehouseOptions = warehouses
                                            .map((warehouse) => {
                                                const quantity = warehouse.products?.find(
                                                    (stock) => stock.productId === Number(productId) && stock.unitId === Number(selectedUnitId)
                                                )?.quantity || 0

                                                return { label: `${warehouse.name} (${quantity} remaining)`, value: warehouse.id, quantity }
                                            })
                                            .filter((warehouse) => warehouse.quantity > 0)

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
                                                            <Flex
                                                                onClick={() => handleOpenProductSearch(field.name)}
                                                                className="border-1 border-neutral-4 rounded-8 p-12 cursor-pointer hover:border-main-primary"
                                                                align="center"
                                                                gap={12}
                                                            >
                                                                {currentProduct ? (
                                                                    <>
                                                                        {currentProduct.images?.[0]?.url && (
                                                                            <img
                                                                                src={currentProduct.images[0].url}
                                                                                alt={currentProduct.name}
                                                                                style={{
                                                                                    width: 60,
                                                                                    height: 60,
                                                                                    objectFit: 'cover',
                                                                                    borderRadius: 8,
                                                                                }}
                                                                            />
                                                                        )}
                                                                        <Typography.Text strong>
                                                                            {currentProduct.name}
                                                                        </Typography.Text>
                                                                    </>
                                                                ) : (
                                                                    <Typography.Text type="secondary">
                                                                        {t('management.sales.form.placeholder.select-product', 'Click to select product')}
                                                                    </Typography.Text>
                                                                )}
                                                            </Flex>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={12} md={12}>
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
                                                    <Col xs={12} md={12}>
                                                        <Form.Item
                                                            label={<FormattedMessage id="management.sales.form.label.warehouse-id" defaultMessage="Warehouse" />}
                                                            name={[field.name, 'warehouseId']}
                                                            rules={[
                                                                {
                                                                    required: true,
                                                                    message: <FormattedMessage id="message.sales.warehouse-id-is-required" defaultMessage="Warehouse is required" />,
                                                                },
                                                            ]}
                                                        >
                                                            <Select
                                                                showSearch
                                                                loading={isWarehousesLoading}
                                                                optionFilterProp="label"
                                                                options={warehouseOptions}
                                                                placeholder={t('management.sales.form.placeholder.select-warehouse', 'Select warehouse')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col xs={10} md={6}>
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
                                                    <Col xs={14} md={6}>
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
                                                                parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
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
                                                                parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
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

                                                <Row gutter={12}>

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
                                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
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
                                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
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
                                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
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
                                        parser={(value) => Number(value!.replace(/\$\s?|,/g, '')) as never}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Modal>

            {/* Product Search Modal */}
            <Modal
                open={productSearchOpen}
                title={<FormattedMessage id="management.sales.form.label.select-product" defaultMessage="Select Product" />}
                onCancel={handleCloseProductSearch}
                footer={null}
                width={700}
            >
                <Flex vertical gap={12}>
                    <Input.Search
                        allowClear
                        value={productSearchValue}
                        placeholder={intl.formatMessage({
                            id: 'management.sales.form.placeholder.search-product',
                            defaultMessage: 'Search product by name...',
                        })}
                        onChange={(e) => setProductSearchValue(e.target.value)}
                        onSearch={(value) => setProductSearchValue(value)}
                        size="large"
                    />

                    {productSearchValue.length < 2 ? (
                        <Flex justify="center" align="center" className="p-24">
                            <Typography.Text type="secondary">
                                {intl.formatMessage({
                                    id: 'management.sales.form.message.search-hint',
                                    defaultMessage: 'Enter at least 2 characters to search',
                                })}
                            </Typography.Text>
                        </Flex>
                    ) : (
                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {isProductSearchLoading ? (
                                <Flex justify="center" align="center" className="p-24">
                                    <Spin />
                                </Flex>
                            ) : searchProducts.length === 0 ? (
                                <Flex justify="center" align="center" className="p-24">
                                    <Typography.Text type="secondary">
                                        {intl.formatMessage({
                                            id: 'management.sales.form.message.no-products',
                                            defaultMessage: 'No products found',
                                        })}
                                    </Typography.Text>
                                </Flex>
                            ) : (
                                <Flex vertical gap={8}>
                                    {searchProducts.map((product) => (
                                        <Flex
                                            key={product.id}
                                            onClick={() => handleSelectProduct(product)}
                                            className="border-1 border-neutral-4 rounded-12 p-12 cursor-pointer hover:border-main-primary"
                                            align="center"
                                            gap={12}
                                        >
                                            {product.images?.[0]?.url ? (
                                                <img
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    style={{
                                                        width: 120,
                                                        height: 120,
                                                        objectFit: 'cover',
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: 120,
                                                        height: 120,
                                                        backgroundColor: '#f5f5f5',
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <Typography.Text type="secondary">No Image</Typography.Text>
                                                </div>
                                            )}
                                            <Flex vertical gap={4} style={{ flex: 1 }}>
                                                <Typography.Text strong style={{ fontSize: 16 }}>
                                                    {product.name}
                                                </Typography.Text>
                                                <Typography.Text type="secondary">
                                                    {product.category?.name}
                                                </Typography.Text>
                                            </Flex>
                                        </Flex>
                                    ))}
                                </Flex>
                            )}
                        </div>
                    )}
                </Flex>
            </Modal>
        </Flex>
    )
}

export default SalesManagement
