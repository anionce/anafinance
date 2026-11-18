import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("../services/firebase", () => ({ db: {}, auth: {} }));
vi.mock("../services/pdfParser", () => ({ readPdfRows: vi.fn() }));

afterEach(() => {
    cleanup();
    localStorage.clear();
});
