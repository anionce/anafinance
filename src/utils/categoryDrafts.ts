import type { Category } from "../types/Category";
import type { Locale } from "../store/localeStore";
import { getCategoryLabel } from "../i18n/categoryTranslations";

/** Turns a free-text label into a stable category id: strips accents/punctuation, lowercases, spaces→underscores. */
export function slugify(label: string): string {
    return label
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}

/** Derives a new category's {value, label} from free text, or null if blank or already taken. */
export function deriveNewCategory(rawLabel: string, categories: Category[]): { value: string; label: string } | null {
    const label = rawLabel.trim();
    if (!label) return null;
    const value = slugify(label);
    if (!value || categories.some((c) => c.value === value)) return null;
    return { value, label };
}

/** The trimmed draft label, if it's a real change from what's currently displayed — else null. */
export function resolveCategoryLabelEdit(value: string, draft: string | undefined, categories: Category[], locale: Locale): string | null {
    const label = draft?.trim();
    const original = categories.find((c) => c.value === value);
    const originalDisplay = original ? getCategoryLabel(original, locale) : undefined;
    return label && label !== originalDisplay ? label : null;
}
