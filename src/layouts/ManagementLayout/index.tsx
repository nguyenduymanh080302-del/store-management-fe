import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Flex, Image, Layout, Menu, MenuProps, Typography } from "antd";
import logo from "assets/images/logo.png";
import DropdownSetting from "components/Dropdown/DropdownSetting";
import SelectLanguage from "components/Select/SelectLanguage";
import { managementMenu } from "components/managmentMenu";
import { FormattedMessage } from "react-intl";
import { useAuthStore } from "stores/auth.store";
const { Sider, Header, Content, Footer } = Layout;

const ManagementLayout = () => {

    const navigate = useNavigate()
    const pathname = useRouterState().location.pathname

    const permissions = useAuthStore(state => state.account?.role?.permissions)

    const buildMenuItems = (menus = managementMenu): MenuProps["items"] => {
        if (!permissions) return []

        return menus.filter(menu => permissions.includes(menu.permission))
            .map(menu => ({
                key: menu.key,
                icon: menu.icon,
                label: <FormattedMessage id={menu.labelId} />,
                children: menu.children
                    ? buildMenuItems(menu.children)
                    : undefined,
            }))
            .filter(menu => !menu.children || menu.children.length > 0)
    }

    const findOpenKeys = (menus: typeof managementMenu, path: string): string[] => {
        for (const menu of menus) {
            if (menu.children?.some(child => child.key === path)) {
                return [menu.key]
            }
        }
        return []
    }

    const menuTitle = pathname.replace("/", "")
    const selectedKeys = [pathname]
    const openKeys = findOpenKeys(managementMenu, pathname)

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={220} >
                <Image src={logo} preview={false} className="object-cover" />
                <Menu
                    mode="inline"
                    items={buildMenuItems()}
                    selectedKeys={selectedKeys}
                    defaultOpenKeys={openKeys}
                    onClick={({ key }) => navigate({ to: key as string })}
                    className="mt-24"
                />
            </Sider>
            <Layout>
                <Header className="flex flex-row justify-between items-center p-16">
                    <Typography.Title level={5} className="text-neutral-0 m-0">
                        <FormattedMessage id={menuTitle ? `managment.sider.menu.${menuTitle}` : "managment.sider.menu.default"} />
                    </Typography.Title>
                    <Flex align="center" justify="space-between" gap={8}>
                        <SelectLanguage />
                        <DropdownSetting />
                    </Flex>
                </Header>
                <Content className="p-16">
                    <Outlet />
                </Content>
                <Footer className="p-16">© {new Date().getFullYear()}</Footer>
            </Layout>
        </Layout>
    )
}

export default ManagementLayout;
