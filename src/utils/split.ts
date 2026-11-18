import type { Transaction } from "../types/Transaction";

export interface SplitPortion {
    category: string;
    amount: string;
}

const roundCents = (value: number) => Math.round(value * 100) / 100;

export const halfAndHalf = (transaction: Transaction, fallbackCategory: string): SplitPortion[] => {
    const total = Math.abs(transaction.amount);
    const half = roundCents(total / 2);
    return [
        { category: transaction.category || fallbackCategory, amount: String(half) },
        { category: fallbackCategory, amount: String(roundCents(total - half)) },
    ];
};

const CENT = 0.01;
const MIN_PORTIONS = 2;

export const remainingToSplit = (total: number, portions: SplitPortion[]): number =>
    roundCents(total - portions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0));

export const isFullyAssigned = (remaining: number) => Math.abs(remaining) < CENT;

export const canSplit = (portions: unknown[]) => portions.length >= MIN_PORTIONS;

export const isValidSplit = (total: number, portions: SplitPortion[]): boolean =>
    canSplit(portions) && portions.every((p) => p.category && Number(p.amount) > 0) && isFullyAssigned(remainingToSplit(total, portions));

export const splitIntoTransactions = (
    original: Transaction,
    portions: { category: string; amount: number }[],
    splitAt: number,
): Transaction[] => {
    const sign = original.amount < 0 ? -1 : 1;
    return portions.map((portion, i) => ({
        id: `${original.id}_split${i}_${splitAt}`,
        date: original.date,
        description: `${original.description} (${i + 1}/${portions.length})`,
        amount: sign * Math.abs(portion.amount),
        category: portion.category,
        ...(original.notes !== undefined && { notes: original.notes }),
        ...(i === 0 && { splitFromAmount: original.amount }),
    }));
};
