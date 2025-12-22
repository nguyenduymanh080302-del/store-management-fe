import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
    locale: string;
    setLanguage: (lang: string) => void;
};

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            // default locale logic
            locale:
                localStorage.getItem("locale") ||
                import.meta.env.VITE_LANGUAGE_DEFAULT ||
                "vi",

            setLanguage: (lang: string) => {
                set({ locale: lang });
                localStorage.setItem("locale", lang);
            },
        }),
        {
            name: "app-storage", // saved in localStorage as key "app-storage"
        }
    )
);
