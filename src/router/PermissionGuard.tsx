import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from 'stores/auth.store'
import { PERMISSION } from 'utils/enum'

type Props = {
    permission?: PERMISSION
    children: React.ReactNode
}

export function PermissionGuard({ permission, children }: Props) {
    const { account } = useAuthStore()

    if (!account) {
        return <Navigate to="/auth/login" />
    }

    if (
        permission &&
        !account.role?.permissions?.includes(permission)
    ) {
        return <div>403 - Permission denied</div>
    }

    return <>{children}</>
}

