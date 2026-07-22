import { create } from "zustand";
import type { Transaction } from "../types/Transaction";
import type { Goal } from "../types/Goal";
import { FEATURED_GOAL_ID } from "../types/Goal";
import { parseExcel, transactionsFromMapping } from "../services/excelParser";
import type { ColumnMapping } from "../services/excelParser";
import {
    loadTransactions,
    mergeTransactions,
    updateTransactionCategory,
    updateTransactionNotes,
    loadGoals,
    saveGoal,
    deleteGoal,
} from "../services/storage";
import { sortByDateDesc } from "../utils/dates";

interface FinanceState {
    transactions: Transaction[];
    hasLoaded: boolean;
    load: (uid: string) => Promise<void>;
    reset: () => void;
    importFile: (uid: string, file: File) => Promise<void>;
    importFileWithMapping: (uid: string, rows: unknown[][], mapping: ColumnMapping) => Promise<void>;
    resolveCategory: (uid: string, id: string, category: string) => Promise<void>;
    updateNotes: (uid: string, id: string, notes: string) => Promise<void>;

    goals: Goal[];
    addGoal: (uid: string, goal: Omit<Goal, "id">, makeFeatured?: boolean) => Promise<void>;
    updateGoalAmount: (uid: string, id: string, currentAmount: number) => Promise<void>;
    updateGoalName: (uid: string, id: string, name: string) => Promise<void>;
    updateGoalTarget: (uid: string, id: string, targetAmount: number) => Promise<void>;
    removeGoal: (uid: string, id: string) => Promise<void>;
}

function generateId(): string {
    return crypto.randomUUID();
}

const INITIAL_STATE = {
    transactions: [] as Transaction[],
    hasLoaded: false,
    goals: [] as Goal[],
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
    ...INITIAL_STATE,

    async load(uid) {
        const [transactions, goals] = await Promise.all([
            loadTransactions(uid),
            loadGoals(uid),
        ]);
        set({ transactions: sortByDateDesc(transactions), goals, hasLoaded: true });
    },

    reset() {
        set({ ...INITIAL_STATE });
    },

    async importFile(uid, file) {
        const incoming = await parseExcel(file);
        const { merged, addedCount } = await mergeTransactions(uid, get().transactions, incoming);
        console.log(`${addedCount} new transactions added out of ${incoming.length} in the file`);
        set({ transactions: sortByDateDesc(merged) });
    },

    async importFileWithMapping(uid, rows, mapping) {
        const incoming = transactionsFromMapping(rows, mapping);
        const { merged, addedCount } = await mergeTransactions(uid, get().transactions, incoming);
        console.log(`${addedCount} new transactions added out of ${incoming.length} in the file`);
        set({ transactions: sortByDateDesc(merged) });
    },

    async resolveCategory(uid, id, category) {
        await updateTransactionCategory(uid, id, category);
        set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, category } : t)),
        }));
    },

    async updateNotes(uid, id, notes) {
        await updateTransactionNotes(uid, id, notes);
        set((state) => ({
            transactions: state.transactions.map((t) => (t.id === id ? { ...t, notes } : t)),
        }));
    },

    async addGoal(uid, goal, makeFeatured) {
        const hasFeatured = get().goals.some((g) => g.id === FEATURED_GOAL_ID);
        const id = makeFeatured && !hasFeatured ? FEATURED_GOAL_ID : generateId();
        const newGoal: Goal = { ...goal, id };
        await saveGoal(uid, newGoal);
        set((state) => ({ goals: [...state.goals, newGoal] }));
    },

    async updateGoalAmount(uid, id, currentAmount) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, currentAmount };
        await saveGoal(uid, updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async updateGoalName(uid, id, name) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, name };
        await saveGoal(uid, updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async updateGoalTarget(uid, id, targetAmount) {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, targetAmount };
        await saveGoal(uid, updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    },

    async removeGoal(uid, id) {
        await deleteGoal(uid, id);
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
    },
}));
