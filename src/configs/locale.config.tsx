
import { IconChinese, IconEnglishUK, IconJapanese } from "assets/icons";
import IconVietnamese from "assets/icons/countries/IconVietnamese";

// src/config/locales.ts
export const LANGUAGE: Record<Language, {
    label: string;
    flag: React.ReactNode;
}> = {
    "vi": { label: "Tiếng Việt", flag: <IconVietnamese width={24} className="border-1 border-cyan-0" /> },
    "en": { label: "English", flag: <IconEnglishUK width={24} className="border-1 border-cyan-0" /> },
    "zh-cn": { label: "中文", flag: <IconChinese width={24} className="border-1 border-cyan-0" /> },
    "ja": { label: "日本語", flag: <IconJapanese width={24} className="border-1 border-cyan-0" /> },
};
