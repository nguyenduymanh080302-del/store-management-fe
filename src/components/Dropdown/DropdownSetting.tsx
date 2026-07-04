import { useNavigate } from '@tanstack/react-router'
import { Dropdown, MenuProps } from 'antd'
import { IconSetting } from '@/assets/icons'
import FormattedMessage from '@/components/FormattedMessage'
import { useAuthStore } from '@/stores/auth.store'
import "@/components/Dropdown/DropdownSetting"

const DropdownSetting = () => {

    const navigate = useNavigate()

    const settingMenu: MenuProps["items"] = [
        {
            key: "profile",
            label: <FormattedMessage id="settings.profile" />,
        },
        {
            key: "change-password",
            label: <FormattedMessage id="settings.change-password" />,
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            label: <FormattedMessage id="settings.logout" />,
            danger: true,
        },
    ]

    return (
        <Dropdown
            menu={{
                items: settingMenu,
                onClick: ({ key }) => {
                    switch (key) {
                        case "profile":
                            navigate({ to: "/profile" })
                            break
                        case "change-password":
                            navigate({ to: "/change-password" })
                            break
                        case "logout":
                            useAuthStore.getState().logout()
                            break
                        default:
                            break
                    }
                }
            }}
            trigger={["click"]}
            placement="bottomRight"
        >
            <span className="cursor-pointer flex dropdown-setting">
                <IconSetting
                    width={30}
                    height={30}
                    color="var(--color-neutral-0)"
                />
            </span>
        </Dropdown >
    )
}

export default DropdownSetting
