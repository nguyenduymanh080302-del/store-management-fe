// src/layouts/AuthLayout.tsx
import { Outlet } from "@tanstack/react-router";
import { Flex, Image, Layout, Typography } from "antd";
import auth_layout_bg from "assets/images/auth-layout-bg.png";
import logo from "assets/images/logo.png";
import SelectLanguage from "components/Select/SelectLanguage";
import "./AuthLayout.scss";

const { Header, Content, Footer } = Layout;

const AuthLayout = () => {

    return (
        <Layout className="h-screen flex flex-col">

            {/* HEADER */}
            <Header className="flex items-center justify-between py-12">
                <Flex align="center" justify="space-between" gap={24}>
                    <Image src={logo} alt="Logo" height={60} preview={false} />
                    <Typography.Title level={3} className="text-neutral-0 m-0">
                        Store Management
                    </Typography.Title>
                </Flex>
                <SelectLanguage />
            </Header>

            {/* CONTENT */}
            <Content className="flex justify-center items-center auth-layout-bg "
                style={{ backgroundImage: `url(${auth_layout_bg})` }}
            >
                <div className="auth-content px-24">
                    <Outlet />
                </div>
            </Content>

            {/* FOOTER */}
            <Footer className="text-center">
                © {new Date().getFullYear()} Your Company
            </Footer>
        </Layout>
    );
};

export default AuthLayout;
