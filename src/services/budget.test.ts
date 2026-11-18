import { afterEach, describe, expect, it, vi } from "vitest";
import {
    budgetStatus,
    calculateAmountByCategory,
    calculateMaxSpending,
    calculatePercentage,
    calculateRawPercentage,
    calculateSpentByCategoryForMonth,
    calculateTotalBudget,
    calculateTotalIncome,
    calculateTotalSpent,
    getBudgetForMonth,
} from "./budget";
import { makeTransaction } from "../test/factories";

describe("totals", () => {
    const txs = [makeTransaction({ amount: -30 }), makeTransaction({ amount: -20 }), makeTransaction({ amount: 100 })];

    it("sums spending and income separately", () => {
        expect(calculateTotalSpent(txs)).toBe(50);
        expect(calculateTotalIncome(txs)).toBe(100);
    });

    it("groups absolute amounts by category, with a fallback key", () => {
        const byCategory = calculateAmountByCategory([makeTransaction({ category: "ropa", amount: -5 }), makeTransaction({ amount: -2 })]);
        expect(byCategory).toEqual({ ropa: 5, sin_categoria: 2 });
    });

    it("adds every budget as its monthly equivalent", () => {
        expect(calculateTotalBudget({ a: { amount: 10, period: "monthly" }, b: { amount: 120, period: "yearly" } })).toBe(20);
    });

    it("never allows negative max spending", () => {
        expect(calculateMaxSpending(2000, 500)).toBe(1500);
        expect(calculateMaxSpending(100, 500)).toBe(0);
    });
});

describe("percentages", () => {
    it("caps the bar percentage at 100 and handles a zero total", () => {
        expect(calculatePercentage(50, 200)).toBe(25);
        expect(calculatePercentage(300, 200)).toBe(100);
        expect(calculatePercentage(10, 0)).toBe(0);
    });

    it("keeps the raw percentage uncapped for text", () => {
        expect(calculateRawPercentage(300, 200)).toBe(150);
        expect(calculateRawPercentage(1, 0)).toBe(0);
    });
});

describe("budgetStatus", () => {
    it("goes from great to over as spending grows", () => {
        expect(budgetStatus(10, 100)).toBe("great");
        expect(budgetStatus(50, 100)).toBe("ok");
        expect(budgetStatus(80, 100)).toBe("tight");
        expect(budgetStatus(101, 100)).toBe("over");
    });
});

describe("getBudgetForMonth", () => {
    afterEach(() => vi.useRealTimers());

    const current = { ropa: { amount: 50, period: "monthly" as const } };
    const history = {
        "2026-01": { ropa: { amount: 10, period: "monthly" as const } },
        "2026-03": { ropa: { amount: 30, period: "monthly" as const } },
    };

    it("carries the closest earlier snapshot forward", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 5, 1));
        expect(getBudgetForMonth(history, current, "2026-02")).toBe(history["2026-01"]);
        expect(getBudgetForMonth(history, current, "2026-04")).toBe(history["2026-03"]);
        expect(getBudgetForMonth(history, current, "2025-12")).toBe(current);
    });

    it("always uses the live budget for the current month", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 2, 15));
        expect(getBudgetForMonth(history, current, "2026-03")).toBe(current);
    });
});

describe("calculateSpentByCategoryForMonth", () => {
    it("only counts expenses of that month", () => {
        const txs = [
            makeTransaction({ category: "ropa", amount: -10, date: "2026-03-01" }),
            makeTransaction({ category: "ropa", amount: 5, date: "2026-03-02" }),
            makeTransaction({ category: "ropa", amount: -7, date: "2026-04-01" }),
        ];
        expect(calculateSpentByCategoryForMonth(txs, "2026-03")).toEqual({ ropa: 10 });
    });
});
