import { describe, expect, it } from "vitest";
import { hashTransaction } from "../services/hash";
import { getCategoryLabel, sortCategoriesAlphabetically } from "../i18n/categoryTranslations";
import { makeCategory, makeTransaction } from "../test/factories";
import { groupByDay, monthGridCells } from "./calendar";
import { deriveNewCategory, slugify } from "./categoryDrafts";
import { toCsv } from "./csv";
import { formatCurrency } from "./currency";
import { matchesTransactionSearch } from "./search";

describe("hashTransaction", () => {
    it("is stable and depends on date, amount and occurrence", () => {
        expect(hashTransaction("2026-01-01", -2)).toBe(hashTransaction("2026-01-01", -2, 0));
        expect(hashTransaction("2026-01-01", -2, 1)).not.toBe(hashTransaction("2026-01-01", -2, 0));
    });
});

describe("matchesTransactionSearch", () => {
    const tx = makeTransaction({ description: "Mercadona", amount: -12.5 });

    it("matches description or amount, accepting a decimal comma", () => {
        expect(matchesTransactionSearch(tx, " merca ")).toBe(true);
        expect(matchesTransactionSearch(tx, "12,5")).toBe(true);
        expect(matchesTransactionSearch(tx, "lidl")).toBe(false);
        expect(matchesTransactionSearch(tx, "")).toBe(true);
    });
});

describe("categories", () => {
    it("slugifies labels into ids", () => {
        expect(slugify("🎮 Videojuegos y Ocio!")).toBe("videojuegos_y_ocio");
        expect(deriveNewCategory("  Viajes ", [])).toEqual({ value: "viajes", label: "Viajes" });
        expect(deriveNewCategory("Viajes", [makeCategory({ value: "viajes" })])).toBeNull();
        expect(deriveNewCategory("   ", [])).toBeNull();
    });

    it("translates built-in labels unless the user renamed them", () => {
        expect(getCategoryLabel({ value: "libros", label: "📚 Libros" }, "en")).toBe("📚 Books");
        expect(getCategoryLabel({ value: "libros", label: "Mis libros", customLabel: true }, "en")).toBe("Mis libros");
    });

    it("sorts by name ignoring the emoji", () => {
        const sorted = sortCategoriesAlphabetically([makeCategory({ label: "🧘 Zen" }), makeCategory({ label: "📚 Arte" })], "es");
        expect(sorted.map((c) => c.label)).toEqual(["📚 Arte", "🧘 Zen"]);
    });
});

describe("calendar", () => {
    it("pads the month grid to full Monday-first weeks", () => {
        const cells = monthGridCells("2026-06");
        expect(cells[0]).toBe("2026-06-01");
        expect(cells.length % 7).toBe(0);
        expect(cells.filter(Boolean)).toHaveLength(30);
        expect(monthGridCells("2026-03").slice(0, 7)).toEqual([null, null, null, null, null, null, "2026-03-01"]);
    });

    it("groups the month's transactions by day", () => {
        const a = makeTransaction({ date: "2026-06-02" });
        const b = makeTransaction({ date: "2026-06-02" });
        const other = makeTransaction({ date: "2026-07-02" });
        expect(groupByDay([a, b, other], "2026-06")).toEqual(new Map([["2026-06-02", [a, b]]]));
    });
});

describe("formatting", () => {
    it("formats euros and escapes CSV cells", () => {
        expect(formatCurrency(1234.5, 2)).toBe("1234,50 €");
        expect(
            toCsv([
                ["a", 1],
                ['say "hi"', 2],
            ]),
        ).toBe('"a","1"\n"say ""hi""","2"');
    });
});
