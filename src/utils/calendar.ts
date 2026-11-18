import type { Transaction } from "../types/Transaction";

const DAYS_PER_WEEK = 7;
const MONDAY_FIRST_OFFSET = 6;

const pad = (value: number) => String(value).padStart(2, "0");

export const monthGridCells = (month: string): (string | null)[] => {
    const [year, monthIndex] = month.split("-").map(Number);
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    const leadingBlanks = (new Date(year, monthIndex - 1, 1).getDay() + MONDAY_FIRST_OFFSET) % DAYS_PER_WEEK;
    const cells: (string | null)[] = [
        ...Array<null>(leadingBlanks).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${pad(i + 1)}`),
    ];
    while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);
    return cells;
};

export const groupByDay = (transactions: Transaction[], month: string): Map<string, Transaction[]> => {
    const byDay = new Map<string, Transaction[]>();
    for (const tx of transactions) {
        if (tx.date.startsWith(month)) byDay.set(tx.date, [...(byDay.get(tx.date) ?? []), tx]);
    }
    return byDay;
};
