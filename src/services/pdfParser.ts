import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** Text items closer together vertically than this (PDF points) are the same row. */
const ROW_TOLERANCE = 2.5;
/** A horizontal gap wider than this (PDF points) is treated as a new column, not a space within one. */
const COLUMN_GAP_THRESHOLD = 8;
/** A date is only trusted as marking a real transaction row if it sits left of this x — bank
 *  statements often repeat a date inside a wrapped description (e.g. "...card ...1234 on 2026-06-26"),
 *  which must not be mistaken for that row's own date column. */
const DATE_COLUMN_MAX_X = 170;
/** How close (PDF points) a line without its own date has to be to a dated row to be treated as
 *  that row's wrapped continuation, rather than an unrelated line. */
const MAX_WRAP_DISTANCE = 20;
/** A line starting further left than the table's own first column (minus this much slack) is page
 *  furniture (footers, letterhead...) that happens to sit close in Y to a row — never merge it in. */
const TABLE_LEFT_MARGIN_SLACK = 10;
/** Text this close to the page edge is letterhead/footer, never a real table column — dropped before
 *  grouping into rows at all, since it can otherwise land on the exact same y as real table text
 *  (page furniture is absolutely positioned and can coincide with wherever a row happens to fall). */
const PAGE_MARGIN_X = 30;
const DATE_PATTERN = /\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/;

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
 * merges rows that are really just a wrapped continuation of a dated row's
 * description (common when a "Concepto" cell spans more lines than the
 * single-line date/amount next to it), then bins every row's items onto one
 * shared set of column boundaries so "concepto is always column 2" holds for
 * every row, not just the first. It's still a heuristic: an odd layout may
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

function pageToRows(items: PositionedItem[]): (string | null)[][] {
    const lines = groupIntoLines(items.filter((item) => item.x >= PAGE_MARGIN_X));
    if (lines.length === 0) return [];

    const isAnchor = lines.map(hasDateInFirstColumn);
    const anchorLines = lines.filter((_, i) => isAnchor[i]);

    // Column boundaries come from an actual transaction row, not the header —
    // header labels (e.g. "Concepto") are often centered/padded within their
    // column's width, sitting well to the right of where the left-aligned
    // data text underneath it actually starts.
    const columnStarts = detectColumnStarts(anchorLines.length > 0 ? anchorLines : lines);
    const mergedLines = mergeWrappedLines(lines, isAnchor, columnStarts[0] ?? 0);

    return mergedLines.map((line) => binIntoColumns(line, columnStarts));
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

function hasDateInFirstColumn(line: PositionedItem[]): boolean {
    return line.some((item) => item.x < DATE_COLUMN_MAX_X && DATE_PATTERN.test(item.text.trim()));
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

/**
 * Absorbs lines with no date of their own into the nearest dated line above
 * or below them, so a description that wraps onto extra lines ends up back
 * in the same row as that transaction's date/amount instead of splitting
 * into incomplete rows of its own.
 */
function mergeWrappedLines(lines: PositionedItem[][], isAnchor: boolean[], tableLeftEdge: number): PositionedItem[][] {
    const anchorIdxs = isAnchor.map((v, i) => (v ? i : -1)).filter((i) => i !== -1);
    if (anchorIdxs.length === 0) return lines;

    const merged = lines.map((line) => [...line]);
    const absorbed = new Set<number>();

    for (let i = 0; i < lines.length; i++) {
        if (isAnchor[i]) continue;
        if (Math.min(...lines[i].map((item) => item.x)) < tableLeftEdge - TABLE_LEFT_MARGIN_SLACK) continue;

        let nearest = -1;
        let nearestDist = Infinity;
        for (const a of anchorIdxs) {
            const dist = Math.abs(lines[a][0].y - lines[i][0].y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = a;
            }
        }

        if (nearest !== -1 && nearestDist <= MAX_WRAP_DISTANCE) {
            merged[nearest].push(...lines[i]);
            absorbed.add(i);
        }
    }

    return lines
        .map((_, i) => i)
        .filter((i) => !absorbed.has(i))
        .map((i) => merged[i].sort((a, b) => b.y - a.y || a.x - b.x));
}

function binIntoColumns(line: PositionedItem[], columnStarts: number[]): (string | null)[] {
    if (columnStarts.length === 0) {
        return [line.map((item) => item.text).join(" ").trim()];
    }

    // Boundaries are the midpoints between adjacent column starts, not the
    // starts themselves — numeric columns are usually right-aligned, so a
    // wider number (more digits) starts further left than a narrower one in
    // the same column, and a raw "must be >= this column's start" check
    // would misfile it into the previous column.
    const boundaries = columnStarts.slice(1).map((start, i) => (start + columnStarts[i]) / 2);
    const cells = columnStarts.map(() => "");

    for (const item of line) {
        let colIndex = 0;
        while (colIndex < boundaries.length && item.x >= boundaries[colIndex]) colIndex++;
        cells[colIndex] = cells[colIndex] ? `${cells[colIndex]} ${item.text}` : item.text;
    }

    // Empty cells become null (not "") to match readSheetRows' XLSX.utils.sheet_to_json
    // convention (defval: null) — downstream code filters out blank rows by checking
    // for null, so a PDF-only "" would otherwise slip past that check undetected.
    return cells.map((c) => c.trim()).map((c) => (c === "" ? null : c));
}
