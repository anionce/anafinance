export interface Category {
    value: string;
    label: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { value: "ropa", label: "👕 Ropa" },
    { value: "libros", label: "📚 Libros" },
    { value: "espectaculos", label: "🎭 Espectáculos" },
    { value: "casa", label: "🏡 Casa & decoración" },
    { value: "cafeterias", label: "☕ Cafeterías y restaurantes" },
    { value: "imprevistos", label: "🗨 Imprevistos" },
    { value: "supermercado", label: "🛒 Supermercado" },
    { value: "salud", label: "💊 Salud" },
    { value: "wellness", label: "🧘 Wellness" },
    { value: "regalos", label: "🎁 Regalos" },
    { value: "ahorro", label: "💰 Ahorro" },
    { value: "transferencia", label: "🔄 Transferencia" },
    { value: "servicios_online", label: "💻 Servicios online" },
    { value: "no_computable", label: "🚫 No computable" },
    { value: "vinted_wallapop", label: "💵 Vinted/Wallapop" },
];

export type CategoryValue = string;
