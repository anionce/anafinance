import {
    collection,
    doc,
    getDocs,
    setDoc,
    writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Transaction } from "../types/Transaction";

const TRANSACTIONS_COLLECTION = "transactions";
const SETTINGS_DOC = "settings/general";

export async function loadTransactions(): Promise<Transaction[]> {
    const snapshot = await getDocs(collection(db, TRANSACTIONS_COLLECTION));
    return snapshot.docs.map((d) => d.data() as Transaction);
}

export async function saveTransaction(t: Transaction): Promise<void> {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, t.id), t);
}

/**
 * Combina las transacciones existentes con las nuevas, ignorando
 * las que ya existan (mismo id = mismo movimiento), y las guarda en Firestore.
 * Devuelve { merged, addedCount }.
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

export async function loadColchon(): Promise<number> {
    const snapshot = await getDocs(collection(db, "settings"));
    const found = snapshot.docs.find((d) => d.id === "general");
    return found ? (found.data().colchon ?? 1719) : 1719;
}

export async function saveColchon(value: number): Promise<void> {
    await setDoc(doc(db, "settings", "general"), { colchon: value }, { merge: true });
}