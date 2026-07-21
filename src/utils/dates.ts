import type { Transaction } from "../types/Transaction";

export function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

export function getAvailableMonths(transactions: Transaction[]): string[] {
    return Array.from(new Set(transactions.map((t) => t.date.slice(0, 7))))
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

export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
