import {
    HomeOutlined,
    SettingOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Outlet } from "@tanstack/react-router";

const { Sider, Header, Content, Footer } = Layout;

const ManagementLayout = () => {
    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* SIDEBAR */}
            <Sider
                width={220}
                style={{
                    background: "#1070ff",
                    paddingTop: "20px",
                }}
            >
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={["1"]}
                    items={[
                        { key: "1", icon: <HomeOutlined />, label: "Dashboard" },
                        { key: "2", icon: <UserOutlined />, label: "Users" },
                        { key: "3", icon: <SettingOutlined />, label: "Settings" },
                    ]}
                />
            </Sider>

            {/* RIGHT SIDE: HEADER + CONTENT + FOOTER */}
            <Layout>
                {/* HEADER */}
                <Header
                    style={{
                        background: "#4da3ff",
                        padding: "20px",
                        fontSize: "20px",
                        color: "#fff",
                        textAlign: "center",
                    }}
                >
                    Management Header
                </Header>

                {/* CONTENT */}
                <Content
                    style={{
                        background: "#0d5ce0",
                        padding: "24px",
                        minHeight: "calc(100vh - 160px)",
                        color: "#fff",
                        textAlign: "center",
                    }}
                >
                    <Outlet />
                </Content>

                {/* FOOTER */}
                <Footer
                    style={{
                        background: "#4da3ff",
                        padding: "15px",
                        textAlign: "center",
                        color: "#fff",
                    }}
                >
                    © {new Date().getFullYear()} Your Company
                </Footer>
            </Layout>
        </Layout>
    );
};

export default ManagementLayout;
