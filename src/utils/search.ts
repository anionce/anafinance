import type { Transaction } from "../types/Transaction";

export const matchesTransactionSearch = (tx: Transaction, query: string): boolean => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    if (tx.description.toLowerCase().includes(q)) return true;

    const amountStr = Math.abs(tx.amount).toString();
    return amountStr.includes(q.replace(",", "."));
};
