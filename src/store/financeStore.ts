import { create } from "zustand";
import type { Transaction } from "../types/Transaction";
import type { Goal } from "../types/Goal";
import { FEATURED_GOAL_ID } from "../types/Goal";
import { parseExcel } from "../services/excelParser";
import {
    loadTransactions,
    mergeTransactions,
    updateTransactionCategory,
    updateTransactionNotes,
    loadLegacyColchon,
    loadGoals,
    saveGoal,
    deleteGoal,
} from "../services/storage";
import { sortByDateDesc } from "../utils/dates";

interface FinanceState {
    transactions: Transaction[];
    hasLoaded: boolean;
    load: () => Promise<void>;
    importFile: (file: File) => Promise<void>;
    resolveCategory: (id: string, category: string) => Promise<void>;
    updateNotes: (id: string, notes: string) => Promise<void>;

    goals: Goal[];
    addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
    updateGoalAmount: (id: string, currentAmount: number) => Promise<void>;
    updateGoalName: (id: string, name: string) => Promise<void>;
    updateGoalTarget: (id: string, targetAmount: number) => Promise<void>;
    removeGoal: (id: string) => Promise<void>;
}

function generateId(): string {
    return crypto.randomUUID();
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
    transactions: [],
    hasLoaded: false,
    goals: [],

    async load() {
        const [transactions, legacyColchon, goals] = await Promise.all([
            loadTransactions(),
            loadLegacyColchon(),
            loadGoals(),
        ]);

        let finalGoals = goals;
        if (!goals.some((g) => g.id === FEATURED_GOAL_ID)) {
            const featuredGoal: Goal = {
                id: FEATURED_GOAL_ID,
                name: "Colchón Revolut",
                targetAmount: legacyColchon.meta,
                currentAmount: legacyColchon.current,
            };
            await saveGoal(featuredGoal);
            finalGoals = [...goals, featuredGoal];
        }

        set({ transactions: sortByDateDesc(transactions), goals: finalGoals, hasLoaded: true });
    },

    async importFile(file) {
        const incoming = await parseExcel(file);
        const { merged, addedCount } = await mergeTransactions(get().transactions, incoming);
        console.log(`${addedCount} new transactions added out of ${incoming.length} in the file`);
        set({ transactions: sortByDateDesc(merged) });
    },

    async resolveCategory(id, category) {
        await updateTransactionCategory(id, category);
        set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, category } : t)),
        }));
    },

    async updateNotes(id, notes) {
        await updateTransactionNotes(id, notes);
        set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, notes } : t)),
        }));
    },

    async addGoal(goal) {
        const newGoal: Goal = { ...goal, id: generateId() };
        await saveGoal(newGoal);
        set((state) => ({ goals: [...state.goals, newGoal] }));
    },

    async updateGoalAmount(id, currentAmount) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, currentAmount };
        await saveGoal(updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async updateGoalName(id, name) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, name };
        await saveGoal(updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async updateGoalTarget(id, targetAmount) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, targetAmount };
        await saveGoal(updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async removeGoal(id) {
        await deleteGoal(id);
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    },
}));
