import { describe, expect, it } from "vitest";
import { guessHeaderRowIndex, parseBankRows, transactionsFromMapping, UnrecognizedBankFormatError } from "./excelParser";

const BBVA_ROWS: unknown[][] = [
    ["Movimientos de la cuenta", null, null, null, null],
    ["Fecha", "F.Valor", "Concepto", "Movimiento", "Importe"],
    ["01/03/2026", "01/03/2026", "MERCADONA", "Pago con tarjeta", -40.5],
    ["01/03/2026", "01/03/2026", "Café", null, -2],
    ["01/03/2026", "01/03/2026", "Café", null, -2],
    ["Fecha", "F.Valor", "Concepto", "Movimiento", "Importe"],
    [null, null, null, null, null],
];

describe("parseBankRows", () => {
    it("reads BBVA statements and tells identical rows apart", () => {
        const transactions = parseBankRows(BBVA_ROWS);

        expect(transactions).toHaveLength(3);
        expect(transactions[0]).toMatchObject({
            date: "2026-03-01",
            description: "MERCADONA — Pago con tarjeta",
            amount: -40.5,
            category: "supermercado",
        });
        expect(transactions[1].id).not.toBe(transactions[2].id);
    });

    it("gives the same ids to the same file exported in another language", () => {
        const catalan = BBVA_ROWS.map((row) => (row[2] === "Concepto" ? ["Data", "Data valor", "Concepte", "Moviment", "Import"] : row));
        expect(parseBankRows(catalan).map((t) => t.id)).toEqual(parseBankRows(BBVA_ROWS).map((t) => t.id));
    });

    it("rejects files without a recognizable header", () => {
        expect(() => parseBankRows([["a", "b"]])).toThrow(UnrecognizedBankFormatError);
    });
});

describe("manual column mapping", () => {
    const rows = [
        ["Date", "Text", "Value"],
        ["15/02/2026", "Coffee", "-2,50"],
        ["16/02/2026", "Salary", "1500"],
        ["17/02/2026", "Broken", "n/a"],
    ];

    it("reads the chosen columns and accepts decimal commas", () => {
        const transactions = transactionsFromMapping(rows, { headerRowIndex: 0, dateCol: 0, descriptionCol: 1, amountCol: 2 });
        expect(transactions.map((t) => [t.date, t.description, t.amount])).toEqual([
            ["2026-02-15", "Coffee", -2.5],
            ["2026-02-16", "Salary", 1500],
        ]);
    });

    it("guesses the header as the fullest early row", () => {
        expect(guessHeaderRowIndex([["Title"], ...rows])).toBe(1);
    });
});
