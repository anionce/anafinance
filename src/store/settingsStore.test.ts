import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveSettings } from "../services/storage";
import { useSettingsStore } from "./settingsStore";

vi.mock("../services/storage", () => ({ loadSettings: vi.fn(), saveSettings: vi.fn() }));

const UID = "user-1";

describe("settingsStore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 2, 15));
        vi.clearAllMocks();
        useSettingsStore.getState().reset();
        useSettingsStore.setState({
            categories: [{ value: "ropa", label: "Ropa" }],
            categoryBudgets: { ropa: { amount: 30, period: "monthly" } },
            budgetHistory: {},
        });
    });
    afterEach(() => vi.useRealTimers());

    it("removing a category drops its budget and snapshots the current month", async () => {
        await useSettingsStore.getState().removeCategory(UID, "ropa");

        const state = useSettingsStore.getState();
        expect(state.categories).toEqual([]);
        expect(state.categoryBudgets).toEqual({});
        expect(state.budgetHistory).toEqual({ "2026-03": {} });
        expect(saveSettings).toHaveBeenCalledWith(UID, { categories: [], categoryBudgets: {}, budgetHistory: { "2026-03": {} } });
    });

    it("editing a past month only touches its history", async () => {
        const budgets = { ropa: { amount: 10, period: "monthly" as const } };
        await useSettingsStore.getState().setCategoryBudgets(UID, budgets, "2026-01");

        expect(useSettingsStore.getState().categoryBudgets).toEqual({ ropa: { amount: 30, period: "monthly" } });
        expect(useSettingsStore.getState().budgetHistory).toEqual({ "2026-01": budgets });
    });

    it("marking a category as not counted removes its budget", async () => {
        await useSettingsStore.getState().setCategoryNoComputable(UID, "ropa", true);
        expect(useSettingsStore.getState().categories[0].noComputable).toBe(true);
        expect(useSettingsStore.getState().categoryBudgets).toEqual({});
    });

    it("renaming marks the label as custom", async () => {
        await useSettingsStore.getState().updateCategoryLabel(UID, "ropa", "Moda");
        expect(useSettingsStore.getState().categories[0]).toEqual({ value: "ropa", label: "Moda", customLabel: true });
    });
});
