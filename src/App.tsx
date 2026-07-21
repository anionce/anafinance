import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ImportExcel from "./components/ImportExcel";
import Layout from "./components/Layout";
import TransactionsTable from "./components/TransactionsTable";
import CategoryReviewModal from "./components/CategoryReviewModal";
import CategoryBudgets from "./components/CategoryBudgets";
import { parseExcel } from "./services/excelParser";
import {
    loadTransactions,
    mergeTransactions,
    updateTransactionCategory,
    loadColchon,
    saveColchon,
} from "./services/storage";
import { CATEGORY_BUDGETS, TOTAL_BUDGET } from "./types/Budget";
import type { Transaction } from "./types/Transaction";

export default function App() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>("todos");
    const [colchon, setColchon] = useState(1719);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        async function load() {
            const [txs, colchonValue] = await Promise.all([loadTransactions(), loadColchon()]);
            setTransactions(txs);
            setColchon(colchonValue);
            setHasLoaded(true);
        }
        load();
    }, []);

    async function handleImport(file: File) {
        const incoming = await parseExcel(file);
        const { merged, addedCount } = await mergeTransactions(transactions, incoming);
        console.log(`${addedCount} movimientos nuevos añadidos de ${incoming.length} en el archivo`);
        setTransactions(merged);
    }

    async function handleResolveCategory(id: string, category: string) {
        await updateTransactionCategory(id, category);
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, category } : t))
        );
    }

    async function handleColchonChange(value: number) {
        setColchon(value);
        await saveColchon(value);
    }

    const pending = transactions.filter((t) => t.category === "");

    const months = Array.from(
        new Set(transactions.map((t) => t.date.slice(0, 7)))
    ).sort().reverse();

    const visibleTransactions =
        selectedMonth === "todos"
            ? transactions
            : transactions.filter((t) => t.date.startsWith(selectedMonth));

    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
    const totalSpentThisMonth = currentMonthTransactions
        .filter((t) => t.amount < 0 && t.category in CATEGORY_BUDGETS)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncomeThisMonth = currentMonthTransactions
        .filter((t) => t.amount > 0 && t.category !== "no_computable")
        .reduce((sum, t) => sum + t.amount, 0);

    if (!hasLoaded) {
        return <Layout><p>Cargando...</p></Layout>;
    }

    return (
        <Layout>
            <Dashboard
                spent={totalSpentThisMonth}
                budget={TOTAL_BUDGET}
                income={totalIncomeThisMonth}
                colchon={colchon}
                colchonMeta={8000}
                onColchonChange={handleColchonChange}
            />

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, marginBottom: 16 }}>
                <ImportExcel onImport={handleImport} />

                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ padding: 8 }}
                >
                    <option value="todos">Todos los meses</option>
                    {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <CategoryBudgets transactions={currentMonthTransactions} />

            <TransactionsTable transactions={visibleTransactions} onCategoryChange={handleResolveCategory} />
            <CategoryReviewModal
                pending={pending}
                onResolve={handleResolveCategory}
                onFinish={() => {}}
            />
        </Layout>
    );
}