import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateInsights } from "./insights";
import { makeCategory, makeTransaction } from "../test/factories";

describe("generateInsights", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 2, 20));
    });
    afterEach(() => vi.useRealTimers());

    const ropa = makeCategory({ value: "ropa", label: "👕 Ropa" });

    it("returns nothing without transactions", () => {
        expect(generateInsights([], [ropa], "es")).toEqual([]);
    });

    it("compares this month's spending with the previous one", () => {
        const txs = [
            makeTransaction({ date: "2026-02-10", amount: -100 }),
            makeTransaction({ date: "2026-03-10", amount: -50, category: "ropa" }),
        ];
        expect(generateInsights(txs, [ropa], "es")).toContain("💚 Este mes has gastado un 50% menos que el anterior.");
    });

    it("counts days without spending in a category, bounded by the history", () => {
        const txs = [makeTransaction({ date: "2026-03-01", amount: -5, category: "otra" })];
        expect(generateInsights(txs, [ropa], "es")).toContain("👕 Llevas 19 días sin gastar en Ropa.");
    });

    it("skips categories that never count as spending", () => {
        const txs = [makeTransaction({ date: "2026-01-01" })];
        const hidden = makeCategory({ label: "🚫 Hidden", noComputable: true });
        expect(generateInsights(txs, [hidden], "es")).toEqual([]);
    });
});
