import type { Locale } from "../store/localeStore";
import type { Category } from "../types/Category";

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

export const sortCategoriesAlphabetically = (categories: Category[], locale: Locale): Category[] => {
    const sortKey = (c: Category) => getCategoryLabel(c, locale).replace(/^[^\p{L}\p{N}]+/u, "");
    return [...categories].sort((a, b) => sortKey(a).localeCompare(sortKey(b), locale, { sensitivity: "base" }));
};

export const getCategoryLabel = (category: Category, locale: Locale): string => {
    if (category.customLabel) return category.label;
    return CATEGORY_LABEL_TRANSLATIONS[category.value]?.[locale] ?? category.label;
};
