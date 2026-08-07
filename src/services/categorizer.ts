import type { CategoryValue } from "../types/Category";
import type { CategorizationRule } from "../types/CategorizationRule";
import type { Transaction } from "../types/Transaction";

// Only Amazon needs manual review (all sorts of purchases, no clear pattern)
const MANUAL_REVIEW_KEYWORDS = ["amazon, biz"];

const RULES: { keywords: string[]; category: CategoryValue }[] = [
  { keywords: ["aeat"], category: "transferencia" },
  { keywords: ["transferencia recibida"], category: "transferencia" },
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

  // Special case: a Vinted purchase looks like clothing spend; a Vinted sale
  // isn't a clear category match, so it's left for manual review.
  if (normalized.includes("vinted")) {
    return amount < 0 ? "ropa" : null;
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

function findMatchingRule(description: string, rules: CategorizationRule[]): CategorizationRule | undefined {
  const normalized = description.toLowerCase();
  return rules.find((r) => {
    const keyword = r.keyword?.trim().toLowerCase();
    return keyword && normalized.includes(keyword);
  });
}

/** User-defined keyword rules take priority over the built-in categorizer above. */
export function applyCategorizationRules(transactions: Transaction[], rules: CategorizationRule[]): Transaction[] {
  if (rules.length === 0) return transactions;

  return transactions.map((tx) => {
    const match = findMatchingRule(tx.description, rules);
    return match ? { ...tx, category: match.category } : tx;
  });
}

/**
 * How much each goal should be credited from these transactions, based on
 * rules that have a goal attached. Always the transaction's absolute amount —
 * a contribution moves money toward the goal regardless of whether the
 * matched transaction was a debit or credit on the account it came from.
 */
export function sumGoalContributions(transactions: Transaction[], rules: CategorizationRule[]): Map<string, number> {
  const contributions = new Map<string, number>();
  if (rules.length === 0) return contributions;

  for (const tx of transactions) {
    const match = findMatchingRule(tx.description, rules);
    if (match?.goalId) {
      contributions.set(match.goalId, (contributions.get(match.goalId) ?? 0) + Math.abs(tx.amount));
    }
  }
  return contributions;
}