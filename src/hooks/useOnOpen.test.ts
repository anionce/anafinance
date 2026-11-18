import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOnOpen } from "./useOnOpen";

describe("useOnOpen", () => {
    it("runs when mounted open and every time it opens again", () => {
        const onOpen = vi.fn();
        const { rerender } = renderHook(({ open }) => useOnOpen(open, onOpen), { initialProps: { open: true } });
        expect(onOpen).toHaveBeenCalledTimes(1);

        rerender({ open: true });
        rerender({ open: false });
        expect(onOpen).toHaveBeenCalledTimes(1);

        rerender({ open: true });
        expect(onOpen).toHaveBeenCalledTimes(2);
    });
});
