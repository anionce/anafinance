import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../types/Settings";
import { normalizeBudgetHistory, normalizeCategoryBudgets, settingsFromDocument, settingsToDocument } from "./settingsDocument";

describe("settings document mapping", () => {
    it("fills missing fields with defaults", () => {
        expect(settingsFromDocument({})).toEqual(DEFAULT_SETTINGS);
    });

    it("reads and writes the legacy estimated income field", () => {
        expect(settingsFromDocument({ ingresosEstimados: 1800 }).estimatedIncome).toBe(1800);
        expect(settingsToDocument({ estimatedIncome: 1800, savingsTarget: 100 })).toEqual({ ingresosEstimados: 1800, savingsTarget: 100 });
        expect(settingsToDocument({ savingsTarget: 100 })).toEqual({ savingsTarget: 100 });
    });

    it("upgrades budgets stored as plain numbers", () => {
        expect(normalizeCategoryBudgets({ ropa: 30, libros: { amount: 10, period: "yearly" }, broken: "x" })).toEqual({
            ropa: { amount: 30, period: "monthly" },
            libros: { amount: 10, period: "yearly" },
        });
        expect(normalizeBudgetHistory({ "2026-01": { ropa: 5 } })).toEqual({ "2026-01": { ropa: { amount: 5, period: "monthly" } } });
        expect(normalizeBudgetHistory(null)).toEqual({});
    });
});
