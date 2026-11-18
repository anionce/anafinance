import { describe, expect, it } from "vitest";
import { findNewTransactions } from "./transactionMatching";
import { makeTransaction } from "../test/factories";

describe("findNewTransactions", () => {
    it("matches by date and amount, counting repeated rows", () => {
        const coffee = { date: "2026-03-01", amount: -2 };
        const existing = [makeTransaction(coffee)];
        const incoming = [makeTransaction(coffee), makeTransaction(coffee), makeTransaction({ date: "2026-03-02", amount: -5 })];

        expect(findNewTransactions(existing, incoming)).toEqual([incoming[1], incoming[2]]);
    });

    it("ignores ids and descriptions, which change between exports", () => {
        const existing = [makeTransaction({ id: "old-hash", description: "Concepto", date: "2026-03-01", amount: -9 })];
        expect(
            findNewTransactions(existing, [makeTransaction({ id: "new-hash", description: "Concepte", date: "2026-03-01", amount: -9 })]),
        ).toEqual([]);
    });

    it("recognizes a row that was split after importing", () => {
        const existing = [
            makeTransaction({ date: "2026-03-01", amount: -60, splitFromAmount: -100 }),
            makeTransaction({ date: "2026-03-01", amount: -40 }),
        ];
        expect(findNewTransactions(existing, [makeTransaction({ date: "2026-03-01", amount: -100 })])).toEqual([]);
    });
});
