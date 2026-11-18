import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const ROW_TOLERANCE = 2.5;

const COLUMN_GAP_THRESHOLD = 8;

const DATE_COLUMN_MAX_X = 170;

const MAX_WRAP_DISTANCE = 20;

const TABLE_LEFT_MARGIN_SLACK = 10;

const PAGE_MARGIN_X = 30;
const DATE_PATTERN = /\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/;

interface PositionedItem {
    text: string;
    x: number;
    y: number;
    width: number;
}

export const readPdfRows = async (file: File): Promise<unknown[][]> => {
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
};

const pageToRows = (items: PositionedItem[]): (string | null)[][] => {
    const lines = groupIntoLines(items.filter((item) => item.x >= PAGE_MARGIN_X));
    if (lines.length === 0) return [];

    const isAnchor = lines.map(hasDateInFirstColumn);
    const anchorLines = lines.filter((_, i) => isAnchor[i]);

    const columnStarts = detectColumnStarts(anchorLines.length > 0 ? anchorLines : lines);
    const mergedLines = mergeWrappedLines(lines, isAnchor, columnStarts[0] ?? 0);

    return mergedLines.map((line) => binIntoColumns(line, columnStarts));
};

const groupIntoLines = (items: PositionedItem[]): PositionedItem[][] => {
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
};

const hasDateInFirstColumn = (line: PositionedItem[]): boolean =>
    line.some((item) => item.x < DATE_COLUMN_MAX_X && DATE_PATTERN.test(item.text.trim()));

const columnStartsForLine = (line: PositionedItem[]): number[] => {
    const starts: number[] = [];
    let currentEnd = -Infinity;

    for (const item of line) {
        if (item.x - currentEnd > COLUMN_GAP_THRESHOLD) {
            starts.push(item.x);
        }
        currentEnd = item.x + item.width;
    }

    return starts;
};

const detectColumnStarts = (lines: PositionedItem[][]): number[] => {
    let best: number[] = [];
    for (const line of lines) {
        const starts = columnStartsForLine(line);
        if (starts.length > best.length) best = starts;
    }
    return best;
};

const mergeWrappedLines = (lines: PositionedItem[][], isAnchor: boolean[], tableLeftEdge: number): PositionedItem[][] => {
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
};

const binIntoColumns = (line: PositionedItem[], columnStarts: number[]): (string | null)[] => {
    if (columnStarts.length === 0) {
        return [
            line
                .map((item) => item.text)
                .join(" ")
                .trim(),
        ];
    }

    const boundaries = columnStarts.slice(1).map((start, i) => (start + columnStarts[i]) / 2);
    const cells = columnStarts.map(() => "");

    for (const item of line) {
        let colIndex = 0;
        while (colIndex < boundaries.length && item.x >= boundaries[colIndex]) colIndex++;
        cells[colIndex] = cells[colIndex] ? `${cells[colIndex]} ${item.text}` : item.text;
    }

    return cells.map((c) => c.trim()).map((c) => (c === "" ? null : c));
};
