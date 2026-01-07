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

            setLanguage: (language: string) => {
                set({ locale: language });
                localStorage.setItem("locale", language);
            },
        }),
        {
            name: "app-storage", // saved in localStorage as key "app-storage"
        }
    )
);
