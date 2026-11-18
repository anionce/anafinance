import { describe, expect, it } from "vitest";
import { isBudgetable, parseAmount, parseBudgetDraft, parseBudgetDrafts, toBudgetDraft, toBudgetDrafts } from "./budgetDrafts";
import { makeCategory } from "../test/factories";

describe("budget drafts", () => {
    it("round-trips a saved budget", () => {
        const budget = { amount: 90, period: "everyNMonths" as const, intervalMonths: 3 };
        expect(parseBudgetDraft(toBudgetDraft(budget))).toEqual(budget);
    });

    it("starts empty drafts as monthly with a default interval", () => {
        expect(toBudgetDraft()).toEqual({ amount: "", period: "monthly", intervalMonths: "3" });
    });

    it("drops empty, zero and invalid amounts", () => {
        expect(
            parseBudgetDrafts({ a: toBudgetDraft(), b: { ...toBudgetDraft(), amount: "0" }, c: { ...toBudgetDraft(), amount: "x" } }),
        ).toEqual({});
    });

    it("keeps the interval only for every-N-months budgets, at least 1", () => {
        expect(parseBudgetDraft({ amount: "20", period: "monthly", intervalMonths: "6" })).toEqual({ amount: 20, period: "monthly" });
        expect(parseBudgetDraft({ amount: "20", period: "everyNMonths", intervalMonths: "0" })).toEqual({
            amount: 20,
            period: "everyNMonths",
            intervalMonths: 1,
        });
    });

    it("builds drafts for each category", () => {
        const ropa = makeCategory({ value: "ropa" });
        expect(toBudgetDrafts([ropa], { ropa: { amount: 5, period: "yearly" } })).toEqual({
            ropa: { amount: "5", period: "yearly", intervalMonths: "3" },
        });
    });

    it("parses amounts with a fallback", () => {
        expect(parseAmount("12", 0)).toBe(12);
        expect(parseAmount("-1", 7)).toBe(7);
        expect(parseAmount(" ", 7)).toBe(7);
    });

    it("only budgets categories that count as spending", () => {
        expect(isBudgetable(makeCategory())).toBe(true);
        expect(isBudgetable(makeCategory({ noComputable: true }))).toBe(false);
        expect(isBudgetable(makeCategory({ incomeOnly: true }))).toBe(false);
    });
});
