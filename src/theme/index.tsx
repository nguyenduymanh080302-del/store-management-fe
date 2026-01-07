import type { ThemeConfig } from "antd";
import { color } from "./colors";

export const themeConfig: ThemeConfig = {
    token: {
        colorPrimary: color.primary,
        colorText: color.neutral[9],
        colorBgBase: color.neutral[0],
        colorBgLayout: color.neutral[1],

        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 8,
    },

    components: {
        Layout: {
            siderBg: color.cyan[5],
            headerBg: color.primary,
            headerColor: color.neutral[0],
            headerHeight: "auto",
            footerBg: color.primary,
        },

        Menu: {
            itemBg: color.cyan[5],
            itemColor: color.neutral[0],

            itemHoverBg: color.cyan[6],
            itemHoverColor: color.neutral[0],

            itemSelectedBg: color.neutral[2],
            itemSelectedColor: color.cyan[6],

            subMenuItemBg: color.cyan[5],
            subMenuItemSelectedColor: color.neutral[0],

            activeBarBorderWidth: 0,
        },
        Table: {
            headerBg: color.primary,
            padding: 12,
            headerColor: color.neutral[0],
            headerSortActiveBg: color.primary,
            borderColor: color.neutral[3],
            rowHoverBg: color.neutral[2],
            colorBgContainer: color.neutral[0],
            headerSortHoverBg: color.cyan[6],
            colorIcon: color.neutral[0],
        },
        Button: {
            colorPrimary: color.primary,
            colorPrimaryBgHover: "none",
            primaryShadow: "none",
        },
        Form: {
            labelColor: color.neutral[8],
            colorText: color.neutral[9],
        },
        Typography: {
            titleMarginTop: 0,
            titleMarginBottom: 0,
            colorTextHeading: "none"
        },
    },
};
