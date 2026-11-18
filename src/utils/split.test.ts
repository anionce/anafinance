import { describe, expect, it } from "vitest";
import { halfAndHalf, isValidSplit, remainingToSplit, splitIntoTransactions } from "./split";
import { makeTransaction } from "../test/factories";

describe("split", () => {
    const tx = makeTransaction({ id: "t1", amount: -10.01, category: "ropa", description: "Zara", notes: "gift" });

    it("starts with two halves that add up to the total", () => {
        const portions = halfAndHalf(tx, "casa");
        expect(portions).toEqual([
            { category: "ropa", amount: "5.01" },
            { category: "casa", amount: "5" },
        ]);
        expect(remainingToSplit(10.01, portions)).toBe(0);
    });

    it("is valid only with two or more positive portions that cover the total", () => {
        expect(
            isValidSplit(10, [
                { category: "a", amount: "4" },
                { category: "b", amount: "6" },
            ]),
        ).toBe(true);
        expect(isValidSplit(10, [{ category: "a", amount: "10" }])).toBe(false);
        expect(
            isValidSplit(10, [
                { category: "a", amount: "4" },
                { category: "b", amount: "5" },
            ]),
        ).toBe(false);
        expect(
            isValidSplit(10, [
                { category: "", amount: "4" },
                { category: "b", amount: "6" },
            ]),
        ).toBe(false);
    });

    it("creates one transaction per portion, keeping sign, notes and the original amount", () => {
        const parts = splitIntoTransactions(
            tx,
            [
                { category: "ropa", amount: 6 },
                { category: "casa", amount: 4.01 },
            ],
            123,
        );
        expect(parts).toEqual([
            {
                id: "t1_split0_123",
                date: tx.date,
                description: "Zara (1/2)",
                amount: -6,
                category: "ropa",
                notes: "gift",
                splitFromAmount: -10.01,
            },
            { id: "t1_split1_123", date: tx.date, description: "Zara (2/2)", amount: -4.01, category: "casa", notes: "gift" },
        ]);
    });
});
