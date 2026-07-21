import { create } from "zustand";

export type Locale = "es" | "en";

const STORAGE_KEY = "locale";

function getInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "es" ? stored : "es";
}

interface LocaleState {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
    locale: getInitialLocale(),
    setLocale: (locale) => {
        localStorage.setItem(STORAGE_KEY, locale);
        set({ locale });
    },
}));
