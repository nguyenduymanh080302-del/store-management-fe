import { useAppStore } from "stores/app.store";
import { LANGUAGE } from "configs/locale.config";
import { Flex, Select } from "antd";

const SelectLanguage = () => {
    const locale = useAppStore(s => s.locale);
    const setLanguage = useAppStore(s => s.setLanguage);

    const languageOptions = Object.entries(LANGUAGE).map(([key, { label, flag }]) => ({
        value: key as Language,
        label: (
            <Flex align="center" justify="start" gap={8}>
                {flag}
                {label}
            </Flex>
        ),
    }));

    return (
        <Select<string>
            className="min-w-160"
            value={locale}
            onChange={setLanguage}
            options={languageOptions}
        />
    );
};

export default SelectLanguage;
