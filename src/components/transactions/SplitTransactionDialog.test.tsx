import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SplitTransactionDialog } from "./SplitTransactionDialog";
import { makeCategory, makeTransaction } from "../../test/factories";

describe("SplitTransactionDialog", () => {
    it("starts with two halves and confirms them", async () => {
        const onConfirm = vi.fn();
        const categories = [makeCategory({ value: "casa" }), makeCategory({ value: "ropa" })];
        render(
            <SplitTransactionDialog
                open
                transaction={makeTransaction({ amount: -20, category: "ropa" })}
                categories={categories}
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />,
        );

        expect(screen.getByText("Todo el importe está asignado")).toBeInTheDocument();
        await userEvent.setup().click(screen.getByRole("button", { name: "Dividir" }));

        expect(onConfirm).toHaveBeenCalledWith([
            { category: "ropa", amount: 10 },
            { category: "casa", amount: 10 },
        ]);
    });

    it("blocks confirming while part of the amount is unassigned", async () => {
        const user = userEvent.setup();
        render(
            <SplitTransactionDialog
                open
                transaction={makeTransaction({ amount: -20 })}
                categories={[makeCategory({ value: "casa" })]}
                onClose={vi.fn()}
                onConfirm={vi.fn()}
            />,
        );

        const [first] = screen.getAllByRole("spinbutton");
        await user.clear(first);
        await user.type(first, "5");

        expect(screen.getByRole("button", { name: "Dividir" })).toBeDisabled();
    });
});
