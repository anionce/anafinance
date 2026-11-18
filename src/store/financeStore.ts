import { create } from "zustand";
import type { CategorizationRule } from "../types/CategorizationRule";
import { FEATURED_GOAL_ID, type Goal } from "../types/Goal";
import type { Transaction } from "../types/Transaction";
import { applyCategorizationRules, sumGoalContributions } from "../services/categorizer";
import { parseExcel, transactionsFromMapping, type ColumnMapping } from "../services/excelParser";
import {
    deleteGoal,
    deleteTransaction,
    deleteTransactions,
    loadGoals,
    loadTransactions,
    mergeTransactions,
    saveGoal,
    saveTransaction,
    updateTransactionCategory,
    updateTransactionNotes,
} from "../services/storage";
import { sortByDateDesc } from "../utils/dates";
import { canSplit, splitIntoTransactions } from "../utils/split";
import { useSettingsStore } from "./settingsStore";

interface FinanceState {
    transactions: Transaction[];
    hasLoaded: boolean;
    load: (uid: string) => Promise<void>;
    reset: () => void;
    importFile: (uid: string, file: File) => Promise<number>;
    importFileWithMapping: (uid: string, rows: unknown[][], mapping: ColumnMapping) => Promise<number>;
    addTransaction: (uid: string, transaction: Omit<Transaction, "id">) => Promise<void>;
    resolveCategory: (uid: string, id: string, category: string) => Promise<void>;
    updateNotes: (uid: string, id: string, notes: string) => Promise<void>;
    splitTransaction: (uid: string, id: string, portions: { category: string; amount: number }[]) => Promise<void>;
    removeTransaction: (uid: string, id: string) => Promise<void>;
    removeTransactions: (uid: string, ids: string[]) => Promise<void>;
    goals: Goal[];
    addGoal: (uid: string, goal: Omit<Goal, "id">, makeFeatured?: boolean) => Promise<void>;
    updateGoalAmount: (uid: string, id: string, currentAmount: number) => Promise<void>;
    updateGoalName: (uid: string, id: string, name: string) => Promise<void>;
    updateGoalTarget: (uid: string, id: string, targetAmount: number) => Promise<void>;
    removeGoal: (uid: string, id: string) => Promise<void>;
}

const INITIAL_STATE = {
    transactions: [] as Transaction[],
    hasLoaded: false,
    goals: [] as Goal[],
};

export const useFinanceStore = create<FinanceState>((set, get) => {
    const patchTransaction = (id: string, patch: Partial<Transaction>) =>
        set((state) => ({ transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

    const dropTransactions = (ids: string[]) => {
        const idSet = new Set(ids);
        set((state) => ({ transactions: state.transactions.filter((t) => !idSet.has(t.id)) }));
    };

    const updateGoal = async (uid: string, id: string, change: (goal: Goal) => Partial<Goal>) => {
        const goal = get().goals.find((g) => g.id === id);
        if (!goal) return;
        const updated = { ...goal, ...change(goal) };
        await saveGoal(uid, updated);
        set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
    };

    const creditGoalContributions = async (uid: string, added: Transaction[], rules: CategorizationRule[]) => {
        for (const [goalId, amount] of sumGoalContributions(added, rules)) {
            await updateGoal(uid, goalId, (goal) => ({ currentAmount: goal.currentAmount + amount }));
        }
    };

    const importTransactions = async (uid: string, parsed: Transaction[]) => {
        const rules = useSettingsStore.getState().categorizationRules;
        const { merged, added } = await mergeTransactions(uid, get().transactions, applyCategorizationRules(parsed, rules));
        set({ transactions: sortByDateDesc(merged) });
        await creditGoalContributions(uid, added, rules);
        return added.length;
    };

    return {
        ...INITIAL_STATE,

        load: async (uid) => {
            const [transactions, goals] = await Promise.all([loadTransactions(uid), loadGoals(uid)]);
            set({ transactions: sortByDateDesc(transactions), goals, hasLoaded: true });
        },

        reset: () => set({ ...INITIAL_STATE }),

        importFile: async (uid, file) => importTransactions(uid, await parseExcel(file)),

        importFileWithMapping: (uid, rows, mapping) => importTransactions(uid, transactionsFromMapping(rows, mapping)),

        addTransaction: async (uid, transaction) => {
            const newTransaction: Transaction = { ...transaction, id: `manual_${crypto.randomUUID()}` };
            await saveTransaction(uid, newTransaction);
            set((state) => ({ transactions: sortByDateDesc([...state.transactions, newTransaction]) }));
        },

        resolveCategory: async (uid, id, category) => {
            await updateTransactionCategory(uid, id, category);
            patchTransaction(id, { category });
        },

        updateNotes: async (uid, id, notes) => {
            await updateTransactionNotes(uid, id, notes);
            patchTransaction(id, { notes });
        },

        splitTransaction: async (uid, id, portions) => {
            const original = get().transactions.find((t) => t.id === id);
            if (!original || !canSplit(portions)) return;

            const parts = splitIntoTransactions(original, portions, Date.now());
            await Promise.all(parts.map((t) => saveTransaction(uid, t)));
            await deleteTransaction(uid, id);
            set((state) => ({
                transactions: sortByDateDesc([...state.transactions.filter((t) => t.id !== id), ...parts]),
            }));
        },

        removeTransaction: async (uid, id) => {
            await deleteTransaction(uid, id);
            dropTransactions([id]);
        },

        removeTransactions: async (uid, ids) => {
            await deleteTransactions(uid, ids);
            dropTransactions(ids);
        },

        addGoal: async (uid, goal, makeFeatured) => {
            const hasFeatured = get().goals.some((g) => g.id === FEATURED_GOAL_ID);
            const id = makeFeatured && !hasFeatured ? FEATURED_GOAL_ID : crypto.randomUUID();
            const newGoal: Goal = { ...goal, id };
            await saveGoal(uid, newGoal);
            set((state) => ({ goals: [...state.goals, newGoal] }));
        },

        updateGoalAmount: (uid, id, currentAmount) => updateGoal(uid, id, () => ({ currentAmount })),

        updateGoalName: (uid, id, name) => updateGoal(uid, id, () => ({ name })),

        updateGoalTarget: (uid, id, targetAmount) => updateGoal(uid, id, () => ({ targetAmount })),

        removeGoal: async (uid, id) => {
            await deleteGoal(uid, id);
            set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
        },
    };
});
