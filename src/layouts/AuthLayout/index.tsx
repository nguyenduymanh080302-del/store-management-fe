// src/layouts/AuthLayout.tsx
import { Layout } from "antd";
import { Outlet } from "@tanstack/react-router";
import "./AuthLayout.scss"
import auth_layout_bg from "assets/images/auth-layout-bg.png"

const { Header, Content, Footer } = Layout;

const AuthLayout = () => {
    return (
        <Layout className="h-screen flex flex-col">

            {/* HEADER */}
            <Header className="flex items-center">
                Authentication
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
