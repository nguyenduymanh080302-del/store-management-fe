// managementMenu.config.ts
import { IconAccountSettings, IconContent, IconDashboard, IconSales } from "assets/icons"
import { PERMISSION } from "utils/enum"

export const managementMenuConfig: ManagementMenuItem[] = [
    {
        key: "dashboard",
        icon: <IconDashboard width={20} height={20} fill="var(--color-neutral-0)" />,
        labelId: "managment.sider.menu.dashboard",
        permission: PERMISSION.MANAGE_DASHBOARD,
        children: [
            {
                key: "/dashboard",
                labelId: "managment.sider.menu.dashboard",
                permission: PERMISSION.MANAGE_DASHBOARD,
            },
        ],
    },
    {
        key: "sales",
        icon: <IconSales width={20} height={20} fill="var(--color-neutral-0)" />,
        labelId: "managment.sider.menu.sales-management",
        permission: PERMISSION.MANAGE_SALES,
        children: [
            { key: "/sales", labelId: "managment.sider.menu.sales", permission: PERMISSION.MANAGE_SALES },
            { key: "/customer", labelId: "managment.sider.menu.customer", permission: PERMISSION.MANAGE_SALES },
            { key: "/delivery", labelId: "managment.sider.menu.delivery", permission: PERMISSION.MANAGE_SALES },
        ],
    },
    {
        key: "content",
        icon: <IconContent width={20} height={20} fill="var(--color-neutral-0)" />,
        labelId: "managment.sider.menu.content-management",
        permission: PERMISSION.MANAGE_CONTENT,
        children: [
            { key: "/category", labelId: "managment.sider.menu.category", permission: PERMISSION.MANAGE_CONTENT },
            { key: "/product", labelId: "managment.sider.menu.product", permission: PERMISSION.MANAGE_CONTENT },
            { key: "/supplier", labelId: "managment.sider.menu.supplier", permission: PERMISSION.MANAGE_CONTENT },
            { key: "/unit", labelId: "managment.sider.menu.unit", permission: PERMISSION.MANAGE_CONTENT },
        ],
    },

    {
        key: "account",
        icon: <IconAccountSettings width={20} height={20} fill="var(--color-neutral-0)" />,
        labelId: "managment.sider.menu.account-management",
        permission: PERMISSION.MANAGE_EMPLOYEE,
        children: [
            { key: "/employee", labelId: "managment.sider.menu.employee", permission: PERMISSION.MANAGE_EMPLOYEE },
        ],
    },
]
