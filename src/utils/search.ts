import type { Transaction } from "../types/Transaction";

/** Matches a transaction against a free-text query on either its description or its amount. */
export function matchesTransactionSearch(tx: Transaction, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    if (tx.description.toLowerCase().includes(q)) return true;

    const amountStr = Math.abs(tx.amount).toString();
    return amountStr.includes(q.replace(",", "."));
}
