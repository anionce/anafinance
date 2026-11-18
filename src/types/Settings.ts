import { DEFAULT_CATEGORY_BUDGETS } from "./Budget";
import type { CategoryBudget } from "./Budget";
import { DEFAULT_CATEGORIES } from "./Category";
import type { Category } from "./Category";
import type { CategorizationRule } from "./CategorizationRule";

export interface Settings {
    estimatedIncome: number;
    savingsTarget: number;
    categoryBudgets: Record<string, CategoryBudget>;
    categories: Category[];
    categorizationRules: CategorizationRule[];
    featuredGoalId: string;
    onboardingComplete: boolean;
    combinedTransactionsView: boolean;
    budgetHistory: Record<string, Record<string, CategoryBudget>>;
    showNoComputableTab: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    estimatedIncome: 2300,
    savingsTarget: 0,
    categoryBudgets: DEFAULT_CATEGORY_BUDGETS,
    categories: DEFAULT_CATEGORIES,
    categorizationRules: [],
    featuredGoalId: "",
    onboardingComplete: false,
    combinedTransactionsView: false,
    budgetHistory: {},
    showNoComputableTab: false,
};
