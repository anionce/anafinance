import type { Category } from "../types/Category";
import type { Locale } from "../store/localeStore";
import { getCategoryLabel } from "../i18n/categoryTranslations";

export const slugify = (label: string): string =>
    label
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

export const deriveNewCategory = (rawLabel: string, categories: Category[]): { value: string; label: string } | null => {
    const label = rawLabel.trim();
    if (!label) return null;
    const value = slugify(label);
    if (!value || categories.some((c) => c.value === value)) return null;
    return { value, label };
};

export const resolveCategoryLabelEdit = (
    value: string,
    draft: string | undefined,
    categories: Category[],
    locale: Locale,
): string | null => {
    const label = draft?.trim();
    const original = categories.find((c) => c.value === value);
    const originalDisplay = original ? getCategoryLabel(original, locale) : undefined;
    return label && label !== originalDisplay ? label : null;
};
