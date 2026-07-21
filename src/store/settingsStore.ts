import { create } from "zustand";
import { loadSettings, saveSettings } from "../services/storage";
import { DEFAULT_SETTINGS } from "../types/Settings";
import type { Category } from "../types/Category";
import type { CategoryBudget } from "../types/Budget";

interface SettingsState {
    estimatedIncome: number;
    categoryBudgets: Record<string, CategoryBudget>;
    categories: Category[];
    hasLoaded: boolean;
    load: () => Promise<void>;
    setEstimatedIncome: (value: number) => Promise<void>;
    setCategoryBudgets: (budgets: Record<string, CategoryBudget>) => Promise<void>;
    addCategory: (value: string, label: string) => Promise<void>;
    updateCategoryLabel: (value: string, label: string) => Promise<void>;
    removeCategory: (value: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    ...DEFAULT_SETTINGS,
    hasLoaded: false,

    async load() {
        const settings = await loadSettings();
        set({ ...settings, hasLoaded: true });
    },

    async setEstimatedIncome(value) {
        set({ estimatedIncome: value });
        await saveSettings({ estimatedIncome: value });
    },

    async setCategoryBudgets(budgets) {
        set({ categoryBudgets: budgets });
        await saveSettings({ categoryBudgets: budgets });
    },

    async addCategory(value, label) {
        const categories = [...get().categories, { value, label }];
        set({ categories });
        await saveSettings({ categories });
    },

    async updateCategoryLabel(value, label) {
        const categories = get().categories.map((c) => (c.value === value ? { ...c, label } : c));
        set({ categories });
        await saveSettings({ categories });
    },

    async removeCategory(value) {
        const categories = get().categories.filter((c) => c.value !== value);
        const categoryBudgets = { ...get().categoryBudgets };
        delete categoryBudgets[value];
        set({ categories, categoryBudgets });
        await Promise.all([
            saveSettings({ categories }),
            saveSettings({ categoryBudgets }),
        ]);
    },
}));
