import * as XLSX from "xlsx";
import type { Transaction } from '../types/Transaction';
import { categorize } from "./categorizer";
import { hashTransaction } from "./hash";

export async function parseExcel(file: File): Promise<Transaction[]> {

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null,
    });

    const headerRowIndex = rows.findIndex((row) =>
        row.some((cell) => typeof cell === "string" && cell.trim().toLowerCase() === "concepto")
    );

    if (headerRowIndex === -1) {
        throw new Error('Could not find the header row ("Concepto") in the Excel file.');
    }

    const headerRow = rows[headerRowIndex].map((h) =>
        typeof h === "string" ? h.trim().toLowerCase() : h
    );

    const col = {
        fecha: headerRow.indexOf("fecha"),
        fValor: headerRow.indexOf("f.valor"),
        concepto: headerRow.indexOf("concepto"),
        movimiento: headerRow.indexOf("movimiento"),
        importe: headerRow.indexOf("importe"),
    };

    const dataRows = rows.slice(headerRowIndex + 1);
    const transactions: Transaction[] = [];

    // Counts how many times we've already seen the same date+description+amount
    // combination in this file, so identical transactions can be told apart
    // (e.g. two coffees with the same amount on the same day)
    const occurrenceCount = new Map<string, number>();

    for (const row of dataRows) {
        const concepto = row[col.concepto];
        const importe = row[col.importe];

        if (concepto == null || importe == null) continue;

        const rawDate = row[col.fecha] ?? row[col.fValor];
        const movimiento = String(row[col.movimiento] ?? "").trim();
        const description = movimiento ? `${String(concepto).trim()} — ${movimiento}` : String(concepto).trim();
        const isoDate = excelDateToISO(rawDate);
        const amount = Number(importe);

        const baseKey = `${isoDate}|${description}|${amount}`;
        const occurrence = occurrenceCount.get(baseKey) ?? 0;
        occurrenceCount.set(baseKey, occurrence + 1);

        transactions.push({
            id: hashTransaction(isoDate, description, amount, occurrence),
            date: isoDate,
            description,
            amount,
	    category: categorize(description, amount) ?? "",
        });
    }

    return transactions;
}

function excelDateToISO(value: unknown): string {
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
}