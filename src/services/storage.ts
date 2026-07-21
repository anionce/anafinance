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
const SETTINGS_DOC = "settings/general";

export async function loadTransactions(): Promise<Transaction[]> {
    const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    return snapshot.docs.map((d) => d.data() as Transaction);
}

export async function saveTransaction(t: Transaction): Promise<void> {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, t.id), t);
}

/**
 * Merges existing transactions with incoming ones, skipping any that already
 * exist (same id = same transaction), and saves the new ones to Firestore.
 * Returns { merged, addedCount }.
 */
export async function mergeTransactions(
    existing: Transaction[],
    incoming: Transaction[]
): Promise<{ merged: Transaction[]; addedCount: number }> {
    const existingIds = new Set(existing.map((t) => t.id));
    const newOnes = incoming.filter((t) => !existingIds.has(t.id));

    const batch = writeBatch(db);
    for (const t of newOnes) {
        batch.set(doc(db, TRANSACTIONS_COLLECTION, t.id), t);
    }
    await batch.commit();

    return {
        merged: [...existing, ...newOnes],
        addedCount: newOnes.length,
    };
}

export async function updateTransactionCategory(id: string, category: string): Promise<void> {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, id), { category }, { merge: true });
}

export async function updateTransactionNotes(id: string, notes: string): Promise<void> {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, id), { notes }, { merge: true });
}

async function getSettingsDocData(): Promise<Record<string, unknown>> {
    const snapshot = await getDocs(collection(db, "settings"));
    const found = snapshot.docs.find((d) => d.id === "general");
    return found?.data() ?? {};
}

/**
 * Reads the legacy `colchon`/`colchonMeta` fields from before the featured
 * goal was migrated into the `goals` collection. Only used once, to seed
 * that Goal the first time we detect it doesn't exist yet.
 */
export async function loadLegacyColchon(): Promise<{ current: number; meta: number }> {
    const data = await getSettingsDocData();
    return {
        current: (data.colchon as number) ?? 1719,
        meta: (data.colchonMeta as number) ?? 8000,
    };
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

// The Firestore field is still named `ingresosEstimados` from before the
// codebase was translated to English; mapped to `estimatedIncome` in code
// here so we don't have to migrate existing documents.
export async function loadSettings(): Promise<Settings> {
    const data = await getSettingsDocData();
    return {
        estimatedIncome: (data.ingresosEstimados as number) ?? DEFAULT_SETTINGS.estimatedIncome,
        categoryBudgets: normalizeCategoryBudgets(data.categoryBudgets),
        categories: (data.categories as Settings["categories"]) ?? DEFAULT_SETTINGS.categories,
    };
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
    const { estimatedIncome, ...rest } = settings;
    const data: Record<string, unknown> = { ...rest };
    if (estimatedIncome !== undefined) {
        data.ingresosEstimados = estimatedIncome;
    }
    await setDoc(doc(db, SETTINGS_DOC), data, { merge: true });
}

export async function loadGoals(): Promise<Goal[]> {
    const snapshot = await getDocs(collection(db, GOALS_COLLECTION));
    return snapshot.docs.map((d) => d.data() as Goal);
}

export async function saveGoal(goal: Goal): Promise<void> {
    await setDoc(doc(db, GOALS_COLLECTION, goal.id), goal);
}

export async function deleteGoal(id: string): Promise<void> {
    await deleteDoc(doc(db, GOALS_COLLECTION, id));
}
