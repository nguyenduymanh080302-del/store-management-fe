import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Image, Layout, Menu, MenuProps, Typography } from "antd";
import logo from "assets/images/logo.png";
import SelectLanguage from "components/Select/SelectLanguage";
import { managementMenuConfig } from "configs/managmentMenu.config";
import { FormattedMessage } from "react-intl";
import { useAuthStore } from "stores/auth.store";
const { Sider, Header, Content, Footer } = Layout;

const ManagementLayout = () => {

    const navigate = useNavigate()
    const pathname = useRouterState().location.pathname.replace("/", "")

    const permissions = useAuthStore(
        state => state.account?.role?.permissions
    )

    const buildMenuItems = (
        menus = managementMenuConfig,
    ): MenuProps["items"] => {
        if (!permissions) return []

        return menus
            .filter(menu => permissions.includes(menu.permission))
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

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider width={220} >
                <Image src={logo} preview={false} className="object-cover" />
                <Menu
                    mode="inline"
                    items={buildMenuItems()}
                    onClick={({ key }) => navigate({ to: key as string })}
                    className="mt-24"
                />
            </Sider>
            <Layout>
                <Header className="flex flex-row justify-between items-center py-12 px-16">
                    <Typography.Title level={5} className="text-neutral-0 m-0">
                        <FormattedMessage id={pathname ? `managment.sider.menu.${pathname}` : "managment.sider.menu.default"} />
                    </Typography.Title>
                    <SelectLanguage />
                </Header>
                <Content className="p-16">
                    <Outlet />
                </Content>
                <Footer>© {new Date().getFullYear()}</Footer>
            </Layout>
        </Layout>
    )
}


export default ManagementLayout;
