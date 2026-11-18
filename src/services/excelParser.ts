import * as XLSX from "xlsx";
import type { Transaction } from "../types/Transaction";
import { categorize } from "./categorizer";
import { hashTransaction } from "./hash";
import { readPdfRows } from "./pdfParser";

export interface ColumnMapping {
    headerRowIndex: number;
    dateCol: number;
    descriptionCol: number;
    amountCol: number;
}

export class UnrecognizedBankFormatError extends Error {
    rows: unknown[][];
    constructor(rows: unknown[][]) {
        super('Could not find the header row ("Concepto") in the Excel file.');
        this.name = "UnrecognizedBankFormatError";
        this.rows = rows;
    }
}

export const readSheetRows = async (file: File): Promise<unknown[][]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
    });
};

export const guessHeaderRowIndex = (rows: unknown[][]): number => {
    let best = 0;
    let bestCount = -1;
    for (let i = 0; i < Math.min(rows.length, HEADER_SEARCH_ROWS); i++) {
        const count = rows[i].filter((cell) => cell != null && String(cell).trim() !== "").length;
        if (count > bestCount) {
            bestCount = count;
            best = i;
        }
    }
    return best;
};

const BBVA_HEADER_ALIASES_BY_LANGUAGE = {
    fecha: ["fecha", "data", "operación", "operacion"],
    fValor: ["f.valor", "data valor", "fecha valor"],
    concepto: ["concepto", "concepte"],
    movimiento: ["movimiento", "moviment"],
    importe: ["importe", "import"],
};

type BbvaColumn = keyof typeof BBVA_HEADER_ALIASES_BY_LANGUAGE;

const HEADER_SEARCH_ROWS = 20;

const detectBbvaMapping = (rows: unknown[][]): { headerRowIndex: number; col: Record<BbvaColumn, number> } | null => {
    const headerRowIndex = rows.findIndex((row) =>
        row.some((cell) => typeof cell === "string" && BBVA_HEADER_ALIASES_BY_LANGUAGE.concepto.includes(cell.trim().toLowerCase())),
    );

    if (headerRowIndex === -1) return null;

    const headerRow = rows[headerRowIndex].map((h) => (typeof h === "string" ? h.trim().toLowerCase() : h));

    const findCol = (aliases: string[]): number => {
        for (const alias of aliases) {
            const idx = headerRow.indexOf(alias);
            if (idx !== -1) return idx;
        }
        return -1;
    };

    return {
        headerRowIndex,
        col: {
            fecha: findCol(BBVA_HEADER_ALIASES_BY_LANGUAGE.fecha),
            fValor: findCol(BBVA_HEADER_ALIASES_BY_LANGUAGE.fValor),
            concepto: findCol(BBVA_HEADER_ALIASES_BY_LANGUAGE.concepto),
            movimiento: findCol(BBVA_HEADER_ALIASES_BY_LANGUAGE.movimiento),
            importe: findCol(BBVA_HEADER_ALIASES_BY_LANGUAGE.importe),
        },
    };
};

interface ParsedRow {
    date: string;
    description: string;
    amount: number;
}

const toTransactions = (rows: (ParsedRow | null)[]): Transaction[] => {
    const occurrences = new Map<string, number>();
    return rows.flatMap((row) => {
        if (!row) return [];
        const sameDayAndAmount = `${row.date}|${row.amount}`;
        const occurrence = occurrences.get(sameDayAndAmount) ?? 0;
        occurrences.set(sameDayAndAmount, occurrence + 1);
        return [
            {
                id: hashTransaction(row.date, row.amount, occurrence),
                date: row.date,
                description: row.description,
                amount: row.amount,
                category: categorize(row.description, row.amount) ?? "",
            },
        ];
    });
};

const readBbvaRow = (row: unknown[], col: Record<BbvaColumn, number>): ParsedRow | null => {
    const concepto = row[col.concepto];
    const importe = row[col.importe];
    if (concepto == null || importe == null) return null;

    const amount = Number(importe);
    const isRepeatedHeaderRow = Number.isNaN(amount);
    if (isRepeatedHeaderRow) return null;

    const movimiento = String(row[col.movimiento] ?? "").trim();
    const concept = String(concepto).trim();
    return {
        date: excelDateToISO(row[col.fecha] ?? row[col.fValor]),
        description: movimiento ? `${concept} — ${movimiento}` : concept,
        amount,
    };
};

const readMappedRow = (row: unknown[], mapping: ColumnMapping): ParsedRow | null => {
    const rawDescription = row[mapping.descriptionCol];
    const rawAmount = row[mapping.amountCol];
    if (rawDescription == null || rawAmount == null) return null;

    const amount = Number(String(rawAmount).replace(",", "."));
    if (Number.isNaN(amount)) return null;

    return { date: excelDateToISO(row[mapping.dateCol]), description: String(rawDescription).trim(), amount };
};

export const transactionsFromMapping = (rows: unknown[][], mapping: ColumnMapping): Transaction[] =>
    toTransactions(rows.slice(mapping.headerRowIndex + 1).map((row) => readMappedRow(row, mapping)));

export const parseBankRows = (rows: unknown[][]): Transaction[] => {
    const bbva = detectBbvaMapping(rows);
    if (!bbva) throw new UnrecognizedBankFormatError(rows);
    return toTransactions(rows.slice(bbva.headerRowIndex + 1).map((row) => readBbvaRow(row, bbva.col)));
};

const isPdfFile = (file: File): boolean => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

export const readBankFileRows = async (file: File): Promise<unknown[][]> => (isPdfFile(file) ? readPdfRows(file) : readSheetRows(file));

export const parseExcel = async (file: File): Promise<Transaction[]> => parseBankRows(await readBankFileRows(file));

const excelDateToISO = (value: unknown): string => {
    if (typeof value === "string") {
        const [d, m, y] = value.split("/");
        if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        return value;
    }
    if (typeof value === "number") {
        const date = XLSX.SSF.parse_date_code(value);
        return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }
    return "";
};
