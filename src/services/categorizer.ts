import type { CategoryValue } from "../types/Category";

// Only Amazon needs manual review (all sorts of purchases, no clear pattern)
const MANUAL_REVIEW_KEYWORDS = ["amazon, biz"];

const RULES: { keywords: string[]; category: CategoryValue }[] = [
  { keywords: ["aeat"], category: "transferencia" },
  { keywords: ["transferencia recibida"], category: "vinted_wallapop" },
  { keywords: ["farmacia", "dentista", "fisio", "clinica", "clínica", "médico", "medico"], category: "salud" },
  { keywords: ["gimnasio", "yoga", "pilates", "spa"], category: "wellness" },
  {
    keywords: [
      "cafeteria", "cafetería", "starbucks", "cafe ",
      "restaurante", "restaurant", "bar ", "pizzeria", "pizzería",
      "sushi", "burger", "hamburgueseria", "hamburguesería", "asador",
      "taberna", "bistro", "glovo", "just eat", "uber eats", "deliveroo",
    ],
    category: "cafeterias",
  },
  {
    keywords: [
      "mercadona", "carrefour", "dia ", "lidl", "aldi", "eroski",
      "consum", "caprabo", "condis", "supermercado", "supercor", "alcampo",
    ],
    category: "supermercado",
  },
  { keywords: ["ikea", "leroy merlin", "casa "], category: "casa" },
  { keywords: ["fnac", "casa del libro", "libreria", "librería"], category: "libros" },
  { keywords: ["cinema", "cine ", "ticketmaster", "entradas"], category: "espectaculos" },
  { keywords: ["regal", "regalo"], category: "regalos" },
  { keywords: ["zara", "mango", "h&m", "hm", "primor", "oysho", "ropa"], category: "ropa" },
{ keywords: ["netflix", "spotify", "icloud", "google one", "dropbox", "chatgpt", "openai", "microsoft 365", "adobe"], category: "servicios_online" },
];

/**
 * @param text transaction description
 * @param amount amount (positive = income, negative = expense)
 */
export function categorize(text: string, amount: number): CategoryValue | null {
  const normalized = text.toLowerCase();

  // Special case: Vinted depends on whether it's a sale (income) or purchase (expense)
  if (normalized.includes("vinted")) {
    return amount < 0 ? "ropa" : "vinted_wallapop";
  }

  if (MANUAL_REVIEW_KEYWORDS.some((kw) => normalized.includes(kw))) {
    return null;
  }

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.category;
    }
  }

  return null;
}