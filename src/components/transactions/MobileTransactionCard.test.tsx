import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileTransactionCard } from "./MobileTransactionCard";
import { makeCategory, makeTransaction } from "../../test/factories";

describe("MobileTransactionCard", () => {
    const categories = [
        makeCategory({ value: "ropa", label: "Ropa", customLabel: true }),
        makeCategory({ value: "casa", label: "Casa", customLabel: true }),
    ];

    const renderCard = (overrides = {}) => {
        const props = {
            tx: makeTransaction({ id: "t1", description: "Zara", amount: -25, category: "ropa" }),
            categories,
            onCategoryChange: vi.fn(),
            onNotesChange: vi.fn(),
            onSplitClick: vi.fn(),
            onDelete: vi.fn(),
            ...overrides,
        };
        render(<MobileTransactionCard {...props} />);
        return { ...props, user: userEvent.setup() };
    };

    it("shows the movement with its signed amount and category", () => {
        renderCard();
        expect(screen.getByText("Zara")).toBeInTheDocument();
        expect(screen.getByText("−25 €")).toBeInTheDocument();
        expect(screen.getByText("Ropa")).toBeInTheDocument();
    });

    it("changes the category from the menu", async () => {
        const { user, onCategoryChange } = renderCard();
        await user.click(screen.getByRole("button", { name: "Cambiar categoría" }));
        await user.click(screen.getByRole("menuitem", { name: "Casa" }));
        expect(onCategoryChange).toHaveBeenCalledWith("t1", "casa");
    });

    it("saves notes on Enter only when they changed", async () => {
        const { user, onNotesChange } = renderCard();
        await user.click(screen.getByRole("button", { name: "Editar notas" }));
        await user.type(screen.getByPlaceholderText("Notas"), "regalo{Enter}");
        expect(onNotesChange).toHaveBeenCalledWith("t1", "regalo");
    });

    it("asks the parent to split or delete", async () => {
        const { user, onSplitClick, onDelete } = renderCard();
        await user.click(screen.getByRole("button", { name: "Dividir movimiento" }));
        await user.click(screen.getByRole("button", { name: "Eliminar movimiento" }));
        expect(onSplitClick).toHaveBeenCalled();
        expect(onDelete).toHaveBeenCalled();
    });
});
