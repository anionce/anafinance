import type { Transaction } from "../types/Transaction";
import type { CategoryBudget } from "../types/Budget";

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const pad = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key: string): Date => {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export const toMonthKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

export const getCurrentMonth = (): string => toMonthKey(new Date());

export const shiftMonth = (month: string, delta: number): string => {
    const [year, monthIndex] = month.split("-").map(Number);
    return toMonthKey(new Date(year, monthIndex - 1 + delta, 1));
};

export const getAvailableMonths = (transactions: Transaction[]): string[] =>
    Array.from(new Set(transactions.map((t) => t.date.slice(0, 7)).filter((m) => /^\d{4}-\d{2}$/.test(m))))
        .sort()
        .reverse();

export const getAvailableYears = (transactions: Transaction[]): string[] =>
    Array.from(new Set(transactions.map((t) => t.date.slice(0, 4)).filter((y) => /^\d{4}$/.test(y))))
        .sort()
        .reverse();

export const filterByMonth = (transactions: Transaction[], month: string): Transaction[] =>
    transactions.filter((t) => t.date.startsWith(month));

export const getCurrentBimonthlyPeriod = (): string => {
    const [year, month] = getCurrentMonth().split("-").map(Number);
    const pairIndex = Math.ceil(month / 2);
    return `${year}-P${pairIndex}`;
};

export const filterByBimonthlyPeriod = (transactions: Transaction[], period: string): Transaction[] => {
    const [yearStr, pairStr] = period.split("-P");
    const year = Number(yearStr);
    const pairIndex = Number(pairStr);
    const startMonth = (pairIndex - 1) * 2 + 1;
    const endMonth = startMonth + 1;

    return transactions.filter((t) => {
        const [txYear, txMonth] = t.date.split("-").map(Number);
        return txYear === year && (txMonth === startMonth || txMonth === endMonth);
    });
};

export const getCurrentNMonthPeriod = (intervalMonths: number): string => {
    const [year, month] = getCurrentMonth().split("-").map(Number);
    const blockIndex = Math.ceil(month / intervalMonths);
    return `${year}-N${intervalMonths}-${blockIndex}`;
};

export const filterByNMonthPeriod = (transactions: Transaction[], period: string, intervalMonths: number): Transaction[] => {
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
};

export const getCurrentYear = (): string => String(new Date().getFullYear());

export const filterByYear = (transactions: Transaction[], year: string): Transaction[] =>
    transactions.filter((t) => t.date.startsWith(year));

const getISOWeekString = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

export const getCurrentWeek = (): string => getISOWeekString(new Date());

export const filterByWeek = (transactions: Transaction[], week: string): Transaction[] =>
    transactions.filter((t) => getISOWeekString(parseDateKey(t.date)) === week);

export const filterByBudgetPeriod = (transactions: Transaction[], budget: CategoryBudget): Transaction[] => {
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
};

export const monthlyEquivalentAmount = (budget: CategoryBudget): number => {
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
};

export interface DateFilter {
    mode: "monthly" | "annual" | "custom";
    month: string;
    year: string;
    from: string;
    to: string;
}

export const defaultDateFilter = (): DateFilter => {
    const now = getCurrentMonth();
    return { mode: "monthly", month: now, year: now.slice(0, 4), from: now + "-01", to: now + "-28" };
};

export const filterByDateFilter = (transactions: Transaction[], filter: DateFilter): Transaction[] => {
    switch (filter.mode) {
        case "annual":
            return filterByYear(transactions, filter.year);
        case "custom":
            return transactions.filter((t) => t.date >= filter.from && t.date <= filter.to);
        case "monthly":
        default:
            return filterByMonth(transactions, filter.month);
    }
};

export const sortByDateDesc = (transactions: Transaction[]): Transaction[] =>
    [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const formatMonthLabel = (month: string, locale: string): string => {
    const [year, monthIndex] = month.split("-").map(Number);
    if (!year || !monthIndex) return month;
    const date = new Date(year, monthIndex - 1, 1);
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" }).format(date);
};

export const formatShortDate = (iso: string, locale: string): string => {
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso;
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(year, month - 1, day),
    );
};
