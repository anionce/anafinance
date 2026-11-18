import { beforeEach, describe, expect, it, vi } from "vitest";
import * as storage from "../services/storage";
import { makeTransaction } from "../test/factories";
import { useFinanceStore } from "./financeStore";
import { useSettingsStore } from "./settingsStore";

vi.mock("../services/storage", () => ({
    loadTransactions: vi.fn(),
    loadGoals: vi.fn(),
    mergeTransactions: vi.fn(async (_uid: string, existing: unknown[], incoming: unknown[]) => ({
        merged: [...existing, ...incoming],
        added: incoming,
    })),
    saveTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
    deleteTransactions: vi.fn(),
    updateTransactionCategory: vi.fn(),
    updateTransactionNotes: vi.fn(),
    saveGoal: vi.fn(),
    deleteGoal: vi.fn(),
}));

const UID = "user-1";

describe("financeStore", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useFinanceStore.getState().reset();
        useSettingsStore.getState().reset();
    });

    it("imports mapped rows, applies user rules and credits linked goals", async () => {
        useFinanceStore.setState({ goals: [{ id: "g1", name: "Trip", targetAmount: 500, currentAmount: 100 }] });
        useSettingsStore.setState({ categorizationRules: [{ id: "r1", keyword: "piggy", category: "transferencia", goalId: "g1" }] });
        const rows = [
            ["Date", "Text", "Value"],
            ["01/03/2026", "Piggy", "-50"],
        ];

        const added = await useFinanceStore
            .getState()
            .importFileWithMapping(UID, rows, { headerRowIndex: 0, dateCol: 0, descriptionCol: 1, amountCol: 2 });

        expect(added).toBe(1);
        expect(useFinanceStore.getState().transactions[0]).toMatchObject({ description: "Piggy", category: "transferencia" });
        expect(useFinanceStore.getState().goals[0].currentAmount).toBe(150);
    });

    it("splits a transaction, saving the parts before deleting the original", async () => {
        const original = makeTransaction({ id: "t1", amount: -10 });
        useFinanceStore.setState({ transactions: [original] });

        await useFinanceStore.getState().splitTransaction(UID, "t1", [
            { category: "a", amount: 4 },
            { category: "b", amount: 6 },
        ]);

        const saveOrder = vi.mocked(storage.saveTransaction).mock.invocationCallOrder[0];
        expect(saveOrder).toBeLessThan(vi.mocked(storage.deleteTransaction).mock.invocationCallOrder[0]);
        expect(useFinanceStore.getState().transactions.map((t) => t.amount)).toEqual(expect.arrayContaining([-6, -4]));
    });

    it("ignores a split with fewer than two portions", async () => {
        useFinanceStore.setState({ transactions: [makeTransaction({ id: "t1" })] });
        await useFinanceStore.getState().splitTransaction(UID, "t1", [{ category: "a", amount: 10 }]);
        expect(storage.deleteTransaction).not.toHaveBeenCalled();
    });

    it("updates goals and removes transactions", async () => {
        useFinanceStore.setState({
            goals: [{ id: "g1", name: "Trip", targetAmount: 500, currentAmount: 0 }],
            transactions: [makeTransaction({ id: "a" }), makeTransaction({ id: "b" })],
        });

        await useFinanceStore.getState().updateGoalTarget(UID, "g1", 900);
        await useFinanceStore.getState().removeTransactions(UID, ["a"]);

        expect(useFinanceStore.getState().goals[0].targetAmount).toBe(900);
        expect(useFinanceStore.getState().transactions.map((t) => t.id)).toEqual(["b"]);
    });
});
