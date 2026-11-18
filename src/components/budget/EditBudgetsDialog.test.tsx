import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditBudgetsDialog } from "./EditBudgetsDialog";
import { makeCategory } from "../../test/factories";

describe("EditBudgetsDialog", () => {
    const ropa = makeCategory({ value: "ropa", label: "Ropa", customLabel: true });
    const hidden = makeCategory({ value: "hidden", label: "Oculta", customLabel: true, noComputable: true });

    const renderDialog = () => {
        const onSave = vi.fn();
        const onSaveSavingsTarget = vi.fn();
        render(
            <EditBudgetsDialog
                open
                onClose={vi.fn()}
                categories={[ropa, hidden]}
                budgets={{ ropa: { amount: 30, period: "monthly" } }}
                onSave={onSave}
                estimatedIncome={2000}
                savingsTarget={500}
                onSaveSavingsTarget={onSaveSavingsTarget}
            />,
        );
        return { onSave, onSaveSavingsTarget, user: userEvent.setup() };
    };

    it("prefills current budgets and only lists budgetable categories", () => {
        renderDialog();
        expect(screen.getByRole("spinbutton", { name: "Ropa" })).toHaveValue(30);
        expect(screen.queryByRole("spinbutton", { name: "Oculta" })).not.toBeInTheDocument();
    });

    it("saves the edited budgets and savings target", async () => {
        const { onSave, onSaveSavingsTarget, user } = renderDialog();
        const amount = screen.getByRole("spinbutton", { name: "Ropa" });
        await user.clear(amount);
        await user.type(amount, "45");
        await user.clear(screen.getByRole("spinbutton", { name: "Quiero ahorrar al menos" }));
        await user.type(screen.getByRole("spinbutton", { name: "Quiero ahorrar al menos" }), "300");
        await user.click(screen.getByRole("button", { name: "Guardar" }));

        expect(onSave).toHaveBeenCalledWith({ ropa: { amount: 45, period: "monthly" } });
        expect(onSaveSavingsTarget).toHaveBeenCalledWith(300);
    });

    it("warns when the budget goes over what can be spent", async () => {
        const { user } = renderDialog();
        const amount = screen.getByRole("spinbutton", { name: "Ropa" });
        await user.clear(amount);
        await user.type(amount, "1600");
        expect(screen.getByText("Llevas 1600 € asignados: te pasas 100 € del máximo.")).toBeInTheDocument();
    });
});
