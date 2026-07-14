import React, { useState, useEffect } from "react";
import { IntlProvider, MessageFormatElement } from "react-intl";
import { useAppStore } from "@/stores/app.store";

type Messages =
    | Record<string, string>
    | Record<string, MessageFormatElement[]>;

const locales = import.meta.glob("../utils/locales/*.json", {
    eager: true,
    import: "default",
}) as Record<string, Messages>;

const loadLocaleData = async (locale: string): Promise<{ default: Messages }> => {
    const localeData = await locales[`../utils/locales/${locale}.json`] ?? locales["../utils/locales/vi.json"];
    return { default: localeData };
};

type Props = {
    children: React.ReactNode;
};

const Locales: React.FC<Props> = ({ children }) => {
    const locale = useAppStore((s) => s.locale);

    const [messages, setMessages] = useState<Messages | null>(null);

    useEffect(() => {
        let isMounted = true;

        loadLocaleData(locale).then((res) => {
            if (isMounted) setMessages(res.default);
        });

        return () => {
            isMounted = false; //switch mounted
        };
    }, [locale]);

    if (!messages) return null;

    return (
        <IntlProvider locale={locale} defaultLocale="vi" messages={messages}>
            {children}
        </IntlProvider>
    );
};

export default Locales;
