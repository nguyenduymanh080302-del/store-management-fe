import type { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
    token: {
        colorPrimary: "#00FFFF",
        colorBgBase: "#FFFFFF",
        colorBgLayout: "#0F0F0F",
        colorText: "#303030",
    },
    components: {
        Layout: {
            padding: 0,
            margin: 0,
            headerBg: "#00FFFF",
            colorBgLayout: "#FFF",
            footerBg: "#00FFFF",
        },
        Button: {
            colorPrimary: "#1677ff",
            borderRadius: 6,
        },
    },
};
