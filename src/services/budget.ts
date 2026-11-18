import type { Transaction } from "../types/Transaction";
import type { CategoryBudget } from "../types/Budget";
import { filterByBudgetPeriod, monthlyEquivalentAmount, getCurrentMonth } from "../utils/dates";

export const calculateSpentByCategory = (transactions: Transaction[], budgets: Record<string, CategoryBudget>): Record<string, number> => {
    const spentByCategory: Record<string, number> = {};

    for (const [key, budget] of Object.entries(budgets)) {
        const periodTransactions = filterByBudgetPeriod(transactions, budget);

        spentByCategory[key] = periodTransactions
            .filter((t) => t.amount < 0 && t.category === key)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    return spentByCategory;
};

export const calculateTotalSpent = (transactions: Transaction[]): number =>
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

export const calculateTotalIncome = (transactions: Transaction[]): number =>
    transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

export const calculateTotalBudget = (budgets: Record<string, CategoryBudget>): number =>
    Object.values(budgets).reduce((sum, b) => sum + monthlyEquivalentAmount(b), 0);

export const calculateMaxSpending = (estimatedIncome: number, savingsTarget: number): number =>
    Math.max(estimatedIncome - savingsTarget, 0);

export const calculateRemaining = (spent: number, budget: number): number => budget - spent;

export const calculateAmountByCategory = (transactions: Transaction[]): Record<string, number> => {
    const byCategory: Record<string, number> = {};
    for (const t of transactions) {
        const key = t.category || "sin_categoria";
        byCategory[key] = (byCategory[key] ?? 0) + Math.abs(t.amount);
    }
    return byCategory;
};

export const calculatePercentage = (value: number, total: number): number => {
    if (total <= 0) return 0;
    return Math.min((value / total) * 100, 100);
};

export const calculateRawPercentage = (value: number, total: number): number => {
    if (total <= 0) return 0;
    return (value / total) * 100;
};

export const getBudgetForMonth = (
    budgetHistory: Record<string, Record<string, CategoryBudget>>,
    currentBudgets: Record<string, CategoryBudget>,
    month: string,
): Record<string, CategoryBudget> => {
    if (month === getCurrentMonth()) return currentBudgets;
    const priorMonths = Object.keys(budgetHistory)
        .filter((m) => m <= month)
        .sort();
    if (priorMonths.length === 0) return currentBudgets;
    return budgetHistory[priorMonths[priorMonths.length - 1]];
};

export const calculateSpentByCategoryForMonth = (transactions: Transaction[], month: string): Record<string, number> => {
    const spentByCategory: Record<string, number> = {};
    for (const t of transactions) {
        if (t.amount >= 0 || !t.date.startsWith(month)) continue;
        spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + Math.abs(t.amount);
    }
    return spentByCategory;
};

export type BudgetStatus = "great" | "ok" | "tight" | "over";

const OK_FROM_PERCENT = 40;
const TIGHT_FROM_PERCENT = 75;

export const budgetStatus = (spent: number, budget: number): BudgetStatus => {
    if (spent > budget) return "over";
    const usedPercent = calculatePercentage(spent, budget);
    if (usedPercent > TIGHT_FROM_PERCENT) return "tight";
    if (usedPercent > OK_FROM_PERCENT) return "ok";
    return "great";
};
