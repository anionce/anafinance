import { create } from "zustand";
import { loadSettings, saveSettings } from "../services/storage";
import type { CategoryBudget } from "../types/Budget";
import type { CategorizationRule } from "../types/CategorizationRule";
import type { Category } from "../types/Category";
import { DEFAULT_SETTINGS, type Settings } from "../types/Settings";
import { getCurrentMonth } from "../utils/dates";

interface SettingsState extends Settings {
    hasLoaded: boolean;
    load: (uid: string) => Promise<void>;
    reset: () => void;
    setEstimatedIncome: (uid: string, value: number) => Promise<void>;
    setSavingsTarget: (uid: string, value: number) => Promise<void>;
    setCategoryBudgets: (uid: string, budgets: Record<string, CategoryBudget>, month?: string) => Promise<void>;
    addCategory: (uid: string, value: string, label: string) => Promise<void>;
    updateCategoryLabel: (uid: string, value: string, label: string) => Promise<void>;
    setCategoryNoComputable: (uid: string, value: string, noComputable: boolean) => Promise<void>;
    setCategoryIncomeOnly: (uid: string, value: string, incomeOnly: boolean) => Promise<void>;
    setCategoryExcludeFromBalance: (uid: string, value: string, excludeFromBalance: boolean) => Promise<void>;
    removeCategory: (uid: string, value: string) => Promise<void>;
    addRule: (uid: string, keyword: string, category: string, goalId?: string) => Promise<void>;
    removeRule: (uid: string, id: string) => Promise<void>;
    setFeaturedGoalId: (uid: string, id: string) => Promise<void>;
    completeOnboarding: (uid: string) => Promise<void>;
    setCombinedTransactionsView: (uid: string, value: boolean) => Promise<void>;
    setShowNoComputableTab: (uid: string, value: boolean) => Promise<void>;
}

const INITIAL_STATE = { ...DEFAULT_SETTINGS, hasLoaded: false };

export const useSettingsStore = create<SettingsState>((set, get) => {
    const save = async (uid: string, patch: Partial<Settings>) => {
        set(patch);
        await saveSettings(uid, patch);
    };

    const updateCategory = (value: string, patch: Partial<Category>): Category[] =>
        get().categories.map((c) => (c.value === value ? { ...c, ...patch } : c));

    const withoutBudgetFor = (value: string) => {
        const categoryBudgets = Object.fromEntries(Object.entries(get().categoryBudgets).filter(([key]) => key !== value));
        const budgetHistory = { ...get().budgetHistory, [getCurrentMonth()]: categoryBudgets };
        return { categoryBudgets, budgetHistory };
    };

    const budgetsAfterToggle = (value: string, removesBudget: boolean) =>
        removesBudget ? withoutBudgetFor(value) : { budgetHistory: { ...get().budgetHistory, [getCurrentMonth()]: get().categoryBudgets } };

    return {
        ...INITIAL_STATE,

        load: async (uid) => set({ ...(await loadSettings(uid)), hasLoaded: true }),

        reset: () => set({ ...INITIAL_STATE }),

        setEstimatedIncome: (uid, estimatedIncome) => save(uid, { estimatedIncome }),

        setSavingsTarget: (uid, savingsTarget) => save(uid, { savingsTarget }),

        setCategoryBudgets: (uid, budgets, month = getCurrentMonth()) => {
            const budgetHistory = { ...get().budgetHistory, [month]: budgets };
            const isCurrentMonth = month === getCurrentMonth();
            return save(uid, isCurrentMonth ? { categoryBudgets: budgets, budgetHistory } : { budgetHistory });
        },

        addCategory: (uid, value, label) => save(uid, { categories: [...get().categories, { value, label }] }),

        updateCategoryLabel: (uid, value, label) => save(uid, { categories: updateCategory(value, { label, customLabel: true }) }),

        setCategoryNoComputable: (uid, value, noComputable) =>
            save(uid, { categories: updateCategory(value, { noComputable }), ...budgetsAfterToggle(value, noComputable) }),

        setCategoryIncomeOnly: (uid, value, incomeOnly) =>
            save(uid, { categories: updateCategory(value, { incomeOnly }), ...budgetsAfterToggle(value, incomeOnly) }),

        setCategoryExcludeFromBalance: (uid, value, excludeFromBalance) =>
            save(uid, { categories: updateCategory(value, { excludeFromBalance }) }),

        removeCategory: (uid, value) =>
            save(uid, { categories: get().categories.filter((c) => c.value !== value), ...withoutBudgetFor(value) }),

        addRule: (uid, keyword, category, goalId) => {
            const rule: CategorizationRule = { id: crypto.randomUUID(), keyword, category, ...(goalId && { goalId }) };
            return save(uid, { categorizationRules: [...get().categorizationRules, rule] });
        },

        removeRule: (uid, id) => save(uid, { categorizationRules: get().categorizationRules.filter((r) => r.id !== id) }),

        setFeaturedGoalId: (uid, featuredGoalId) => save(uid, { featuredGoalId }),

        completeOnboarding: (uid) => save(uid, { onboardingComplete: true }),

        setCombinedTransactionsView: (uid, combinedTransactionsView) => save(uid, { combinedTransactionsView }),

        setShowNoComputableTab: (uid, showNoComputableTab) => save(uid, { showNoComputableTab }),
    };
});
