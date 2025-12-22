import React from 'react'
import { PERMISSION } from 'utils/enum'

const Login = React.lazy(() => import('pages/Login'))
const ForgotPassword = React.lazy(() => import('pages/ForgotPassword'))
const Dashboard = React.lazy(() => import('pages/Dashboard'))
const CategoryManagement = React.lazy(() => import('pages/CategoryManagement'))
const ProductManagement = React.lazy(() => import('pages/ProductManagement'))
const SalesManagement = React.lazy(() => import('pages/SalesManagement'))
const CustomerManagement = React.lazy(() => import('pages/CustomerManagement'))
const DeliveryManagement = React.lazy(() => import('pages/DeliveryManagement'))
const EmployeeManagement = React.lazy(() => import('pages/EmployeeManagement'))
const SupplierManagement = React.lazy(() => import('pages/SupplierManagement'))
const UnitManagement = React.lazy(() => import('pages/UnitManagement'))

export const authRoutes: AppRoute[] = [
    { path: '/login', element: <Login />, isAuth: true },
    { path: '/forgot-password', element: <ForgotPassword />, isAuth: true },
]

export const managementRoutes: AppRoute[] = [
    { path: '/dashboard', element: <Dashboard />, permission: PERMISSION.MANAGE_DASHBOARD },
    { path: '/category', element: <CategoryManagement />, permission: PERMISSION.MANAGE_CONTENT },
    { path: '/product', element: <ProductManagement />, permission: PERMISSION.MANAGE_CONTENT },
    { path: '/sales', element: <SalesManagement />, permission: PERMISSION.MANAGE_SALES },
    { path: '/customer', element: <CustomerManagement />, permission: PERMISSION.MANAGE_SALES },
    { path: '/delivery', element: <DeliveryManagement />, permission: PERMISSION.MANAGE_SALES },
    { path: '/employee', element: <EmployeeManagement />, permission: PERMISSION.MANAGE_EMPLOYEE },
    { path: '/supplier', element: <SupplierManagement />, permission: PERMISSION.MANAGE_CONTENT },
    { path: '/unit', element: <UnitManagement />, permission: PERMISSION.MANAGE_CONTENT },
]
