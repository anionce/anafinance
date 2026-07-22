import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Transaction } from "../types/Transaction";
import type { Goal } from "../types/Goal";
import type { Settings } from "../types/Settings";
import { DEFAULT_SETTINGS } from "../types/Settings";
import type { CategoryBudget } from "../types/Budget";

const TRANSACTIONS_COLLECTION = "transactions";
const GOALS_COLLECTION = "goals";
const SETTINGS_DOC_ID = "general";

function transactionsPath(uid: string) {
    return `users/${uid}/${TRANSACTIONS_COLLECTION}`;
}

function goalsPath(uid: string) {
    return `users/${uid}/${GOALS_COLLECTION}`;
}

function settingsDocPath(uid: string) {
    return `users/${uid}/settings/${SETTINGS_DOC_ID}`;
}

export async function loadTransactions(uid: string): Promise<Transaction[]> {
    const snapshot = await getDocs(collection(db, transactionsPath(uid)));
    return snapshot.docs.map((d) => d.data() as Transaction);
}

export async function saveTransaction(uid: string, t: Transaction): Promise<void> {
    await setDoc(doc(db, transactionsPath(uid), t.id), t);
}

/**
 * Merges existing transactions with incoming ones, skipping any that already
 * exist (same id = same transaction), and saves the new ones to Firestore.
 * Returns { merged, addedCount }.
 */
export async function mergeTransactions(
    uid: string,
    existing: Transaction[],
    incoming: Transaction[]
): Promise<{ merged: Transaction[]; addedCount: number }> {
    const existingIds = new Set(existing.map((t) => t.id));
    const newOnes = incoming.filter((t) => !existingIds.has(t.id));

    const batch = writeBatch(db);
    for (const t of newOnes) {
        batch.set(doc(db, transactionsPath(uid), t.id), t);
    }
    await batch.commit();

    return {
        merged: [...existing, ...newOnes],
        addedCount: newOnes.length,
    };
}

export async function deleteTransaction(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(db, transactionsPath(uid), id));
}

export async function updateTransactionCategory(uid: string, id: string, category: string): Promise<void> {
    await setDoc(doc(db, transactionsPath(uid), id), { category }, { merge: true });
}

export async function updateTransactionNotes(uid: string, id: string, notes: string): Promise<void> {
    await setDoc(doc(db, transactionsPath(uid), id), { notes }, { merge: true });
}

/**
 * Older documents store each category budget as a plain number (always
 * monthly). Normalizes those into the current `{ amount, period }` shape so
 * existing data keeps working without a migration.
 */
function normalizeCategoryBudgets(raw: unknown): Record<string, CategoryBudget> {
    if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS.categoryBudgets;

    const result: Record<string, CategoryBudget> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof value === "number") {
            result[key] = { amount: value, period: "monthly" };
        } else if (value && typeof value === "object" && "amount" in value) {
            result[key] = value as CategoryBudget;
        }
    }
    return result;
}

async function getSettingsDocData(uid: string): Promise<Record<string, unknown>> {
    const snapshot = await getDocs(collection(db, `users/${uid}/settings`));
    const found = snapshot.docs.find((d) => d.id === SETTINGS_DOC_ID);
    return found?.data() ?? {};
}

// The settings document field is still named `ingresosEstimados` from before
// the codebase was translated to English; mapped to `estimatedIncome` here so
// existing documents don't need a migration for this one field.
export async function loadSettings(uid: string): Promise<Settings> {
    const data = await getSettingsDocData(uid);
    return {
        estimatedIncome: (data.ingresosEstimados as number) ?? DEFAULT_SETTINGS.estimatedIncome,
        categoryBudgets: normalizeCategoryBudgets(data.categoryBudgets),
        categories: (data.categories as Settings["categories"]) ?? DEFAULT_SETTINGS.categories,
        categorizationRules: (data.categorizationRules as Settings["categorizationRules"]) ?? DEFAULT_SETTINGS.categorizationRules,
        featuredGoalId: (data.featuredGoalId as string) ?? DEFAULT_SETTINGS.featuredGoalId,
        onboardingComplete: (data.onboardingComplete as boolean) ?? DEFAULT_SETTINGS.onboardingComplete,
    };
}

export async function saveSettings(uid: string, settings: Partial<Settings>): Promise<void> {
    const { estimatedIncome, ...rest } = settings;
    const data: Record<string, unknown> = { ...rest };
    if (estimatedIncome !== undefined) {
        data.ingresosEstimados = estimatedIncome;
    }
    await setDoc(doc(db, settingsDocPath(uid)), data, { merge: true });
}

export async function loadGoals(uid: string): Promise<Goal[]> {
    const snapshot = await getDocs(collection(db, goalsPath(uid)));
    return snapshot.docs.map((d) => d.data() as Goal);
}

export async function saveGoal(uid: string, goal: Goal): Promise<void> {
    await setDoc(doc(db, goalsPath(uid), goal.id), goal);
}

export async function deleteGoal(uid: string, id: string): Promise<void> {
    await deleteDoc(doc(db, goalsPath(uid), id));
}

// ---------------------------------------------------------------------------
// Legacy (pre-auth) flat collections, read-only. Used only to migrate a
// single existing account's data into its new users/{uid}/... location the
// first time that person signs in. See services/migration.ts.
// ---------------------------------------------------------------------------

export async function loadLegacyTransactions(): Promise<Transaction[]> {
    const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    return snapshot.docs.map((d) => d.data() as Transaction);
}

export async function loadLegacyGoals(): Promise<Goal[]> {
    const snapshot = await getDocs(collection(db, GOALS_COLLECTION));
    return snapshot.docs.map((d) => d.data() as Goal);
}

async function getLegacySettingsDocData(): Promise<Record<string, unknown>> {
    const snapshot = await getDocs(collection(db, "settings"));
    const found = snapshot.docs.find((d) => d.id === SETTINGS_DOC_ID);
    return found?.data() ?? {};
}

export async function loadLegacySettings(): Promise<Settings & { colchon: number; colchonMeta: number }> {
    const data = await getLegacySettingsDocData();
    return {
        estimatedIncome: (data.ingresosEstimados as number) ?? DEFAULT_SETTINGS.estimatedIncome,
        categoryBudgets: normalizeCategoryBudgets(data.categoryBudgets),
        categories: (data.categories as Settings["categories"]) ?? DEFAULT_SETTINGS.categories,
        categorizationRules: (data.categorizationRules as Settings["categorizationRules"]) ?? DEFAULT_SETTINGS.categorizationRules,
        featuredGoalId: (data.featuredGoalId as string) ?? DEFAULT_SETTINGS.featuredGoalId,
        onboardingComplete: true,
        colchon: (data.colchon as number) ?? 1719,
        colchonMeta: (data.colchonMeta as number) ?? 8000,
    };
}
