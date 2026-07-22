import type { Transaction } from "../types/Transaction";
import type { CategoryBudget } from "../types/Budget";

export function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
    return Array.from(new Set(transactions.map((t) => t.date.slice(0, 7))))
        .sort()
        .reverse();
}

export function getAvailableYears(transactions: Transaction[]): string[] {
    return Array.from(new Set(transactions.map((t) => t.date.slice(0, 4))))
        .sort()
        .reverse();
}

export function filterByMonth(transactions: Transaction[], month: string): Transaction[] {
    return transactions.filter((t) => t.date.startsWith(month));
}

/**
 * Bimonthly periods are calendar-aligned pairs (Jan-Feb, Mar-Apr, ...),
 * identified as "YYYY-Pn" where n is 1-6.
 */
export function getCurrentBimonthlyPeriod(): string {
    const [year, month] = getCurrentMonth().split("-").map(Number);
    const pairIndex = Math.ceil(month / 2);
    return `${year}-P${pairIndex}`;
}

export function filterByBimonthlyPeriod(transactions: Transaction[], period: string): Transaction[] {
    const [yearStr, pairStr] = period.split("-P");
    const year = Number(yearStr);
    const pairIndex = Number(pairStr);
    const startMonth = (pairIndex - 1) * 2 + 1;
    const endMonth = startMonth + 1;

    return transactions.filter((t) => {
        const [txYear, txMonth] = t.date.split("-").map(Number);
        return txYear === year && (txMonth === startMonth || txMonth === endMonth);
    });
}

/** Calendar-aligned blocks of `intervalMonths`, counted from January, identified as "YYYY-N{interval}-{blockIndex}". */
export function getCurrentNMonthPeriod(intervalMonths: number): string {
    const [year, month] = getCurrentMonth().split("-").map(Number);
    const blockIndex = Math.ceil(month / intervalMonths);
    return `${year}-N${intervalMonths}-${blockIndex}`;
}

export function filterByNMonthPeriod(transactions: Transaction[], period: string, intervalMonths: number): Transaction[] {
    const match = period.match(/^(\d+)-N\d+-(\d+)$/);
    if (!match) return [];
    const year = Number(match[1]);
    const blockIndex = Number(match[2]);
    const startMonth = (blockIndex - 1) * intervalMonths + 1;
    const endMonth = startMonth + intervalMonths - 1;

    return transactions.filter((t) => {
        const [txYear, txMonth] = t.date.split("-").map(Number);
        return txYear === year && txMonth >= startMonth && txMonth <= endMonth;
    });
}

export function getCurrentYear(): string {
    return String(new Date().getFullYear());
}

export function filterByYear(transactions: Transaction[], year: string): Transaction[] {
    return transactions.filter((t) => t.date.startsWith(year));
}

function getISOWeekString(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getCurrentWeek(): string {
    return getISOWeekString(new Date());
}

export function filterByWeek(transactions: Transaction[], week: string): Transaction[] {
    return transactions.filter((t) => getISOWeekString(new Date(t.date)) === week);
}

/** Filters transactions down to a budget's own current period, whatever that period is. */
export function filterByBudgetPeriod(transactions: Transaction[], budget: CategoryBudget): Transaction[] {
    switch (budget.period) {
        case "weekly":
            return filterByWeek(transactions, getCurrentWeek());
        case "bimonthly":
            return filterByBimonthlyPeriod(transactions, getCurrentBimonthlyPeriod());
        case "everyNMonths": {
            const interval = Math.max(budget.intervalMonths ?? 1, 1);
            return filterByNMonthPeriod(transactions, getCurrentNMonthPeriod(interval), interval);
        }
        case "yearly":
            return filterByYear(transactions, getCurrentYear());
        case "monthly":
        default:
            return filterByMonth(transactions, getCurrentMonth());
    }
}

/** Converts any budget period's amount into its monthly-equivalent, so periods can blend into a single monthly view. */
export function monthlyEquivalentAmount(budget: CategoryBudget): number {
    switch (budget.period) {
        case "weekly":
            return budget.amount * (52 / 12);
        case "bimonthly":
            return budget.amount / 2;
        case "everyNMonths":
            return budget.amount / Math.max(budget.intervalMonths ?? 1, 1);
        case "yearly":
            return budget.amount / 12;
        case "monthly":
        default:
            return budget.amount;
    }
}

export interface DateFilter {
    mode: "monthly" | "annual" | "custom";
    month: string;
    year: string;
    from: string;
    to: string;
}

export function defaultDateFilter(): DateFilter {
    const now = getCurrentMonth();
    return { mode: "monthly", month: now, year: now.slice(0, 4), from: now + "-01", to: now + "-28" };
}

export function filterByDateFilter(transactions: Transaction[], filter: DateFilter): Transaction[] {
    switch (filter.mode) {
        case "annual":
            return filterByYear(transactions, filter.year);
        case "custom":
            return transactions.filter((t) => t.date >= filter.from && t.date <= filter.to);
        case "monthly":
        default:
            return filterByMonth(transactions, filter.month);
    }
}

export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
