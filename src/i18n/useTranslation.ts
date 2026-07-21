import { useLocaleStore } from "../store/localeStore";
import type { Locale } from "../store/localeStore";
import { translations } from "./translations";
import type { TranslationSet } from "./translations";

export function useTranslation(): { t: TranslationSet; locale: Locale; setLocale: (locale: Locale) => void } {
    const locale = useLocaleStore((s) => s.locale);
    const setLocale = useLocaleStore((s) => s.setLocale);
    return { t: translations[locale], locale, setLocale };
}
