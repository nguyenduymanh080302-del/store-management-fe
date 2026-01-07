import {
    createRootRoute,
    createRoute,
    createRouter
} from '@tanstack/react-router'

import AuthLayout from 'layouts/AuthLayout'
import ManagementLayout from 'layouts/ManagementLayout'
import { PermissionGuard } from './PermissionGuard'
import { authRoutes, managementRoutes } from './routeConfig'

const rootRoute = createRootRoute()

/* ---------- Auth Layout ---------- */
const authLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: AuthLayout,
})

const authChildRoutes = authRoutes.map((r) =>
    createRoute({
        getParentRoute: () => authLayoutRoute,
        path: r.path,
        component: () => r.element,
    })
)

/* ---------- Management Layout ---------- */
const managementLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <PermissionGuard>
            <ManagementLayout />
        </PermissionGuard>
    ),
})

const managementChildRoutes = managementRoutes.map((r) =>
    createRoute({
        getParentRoute: () => managementLayoutRoute,
        path: r.path,
        component: () => (
            <PermissionGuard permission={r.permission}>
                <>{r.element}</>
            </PermissionGuard>
        ),
    })
)

const routeTree = rootRoute.addChildren([
    authLayoutRoute.addChildren(authChildRoutes),
    managementLayoutRoute.addChildren(managementChildRoutes),
])

const appRouter = createRouter({ routeTree })
export default appRouter
