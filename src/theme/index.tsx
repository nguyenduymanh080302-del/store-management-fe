import type { ThemeConfig } from "antd";
import { color } from "./colors";

export const themeConfig: ThemeConfig = {
    token: {
        colorPrimary: color.primary,
        colorBgBase: color.neutral[0],
        colorText: color.neutral[8],
    },
    components: {
        Layout: {
            padding: 0,
            margin: 0,
            headerBg: color.primary,
            headerColor: color.neutral[2],
            footerBg: color.primary,
        },
        Button: {
            colorPrimary: color.blue[5],
        },
    },
};
