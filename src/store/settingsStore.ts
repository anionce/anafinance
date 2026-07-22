import { create } from "zustand";
import { loadSettings, saveSettings } from "../services/storage";
import { DEFAULT_SETTINGS } from "../types/Settings";
import type { Category } from "../types/Category";
import type { CategoryBudget } from "../types/Budget";

interface SettingsState {
    estimatedIncome: number;
    categoryBudgets: Record<string, CategoryBudget>;
    categories: Category[];
    onboardingComplete: boolean;
    hasLoaded: boolean;
    load: (uid: string) => Promise<void>;
    reset: () => void;
    setEstimatedIncome: (uid: string, value: number) => Promise<void>;
    setCategoryBudgets: (uid: string, budgets: Record<string, CategoryBudget>) => Promise<void>;
    setCategories: (uid: string, categories: Category[]) => Promise<void>;
    addCategory: (uid: string, value: string, label: string) => Promise<void>;
    updateCategoryLabel: (uid: string, value: string, label: string) => Promise<void>;
    removeCategory: (uid: string, value: string) => Promise<void>;
    completeOnboarding: (uid: string) => Promise<void>;
}

const INITIAL_STATE = {
    ...DEFAULT_SETTINGS,
    hasLoaded: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    ...INITIAL_STATE,

    async load(uid) {
        const settings = await loadSettings(uid);
        set({ ...settings, hasLoaded: true });
    },

    reset() {
        set({ ...INITIAL_STATE });
    },

    async setEstimatedIncome(uid, value) {
        set({ estimatedIncome: value });
        await saveSettings(uid, { estimatedIncome: value });
    },

    async setCategoryBudgets(uid, budgets) {
        set({ categoryBudgets: budgets });
        await saveSettings(uid, { categoryBudgets: budgets });
    },

    async setCategories(uid, categories) {
        set({ categories });
        await saveSettings(uid, { categories });
    },

    async addCategory(uid, value, label) {
        const categories = [...get().categories, { value, label }];
        set({ categories });
        await saveSettings(uid, { categories });
    },

    async updateCategoryLabel(uid, value, label) {
        const categories = get().categories.map((c) => (c.value === value ? { ...c, label } : c));
        set({ categories });
        await saveSettings(uid, { categories });
    },

    async removeCategory(uid, value) {
        const categories = get().categories.filter((c) => c.value !== value);
        const categoryBudgets = { ...get().categoryBudgets };
        delete categoryBudgets[value];
        set({ categories, categoryBudgets });
        await Promise.all([
            saveSettings(uid, { categories }),
            saveSettings(uid, { categoryBudgets }),
        ]);
    },

    async completeOnboarding(uid) {
        set({ onboardingComplete: true });
        await saveSettings(uid, { onboardingComplete: true });
    },
}));
