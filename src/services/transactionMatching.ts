import type { Transaction } from "../types/Transaction";

const matchKey = (date: string, amount: number) => `${date}|${amount}`;

export const findNewTransactions = (existing: Transaction[], incoming: Transaction[]): Transaction[] => {
    const slots = new Map<string, number>();
    const occupy = (key: string) => slots.set(key, (slots.get(key) ?? 0) + 1);

    for (const t of existing) {
        occupy(matchKey(t.date, t.amount));
        if (t.splitFromAmount !== undefined) occupy(matchKey(t.date, t.splitFromAmount));
    }

    return incoming.filter((t) => {
        const key = matchKey(t.date, t.amount);
        const free = slots.get(key) ?? 0;
        if (free === 0) return true;
        slots.set(key, free - 1);
        return false;
    });
};
