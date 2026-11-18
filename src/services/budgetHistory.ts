import type { CategoryBudget } from "../types/Budget";
import type { Category } from "../types/Category";
import type { Transaction } from "../types/Transaction";
import { getAvailableMonths, monthlyEquivalentAmount, shiftMonth } from "../utils/dates";
import { calculateSpentByCategoryForMonth, getBudgetForMonth } from "./budget";

export interface BudgetRow {
    category: Category;
    budgetAmount: number;
    spent: number;
    remaining: number;
}

export interface MonthBudgetReport {
    effectiveBudgets: Record<string, CategoryBudget>;
    rows: BudgetRow[];
    totalBudget: number;
    totalSpent: number;
}

const FUTURE_MONTHS_AHEAD = 12;

export const historyMonths = (
    selectedMonth: string,
    currentMonth: string,
    transactions: Transaction[],
    budgetHistory: Record<string, Record<string, CategoryBudget>>,
): string[] => {
    const futureMonths = Array.from({ length: FUTURE_MONTHS_AHEAD }, (_, i) => shiftMonth(currentMonth, i + 1));
    const months = new Set([
        selectedMonth,
        currentMonth,
        ...futureMonths,
        ...getAvailableMonths(transactions),
        ...Object.keys(budgetHistory),
    ]);
    return [...months].sort().reverse();
};

export const monthBudgetReport = (
    month: string,
    categories: Category[],
    transactions: Transaction[],
    budgetHistory: Record<string, Record<string, CategoryBudget>>,
    currentBudgets: Record<string, CategoryBudget>,
): MonthBudgetReport => {
    const noComputable = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const effectiveBudgets = getBudgetForMonth(budgetHistory, currentBudgets, month);
    const spentByCategory = calculateSpentByCategoryForMonth(
        transactions.filter((tx) => !noComputable.has(tx.category)),
        month,
    );

    const rows = categories
        .filter((c) => !c.noComputable && !c.incomeOnly && (effectiveBudgets[c.value] || spentByCategory[c.value]))
        .map((category) => {
            const budget = effectiveBudgets[category.value];
            const budgetAmount = budget ? monthlyEquivalentAmount(budget) : 0;
            const spent = spentByCategory[category.value] ?? 0;
            return { category, budgetAmount, spent, remaining: budgetAmount - spent };
        })
        .sort((a, b) => b.spent - a.spent);

    return {
        effectiveBudgets,
        rows,
        totalBudget: rows.reduce((sum, r) => sum + r.budgetAmount, 0),
        totalSpent: rows.reduce((sum, r) => sum + r.spent, 0),
    };
};
