type AppRoute = {
    path: string
    element: React.ReactNode
    permission?: PERMISSION
    isAuth?: boolean
}

type ManagementMenuItem = {
    key: string
    labelId: string
    icon?: React.ReactNode
    permission: PERMISSION
    children?: ManagementMenuItem[]
}