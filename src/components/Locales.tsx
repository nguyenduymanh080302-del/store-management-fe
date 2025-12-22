import React, { useState, useEffect } from "react";
import { IntlProvider, MessageFormatElement } from "react-intl";

import { useAppStore } from "stores/app.store";

type Messages =
    | Record<string, string>
    | Record<string, MessageFormatElement[]>;

const loadLocaleData = (locale: string): Promise<{ default: Messages }> => {
    return import(`utils/locales/${locale}.json`).catch(() =>
        import("utils/locales/vi.json")
    );
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

        // cleanup to avoid memory leak on fast language switches
        return () => {
            isMounted = false;
        };
    }, [locale]);

    if (!messages) return null;

    return (
        <IntlProvider locale={locale} defaultLocale="en" messages={messages}>
            {children}
        </IntlProvider>
    );
};

export default Locales;
