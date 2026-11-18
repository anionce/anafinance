import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import type { Transaction } from "../types/Transaction";
import type { Goal } from "../types/Goal";
import type { Settings } from "../types/Settings";
import { settingsFromDocument, settingsToDocument } from "./settingsDocument";
import { findNewTransactions } from "./transactionMatching";

const TRANSACTIONS_COLLECTION = "transactions";
const GOALS_COLLECTION = "goals";
const SETTINGS_DOC_ID = "general";

const transactionsPath = (uid: string) => `users/${uid}/${TRANSACTIONS_COLLECTION}`;

const goalsPath = (uid: string) => `users/${uid}/${GOALS_COLLECTION}`;

const settingsDocPath = (uid: string) => `users/${uid}/settings/${SETTINGS_DOC_ID}`;

export const loadTransactions = async (uid: string): Promise<Transaction[]> => {
    const snapshot = await getDocs(collection(db, transactionsPath(uid)));
    return snapshot.docs.map((d) => d.data() as Transaction);
};

export const saveTransaction = async (uid: string, t: Transaction): Promise<void> => {
    await setDoc(doc(db, transactionsPath(uid), t.id), t);
};

export const mergeTransactions = async (
    uid: string,
    existing: Transaction[],
    incoming: Transaction[],
): Promise<{ merged: Transaction[]; added: Transaction[] }> => {
    const added = findNewTransactions(existing, incoming);
    if (added.length > 0) {
        const batch = writeBatch(db);
        for (const t of added) batch.set(doc(db, transactionsPath(uid), t.id), t);
        await batch.commit();
    }
    return { merged: [...existing, ...added], added };
};

export const deleteTransaction = async (uid: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, transactionsPath(uid), id));
};

export const deleteTransactions = async (uid: string, ids: string[]): Promise<void> => {
    const batch = writeBatch(db);
    for (const id of ids) {
        batch.delete(doc(db, transactionsPath(uid), id));
    }
    await batch.commit();
};

export const updateTransactionCategory = async (uid: string, id: string, category: string): Promise<void> => {
    await setDoc(doc(db, transactionsPath(uid), id), { category }, { merge: true });
};

export const updateTransactionNotes = async (uid: string, id: string, notes: string): Promise<void> => {
    await setDoc(doc(db, transactionsPath(uid), id), { notes }, { merge: true });
};

const getSettingsDocData = async (uid: string): Promise<Record<string, unknown>> => {
    const snapshot = await getDocs(collection(db, `users/${uid}/settings`));
    return snapshot.docs.find((d) => d.id === SETTINGS_DOC_ID)?.data() ?? {};
};

export const loadSettings = async (uid: string): Promise<Settings> => settingsFromDocument(await getSettingsDocData(uid));

export const saveSettings = async (uid: string, settings: Partial<Settings>): Promise<void> => {
    const data = settingsToDocument(settings);
    await setDoc(doc(db, settingsDocPath(uid)), data, { mergeFields: Object.keys(data) });
};

export const loadGoals = async (uid: string): Promise<Goal[]> => {
    const snapshot = await getDocs(collection(db, goalsPath(uid)));
    return snapshot.docs.map((d) => d.data() as Goal);
};

export const saveGoal = async (uid: string, goal: Goal): Promise<void> => {
    await setDoc(doc(db, goalsPath(uid), goal.id), goal);
};

export const deleteGoal = async (uid: string, id: string): Promise<void> => {
    await deleteDoc(doc(db, goalsPath(uid), id));
};
