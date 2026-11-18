import type { BudgetPeriod, CategoryBudget } from "../types/Budget";
import type { Category } from "../types/Category";

export interface BudgetDraft {
    amount: string;
    period: BudgetPeriod;
    intervalMonths: string;
}

export const DEFAULT_INTERVAL_MONTHS = 3;

export const toBudgetDraft = (budget?: CategoryBudget): BudgetDraft => ({
    amount: budget ? String(budget.amount) : "",
    period: budget?.period ?? "monthly",
    intervalMonths: String(budget?.intervalMonths ?? DEFAULT_INTERVAL_MONTHS),
});

export const toBudgetDrafts = (categories: Category[], budgets: Record<string, CategoryBudget>): Record<string, BudgetDraft> =>
    Object.fromEntries(categories.map((c) => [c.value, toBudgetDraft(budgets[c.value])]));

export const parseAmount = (raw: string, fallback: number): number => {
    const amount = Number(raw);
    return raw.trim() !== "" && !Number.isNaN(amount) && amount >= 0 ? amount : fallback;
};

export const parseBudgetDraft = (draft: BudgetDraft): CategoryBudget | null => {
    const amount = parseAmount(draft.amount, 0);
    if (amount <= 0) return null;
    if (draft.period !== "everyNMonths") return { amount, period: draft.period };
    return { amount, period: draft.period, intervalMonths: Math.max(Number(draft.intervalMonths) || 1, 1) };
};

export const parseBudgetDrafts = (drafts: Record<string, BudgetDraft>): Record<string, CategoryBudget> => {
    const budgets: Record<string, CategoryBudget> = {};
    for (const [category, draft] of Object.entries(drafts)) {
        const budget = parseBudgetDraft(draft);
        if (budget) budgets[category] = budget;
    }
    return budgets;
};

export const isBudgetable = (category: Category) => !category.noComputable && !category.incomeOnly;
