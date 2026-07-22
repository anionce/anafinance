import { FEATURED_GOAL_ID } from "../types/Goal";
import {
    loadTransactions,
    mergeTransactions,
    loadLegacyTransactions,
    loadGoals,
    saveGoal,
    loadLegacyGoals,
    loadLegacySettings,
    saveSettings,
} from "./storage";

const LEGACY_OWNER_EMAIL = "anionce91@gmail.com";

/**
 * One-time migration: the very first time the original account owner signs
 * in under the new per-user data model, copies their pre-auth data (the flat
 * `transactions`/`goals`/`settings` collections) into their own
 * users/{uid}/... space. Gated by email so a brand-new family member with an
 * empty account never accidentally inherits someone else's data.
 */
export async function runLegacyMigrationIfNeeded(uid: string, email: string | null): Promise<void> {
    if (email !== LEGACY_OWNER_EMAIL) return;

    const [existingTransactions, existingGoals] = await Promise.all([
        loadTransactions(uid),
        loadGoals(uid),
    ]);
    if (existingTransactions.length > 0 || existingGoals.length > 0) return;

    const [legacyTransactions, legacyGoals, legacySettings] = await Promise.all([
        loadLegacyTransactions(),
        loadLegacyGoals(),
        loadLegacySettings(),
    ]);
    if (legacyTransactions.length === 0 && legacyGoals.length === 0) return;

    if (legacyTransactions.length > 0) {
        await mergeTransactions(uid, [], legacyTransactions);
    }
    for (const goal of legacyGoals) {
        await saveGoal(uid, goal);
    }
    if (!legacyGoals.some((g) => g.id === FEATURED_GOAL_ID)) {
        await saveGoal(uid, {
            id: FEATURED_GOAL_ID,
            name: "Colchón Revolut",
            targetAmount: legacySettings.colchonMeta,
            currentAmount: legacySettings.colchon,
        });
    }

    await saveSettings(uid, {
        estimatedIncome: legacySettings.estimatedIncome,
        categoryBudgets: legacySettings.categoryBudgets,
        categories: legacySettings.categories,
        onboardingComplete: true,
    });
}
