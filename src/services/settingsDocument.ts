import type { CategoryBudget } from "../types/Budget";
import { DEFAULT_SETTINGS, type Settings } from "../types/Settings";

const LEGACY_ESTIMATED_INCOME_FIELD = "ingresosEstimados";

type SettingsDocument = Record<string, unknown>;

export const normalizeCategoryBudgets = (raw: unknown): Record<string, CategoryBudget> => {
    if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS.categoryBudgets;

    const budgets: Record<string, CategoryBudget> = {};
    for (const [key, value] of Object.entries(raw)) {
        if (typeof value === "number") budgets[key] = { amount: value, period: "monthly" };
        else if (value && typeof value === "object" && "amount" in value) budgets[key] = value as CategoryBudget;
    }
    return budgets;
};

export const normalizeBudgetHistory = (raw: unknown): Record<string, Record<string, CategoryBudget>> => {
    if (!raw || typeof raw !== "object") return {};
    return Object.fromEntries(Object.entries(raw).map(([month, budgets]) => [month, normalizeCategoryBudgets(budgets)]));
};

export const settingsFromDocument = (data: SettingsDocument): Settings => {
    const read = <K extends keyof Settings>(key: K, field: string = key): Settings[K] =>
        (data[field] as Settings[K] | undefined) ?? DEFAULT_SETTINGS[key];

    return {
        estimatedIncome: read("estimatedIncome", LEGACY_ESTIMATED_INCOME_FIELD),
        savingsTarget: read("savingsTarget"),
        categoryBudgets: normalizeCategoryBudgets(data.categoryBudgets),
        categories: read("categories"),
        categorizationRules: read("categorizationRules"),
        featuredGoalId: read("featuredGoalId"),
        onboardingComplete: read("onboardingComplete"),
        combinedTransactionsView: read("combinedTransactionsView"),
        budgetHistory: normalizeBudgetHistory(data.budgetHistory),
        showNoComputableTab: read("showNoComputableTab"),
    };
};

export const settingsToDocument = ({ estimatedIncome, ...rest }: Partial<Settings>): SettingsDocument =>
    estimatedIncome === undefined ? { ...rest } : { ...rest, [LEGACY_ESTIMATED_INCOME_FIELD]: estimatedIncome };
