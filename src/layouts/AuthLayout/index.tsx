// src/layouts/AuthLayout.tsx
import { Layout } from "antd";
import { Outlet } from "@tanstack/react-router";

const { Header, Content, Footer } = Layout;

const AuthLayout = () => {
    return (
        <Layout className="min-height-100vh">
            {/* HEADER */}
            <Header >
                Authentication
            </Header>

            {/* CONTENT */}
            <Content>
                <Outlet />
            </Content>

            {/* FOOTER */}
            <Footer>
                © {new Date().getFullYear()} Your Company
            </Footer>
        </Layout>
    );
};

export default AuthLayout;
