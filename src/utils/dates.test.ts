import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    filterByBimonthlyPeriod,
    filterByBudgetPeriod,
    filterByDateFilter,
    filterByNMonthPeriod,
    formatMonthLabel,
    formatShortDate,
    getAvailableMonths,
    getCurrentMonth,
    monthlyEquivalentAmount,
    shiftMonth,
    sortByDateDesc,
    toDateKey,
} from "./dates";
import { makeTransaction } from "../test/factories";

describe("current month", () => {
    afterEach(() => vi.useRealTimers());

    it("uses the local date, not UTC, right after midnight on the first", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 3, 1, 0, 30));
        expect(getCurrentMonth()).toBe("2026-04");
        expect(toDateKey(new Date())).toBe("2026-04-01");
    });
});

describe("shiftMonth", () => {
    it("moves across year boundaries", () => {
        expect(shiftMonth("2026-01", -1)).toBe("2025-12");
        expect(shiftMonth("2025-12", 1)).toBe("2026-01");
        expect(shiftMonth("2026-03", 12)).toBe("2027-03");
    });
});

describe("period filters", () => {
    const jan = makeTransaction({ date: "2026-01-15" });
    const feb = makeTransaction({ date: "2026-02-03" });
    const mar = makeTransaction({ date: "2026-03-20" });
    const all = [jan, feb, mar];

    it("groups bimonthly periods as calendar pairs", () => {
        expect(filterByBimonthlyPeriod(all, "2026-P1")).toEqual([jan, feb]);
        expect(filterByBimonthlyPeriod(all, "2026-P2")).toEqual([mar]);
    });

    it("groups every-N-month blocks from January", () => {
        expect(filterByNMonthPeriod(all, "2026-N3-1", 3)).toEqual(all);
        expect(filterByNMonthPeriod(all, "invalid", 3)).toEqual([]);
    });

    it("filters by the date filter mode", () => {
        expect(filterByDateFilter(all, { mode: "monthly", month: "2026-02", year: "", from: "", to: "" })).toEqual([feb]);
        expect(filterByDateFilter(all, { mode: "annual", month: "", year: "2026", from: "", to: "" })).toEqual(all);
        expect(filterByDateFilter(all, { mode: "custom", month: "", year: "", from: "2026-02-01", to: "2026-03-01" })).toEqual([feb]);
    });
});

describe("filterByBudgetPeriod", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 4, 20));
    });
    afterEach(() => vi.useRealTimers());

    it("keeps only the current period of each budget", () => {
        const thisMonth = makeTransaction({ date: "2026-05-02" });
        const lastMonth = makeTransaction({ date: "2026-04-28" });
        const lastYear = makeTransaction({ date: "2025-05-02" });
        const all = [thisMonth, lastMonth, lastYear];

        expect(filterByBudgetPeriod(all, { amount: 10, period: "monthly" })).toEqual([thisMonth]);
        expect(filterByBudgetPeriod(all, { amount: 10, period: "yearly" })).toEqual([thisMonth, lastMonth]);
        expect(filterByBudgetPeriod(all, { amount: 10, period: "everyNMonths", intervalMonths: 6 })).toEqual([thisMonth, lastMonth]);
    });
});

describe("monthlyEquivalentAmount", () => {
    it("converts every period to a monthly amount", () => {
        expect(monthlyEquivalentAmount({ amount: 12, period: "monthly" })).toBe(12);
        expect(monthlyEquivalentAmount({ amount: 12, period: "yearly" })).toBe(1);
        expect(monthlyEquivalentAmount({ amount: 12, period: "bimonthly" })).toBe(6);
        expect(monthlyEquivalentAmount({ amount: 12, period: "everyNMonths", intervalMonths: 4 })).toBe(3);
        expect(monthlyEquivalentAmount({ amount: 12, period: "everyNMonths", intervalMonths: 0 })).toBe(12);
        expect(monthlyEquivalentAmount({ amount: 12, period: "weekly" })).toBe(52);
    });
});

describe("lists and labels", () => {
    it("lists available months newest first, ignoring bad dates", () => {
        const txs = [makeTransaction({ date: "2026-01-01" }), makeTransaction({ date: "2026-03-01" }), makeTransaction({ date: "" })];
        expect(getAvailableMonths(txs)).toEqual(["2026-03", "2026-01"]);
    });

    it("sorts by date descending without mutating", () => {
        const txs = [makeTransaction({ date: "2026-01-01" }), makeTransaction({ date: "2026-03-01" })];
        expect(sortByDateDesc(txs).map((t) => t.date)).toEqual(["2026-03-01", "2026-01-01"]);
        expect(txs[0].date).toBe("2026-01-01");
    });

    it("formats labels and falls back to the raw value", () => {
        expect(formatMonthLabel("2026-07", "es")).toBe("julio de 2026");
        expect(formatMonthLabel("bad", "es")).toBe("bad");
        expect(formatShortDate("2026-07-04", "en")).toBe("Jul 4, 2026");
        expect(formatShortDate("bad", "en")).toBe("bad");
    });
});
