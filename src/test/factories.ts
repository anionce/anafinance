import type { Category } from "../types/Category";
import type { Transaction } from "../types/Transaction";

let nextId = 0;

export const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => {
    nextId++;
    return { id: `tx-${nextId}`, date: "2026-03-10", description: `Movement ${nextId}`, amount: -10, category: "", ...overrides };
};

export const makeCategory = (overrides: Partial<Category> = {}): Category => {
    nextId++;
    return { value: `category_${nextId}`, label: `Category ${nextId}`, ...overrides };
};
