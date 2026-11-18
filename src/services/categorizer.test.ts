import { describe, expect, it } from "vitest";
import { applyCategorizationRules, categorize, sumGoalContributions } from "./categorizer";
import { makeTransaction } from "../test/factories";

describe("categorize", () => {
    it("matches built-in keywords case-insensitively", () => {
        expect(categorize("MERCADONA VALENCIA", -40)).toBe("supermercado");
        expect(categorize("Pago Netflix", -12)).toBe("servicios_online");
    });

    it("treats Vinted as clothing only when it is a purchase", () => {
        expect(categorize("Vinted compra", -15)).toBe("ropa");
        expect(categorize("Vinted venta", 15)).toBeNull();
    });

    it("leaves Amazon and unknown descriptions for manual review", () => {
        expect(categorize("AMAZON, BIZ pedido", -30)).toBeNull();
        expect(categorize("Something else", -1)).toBeNull();
    });
});

describe("user rules", () => {
    const rules = [
        { id: "1", keyword: "gym club", category: "wellness" },
        { id: "2", keyword: "piggy", category: "transferencia", goalId: "goal-1" },
        { id: "3", keyword: "  ", category: "ignored" },
    ];

    it("override the category of matching transactions", () => {
        const [gym, other] = applyCategorizationRules(
            [makeTransaction({ description: "GYM CLUB monthly" }), makeTransaction({ description: "Other" })],
            rules,
        );
        expect(gym.category).toBe("wellness");
        expect(other.category).toBe("");
    });

    it("credit linked goals with the absolute amount", () => {
        const contributions = sumGoalContributions(
            [makeTransaction({ description: "Piggy bank", amount: -50 }), makeTransaction({ description: "piggy", amount: 20 })],
            rules,
        );
        expect(contributions).toEqual(new Map([["goal-1", 70]]));
    });
});
