export const CATEGORIES = [
  { value: "ropa", label: "👕 Ropa" },
  { value: "libros", label: "📚 Libros" },
  { value: "espectaculos", label: "🎭 Espectáculos" },
  { value: "casa", label: "🏡 Casa & decoración" },
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
] as const;

export type CategoryValue = typeof CATEGORIES[number]["value"];