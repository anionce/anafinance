import { describe, expect, it } from "vitest";
import { historyMonths, monthBudgetReport } from "./budgetHistory";
import { makeCategory, makeTransaction } from "../test/factories";

describe("historyMonths", () => {
    it("lists data, history and the next 12 months, newest first, without repeats", () => {
        const months = historyMonths("2026-03", "2026-03", [makeTransaction({ date: "2025-11-02" })], { "2026-01": {} });
        expect(months[0]).toBe("2027-03");
        expect(months).toContain("2026-03");
        expect(months).toContain("2026-01");
        expect(months.at(-1)).toBe("2025-11");
        expect(new Set(months).size).toBe(months.length);
    });
});

describe("monthBudgetReport", () => {
    it("builds per-category rows and totals for a past month", () => {
        const ropa = makeCategory({ value: "ropa" });
        const libros = makeCategory({ value: "libros" });
        const hidden = makeCategory({ value: "hidden", noComputable: true });
        const history = {
            "2026-01": { ropa: { amount: 60, period: "monthly" as const }, libros: { amount: 120, period: "yearly" as const } },
        };
        const txs = [
            makeTransaction({ category: "ropa", amount: -80, date: "2026-02-03" }),
            makeTransaction({ category: "hidden", amount: -999, date: "2026-02-03" }),
        ];

        const report = monthBudgetReport("2026-02", [ropa, libros, hidden], txs, history, {});

        expect(report.rows.map((r) => [r.category.value, r.budgetAmount, r.spent, r.remaining])).toEqual([
            ["ropa", 60, 80, -20],
            ["libros", 10, 0, 10],
        ]);
        expect(report.totalBudget).toBe(70);
        expect(report.totalSpent).toBe(80);
    });
});
