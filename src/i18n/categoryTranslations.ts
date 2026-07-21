import type { Locale } from "../store/localeStore";
import type { Category } from "../types/Category";

/**
 * Translated labels for the default seed categories only. Categories a user
 * renames or adds themselves are free text with no known translation, so
 * they're shown as stored regardless of locale.
 */
const CATEGORY_LABEL_TRANSLATIONS: Record<string, Record<Locale, string>> = {
    ropa: { es: "👕 Ropa", en: "👕 Clothing" },
    libros: { es: "📚 Libros", en: "📚 Books" },
    espectaculos: { es: "🎭 Espectáculos", en: "🎭 Entertainment" },
    casa: { es: "🏡 Casa & decoración", en: "🏡 Home & decor" },
    cafeterias: { es: "☕ Cafeterías y restaurantes", en: "☕ Cafés & restaurants" },
    imprevistos: { es: "🗨 Imprevistos", en: "🗨 Unexpected" },
    supermercado: { es: "🛒 Supermercado", en: "🛒 Groceries" },
    salud: { es: "💊 Salud", en: "💊 Health" },
    wellness: { es: "🧘 Wellness", en: "🧘 Wellness" },
    regalos: { es: "🎁 Regalos", en: "🎁 Gifts" },
    ahorro: { es: "💰 Ahorro", en: "💰 Savings" },
    transferencia: { es: "🔄 Transferencia", en: "🔄 Transfer" },
    servicios_online: { es: "💻 Servicios online", en: "💻 Online services" },
    no_computable: { es: "🚫 No computable", en: "🚫 Not counted" },
    vinted_wallapop: { es: "💵 Vinted/Wallapop", en: "💵 Vinted/Wallapop" },
};

export function getCategoryLabel(category: Category, locale: Locale): string {
    return CATEGORY_LABEL_TRANSLATIONS[category.value]?.[locale] ?? category.label;
}
