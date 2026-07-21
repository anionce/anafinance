import type { Transaction } from "../types/Transaction";
import type { CategoryBudget } from "../types/Budget";
import { getCurrentMonth, getCurrentBimonthlyPeriod, filterByMonth, filterByBimonthlyPeriod } from "../utils/dates";

/** Per-category spend for the category's own current period (month or bimonthly pair). */
export function calculateSpentByCategory(
    transactions: Transaction[],
    budgets: Record<string, CategoryBudget>
): Record<string, number> {
    const spentByCategory: Record<string, number> = {};
    const currentMonth = getCurrentMonth();
    const currentBimonthlyPeriod = getCurrentBimonthlyPeriod();

    for (const [key, budget] of Object.entries(budgets)) {
        const periodTransactions = budget.period === "bimonthly"
            ? filterByBimonthlyPeriod(transactions, currentBimonthlyPeriod)
            : filterByMonth(transactions, currentMonth);

        spentByCategory[key] = periodTransactions
            .filter((t) => t.amount < 0 && t.category === key)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    return spentByCategory;
}

export function calculateTotalSpent(transactions: Transaction[], budgets: Record<string, CategoryBudget>): number {
    return transactions
        .filter((t) => t.amount < 0 && t.category in budgets)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

export function calculateTotalIncome(transactions: Transaction[]): number {
    return transactions
        .filter((t) => t.amount > 0 && t.category !== "no_computable")
        .reduce((sum, t) => sum + t.amount, 0);
}

/** Monthly-equivalent total, halving bimonthly budgets so they blend into the monthly view. */
export function calculateTotalBudget(budgets: Record<string, CategoryBudget>): number {
    return Object.values(budgets).reduce(
        (sum, b) => sum + (b.period === "bimonthly" ? b.amount / 2 : b.amount),
        0
    );
}

export function calculateRemaining(spent: number, budget: number): number {
    return budget - spent;
}

export function calculateAmountByCategory(transactions: Transaction[]): Record<string, number> {
    const byCategory: Record<string, number> = {};
    for (const t of transactions) {
        const key = t.category || "sin_categoria";
        byCategory[key] = (byCategory[key] ?? 0) + Math.abs(t.amount);
    }
    return byCategory;
}

export function calculatePercentage(value: number, total: number): number {
    return Math.min((value / total) * 100, 100);
}

/** Same as calculatePercentage but uncapped, for text display (e.g. "189%"). */
export function calculateRawPercentage(value: number, total: number): number {
    if (total <= 0) return 0;
    return (value / total) * 100;
}
