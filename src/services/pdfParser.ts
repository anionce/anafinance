import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** Text items closer together vertically than this (PDF points) are the same row. */
const ROW_TOLERANCE = 2.5;
/** A horizontal gap wider than this (PDF points) is treated as a new column, not a space within one. */
const COLUMN_GAP_THRESHOLD = 8;

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
 * then splits each row into columns wherever there's an unusually wide horizontal
 * gap. It's a heuristic: works well for cleanly aligned bank statement tables,
 * but an odd layout may need the manual column-mapping dialog to fix up.
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

        rows.push(...groupIntoRows(items));
    }

    return rows;
}

function groupIntoRows(items: PositionedItem[]): string[][] {
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

    return lines.map((line) => splitIntoColumns(line.sort((a, b) => a.x - b.x)));
}

function splitIntoColumns(line: PositionedItem[]): string[] {
    const columns: string[] = [];
    let currentText = "";
    let currentEnd = -Infinity;

    for (const item of line) {
        const gap = item.x - currentEnd;
        if (currentText === "") {
            currentText = item.text;
        } else if (gap > COLUMN_GAP_THRESHOLD) {
            columns.push(currentText.trim());
            currentText = item.text;
        } else {
            currentText += (gap > 1 ? " " : "") + item.text;
        }
        currentEnd = item.x + item.width;
    }
    if (currentText !== "") columns.push(currentText.trim());

    return columns;
}
