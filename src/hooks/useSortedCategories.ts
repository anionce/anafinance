import { useMemo } from "react";
import { useSettingsStore } from "../store/settingsStore";
import { useLocaleStore } from "../store/localeStore";
import { sortCategoriesAlphabetically } from "../i18n/categoryTranslations";
import type { Category } from "../types/Category";

/** The user's categories in alphabetical order for the current language — the order every list and picker should show. */
export function useSortedCategories(): Category[] {
    const categories = useSettingsStore((s) => s.categories);
    const locale = useLocaleStore((s) => s.locale);
    return useMemo(() => sortCategoriesAlphabetically(categories, locale), [categories, locale]);
}
