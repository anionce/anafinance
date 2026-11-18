import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetsStep } from "./BudgetsStep";
import { makeCategory } from "../../test/factories";

describe("BudgetsStep", () => {
    it("saves the budgets when an amount is committed", async () => {
        const setCategoryBudgets = vi.fn().mockResolvedValue(undefined);
        const user = userEvent.setup();
        const categories = [
            makeCategory({ value: "ropa", label: "Ropa", customLabel: true }),
            makeCategory({ value: "sueldo", incomeOnly: true }),
        ];
        render(<BudgetsStep uid="u1" categories={categories} setCategoryBudgets={setCategoryBudgets} />);

        await user.type(screen.getByRole("spinbutton", { name: "Ropa" }), "40");
        await user.tab();

        expect(setCategoryBudgets).toHaveBeenLastCalledWith("u1", { ropa: { amount: 40, period: "monthly" } });
        expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
    });
});
