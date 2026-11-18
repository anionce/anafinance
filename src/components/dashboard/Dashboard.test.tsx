import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dashboard } from "./Dashboard";

const baseProps = {
    income: 1200,
    balance: 300,
    hasIncomeData: true,
    estimatedIncome: 2000,
    savingsTarget: 0,
    onEstimatedIncomeChange: vi.fn(),
    goals: [],
    onSelectFeaturedGoal: vi.fn(),
    onFeaturedGoalAmountChange: vi.fn(),
    onFeaturedGoalTargetChange: vi.fn(),
    onFeaturedGoalNameChange: vi.fn(),
    onEditBudget: vi.fn(),
    onOpenBudgetHistory: vi.fn(),
};

describe("Dashboard", () => {
    it("celebrates when spending is low", () => {
        render(<Dashboard {...baseProps} spent={100} budget={1000} />);
        expect(screen.getByText("Vas genial este mes")).toBeInTheDocument();
        expect(screen.getByText("10%")).toBeInTheDocument();
    });

    it("warns when the budget is exceeded", () => {
        render(<Dashboard {...baseProps} spent={1200} budget={1000} />);
        expect(screen.getByText("Te has pasado del presupuesto")).toBeInTheDocument();
        expect(screen.getByText("120%")).toBeInTheDocument();
    });

    it("hides income cards when there is no income data", () => {
        render(<Dashboard {...baseProps} spent={0} budget={0} hasIncomeData={false} />);
        expect(screen.queryByText("Ingresos del mes")).not.toBeInTheDocument();
    });

    it("edits the estimated income inline", async () => {
        const onEstimatedIncomeChange = vi.fn();
        const user = userEvent.setup();
        render(<Dashboard {...baseProps} spent={0} budget={100} onEstimatedIncomeChange={onEstimatedIncomeChange} />);

        await user.click(screen.getByRole("button", { name: "Ingresos al mes" }));
        const input = screen.getByRole("spinbutton", { name: "Ingresos al mes" });
        await user.clear(input);
        await user.type(input, "2500{Enter}");

        expect(onEstimatedIncomeChange).toHaveBeenCalledWith(2500);
    });
});
