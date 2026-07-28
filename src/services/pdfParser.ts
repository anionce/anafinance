import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** Text items closer together vertically than this (PDF points) are the same row. */
const ROW_TOLERANCE = 2.5;
/** A horizontal gap wider than this (PDF points) is treated as a new column, not a space within one. */
const COLUMN_GAP_THRESHOLD = 8;
/** How far left of a column's detected start an item can still sit and count as that column. */
const COLUMN_START_SLACK = 4;

interface PositionedItem {
    text: string;
    x: number;
    y: number;
    width: number;
}

/**
 * Reads a PDF and reconstructs it into a spreadsheet-like grid of rows/columns,
 * matching readSheetRows()'s output shape so it can feed the same BBVA-detection
 * and manual column-mapping flow used for Excel files.
 *
 * PDFs have no real concept of cells — this groups text by Y position into rows,
 * then bins each row's items onto a single shared set of column start positions
 * (derived once from whichever row has the most distinct gap-separated groups,
 * usually the header). Binning every row onto the same grid — instead of
 * re-detecting gaps independently per row — is what keeps "concepto is always
 * column 2" true for every row; independent per-row splitting would silently
 * shift a row's column count/order whenever its spacing differed even slightly,
 * breaking every row after the first. It's still a heuristic: an odd layout may
 * need the manual column-mapping dialog to fix up.
 */
export async function readPdfRows(file: File): Promise<unknown[][]> {
    const buffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: buffer }).promise;

    const rows: unknown[][] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        const items: PositionedItem[] = (content.items as TextItem[])
            .filter((item) => item.str.trim() !== "")
            .map((item) => ({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width,
            }));

        rows.push(...pageToRows(items));
    }

    return rows;
}

function pageToRows(items: PositionedItem[]): string[][] {
    const lines = groupIntoLines(items);
    if (lines.length === 0) return [];

    const columnStarts = detectColumnStarts(lines);
    return lines.map((line) => binIntoColumns(line, columnStarts));
}

function groupIntoLines(items: PositionedItem[]): PositionedItem[][] {
    const sortedByY = [...items].sort((a, b) => b.y - a.y);

    const lines: PositionedItem[][] = [];
    for (const item of sortedByY) {
        const line = lines.find((l) => Math.abs(l[0].y - item.y) <= ROW_TOLERANCE);
        if (line) {
            line.push(item);
        } else {
            lines.push([item]);
        }
    }

    return lines.map((line) => line.sort((a, b) => a.x - b.x));
}

/** The x-position where each gap-separated group starts, for one already-sorted line. */
function columnStartsForLine(line: PositionedItem[]): number[] {
    const starts: number[] = [];
    let currentEnd = -Infinity;

    for (const item of line) {
        if (item.x - currentEnd > COLUMN_GAP_THRESHOLD) {
            starts.push(item.x);
        }
        currentEnd = item.x + item.width;
    }

    return starts;
}

/** Uses the line with the most gap-separated groups as the column grid for the whole page. */
function detectColumnStarts(lines: PositionedItem[][]): number[] {
    let best: number[] = [];
    for (const line of lines) {
        const starts = columnStartsForLine(line);
        if (starts.length > best.length) best = starts;
    }
    return best;
}

function binIntoColumns(line: PositionedItem[], columnStarts: number[]): string[] {
    if (columnStarts.length === 0) {
        return [line.map((item) => item.text).join(" ").trim()];
    }

    const cells = columnStarts.map(() => "");

    for (const item of line) {
        let colIndex = 0;
        for (let i = 0; i < columnStarts.length; i++) {
            if (item.x >= columnStarts[i] - COLUMN_START_SLACK) colIndex = i;
        }
        cells[colIndex] = cells[colIndex] ? `${cells[colIndex]} ${item.text}` : item.text;
    }

    return cells.map((c) => c.trim());
}
