export interface Category {
    value: string;
    label: string;
    noComputable?: boolean;
    incomeOnly?: boolean;
    excludeFromBalance?: boolean;
    customLabel?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { value: "ropa", label: "👕 Ropa" },
    { value: "libros", label: "📚 Libros" },
    { value: "espectaculos", label: "🎭 Espectáculos" },
    { value: "casa", label: "🏡 Casa & decoración" },
    { value: "cafeterias", label: "☕ Cafeterías y restaurantes" },
    { value: "supermercado", label: "🛒 Supermercado" },
    { value: "salud", label: "💊 Salud" },
    { value: "wellness", label: "🧘 Wellness" },
    { value: "regalos", label: "🎁 Regalos" },
    { value: "transferencia", label: "🔄 Transferencia" },
    { value: "servicios_online", label: "💻 Servicios online" },
];

export type CategoryValue = string;
