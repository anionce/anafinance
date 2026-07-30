import { DEFAULT_CATEGORY_BUDGETS } from "./Budget";
import type { CategoryBudget } from "./Budget";
import { DEFAULT_CATEGORIES } from "./Category";
import type { Category } from "./Category";
import type { CategorizationRule } from "./CategorizationRule";

export interface Settings {
    estimatedIncome: number;
    categoryBudgets: Record<string, CategoryBudget>;
    categories: Category[];
    categorizationRules: CategorizationRule[];
    /** Which goal to show in the Dashboard's featured-goal card. Empty means "pick automatically". */
    featuredGoalId: string;
    onboardingComplete: boolean;
    /** When true, Expenses and Income share a single "Transactions" tab instead of separate ones. */
    combinedTransactionsView: boolean;
    /** Snapshot of categoryBudgets saved each time it changes, keyed by the "YYYY-MM" month it
     *  took effect. A month with no entry of its own carries forward the closest earlier one. */
    budgetHistory: Record<string, Record<string, CategoryBudget>>;
}

export const DEFAULT_SETTINGS: Settings = {
    estimatedIncome: 2300,
    categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
    categories: DEFAULT_CATEGORIES,
    categorizationRules: [],
    featuredGoalId: "",
    onboardingComplete: false,
    combinedTransactionsView: false,
    budgetHistory: {},
};
