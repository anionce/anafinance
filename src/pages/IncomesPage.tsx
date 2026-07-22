import { useState } from "react";
import { Card, Grid, Typography, Button } from "@mui/material";
import Layout from "../components/Layout";
import TransactionsTable from "../components/transactions/TransactionsTable";
import CategoryPieChart from "../components/transactions/CategoryPieChart";
import DateRangeFilter from "../components/transactions/DateRangeFilter";
import AddTransactionDialog from "../components/transactions/AddTransactionDialog";
import { useFinanceStore } from "../store/financeStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/useTranslation";
import { filterByDateFilter } from "../utils/dates";
import { formatCurrency } from "../utils/currency";
import { accent } from "../theme/colors";

export default function IncomesPage() {
    const { t } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [addOpen, setAddOpen] = useState(false);
    const { transactions, hasLoaded, resolveCategory, updateNotes, splitTransaction, removeTransaction, addTransaction } = useFinanceStore();
    const { dateFilter, setDateFilter } = useUIStore();
    const { categories } = useSettingsStore();

    if (!hasLoaded) {
        return <Layout scrollMode="contained"><p>{t.loading}</p></Layout>;
    }

    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const incomes = transactions.filter((tx) => tx.amount > 0 && !noComputableValues.has(tx.category));
    const visible = filterByDateFilter(incomes, dateFilter);
    const total = visible.reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <Layout scrollMode="contained">
            <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ p: 3, height: "100%", borderLeft: "4px solid", borderLeftColor: accent.income }}>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{t.totalIncomeTitle}</Typography>
                        <Typography variant="h3" sx={{ color: accent.income }}>{formatCurrency(total)}</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ p: 2, height: "100%" }}>
                        <CategoryPieChart transactions={visible} categories={categories} />
                    </Card>
                </Grid>
            </Grid>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexShrink: 0, flexWrap: "wrap" }}>
                <DateRangeFilter transactions={incomes} value={dateFilter} onChange={setDateFilter} />
                <Button variant="outlined" onClick={() => setAddOpen(true)}>{t.addTransactionButton}</Button>
            </div>

            <div style={{ flex: 1, minHeight: 320 }}>
                <TransactionsTable
                    transactions={visible}
                    categories={categories}
                    onCategoryChange={(id, category) => resolveCategory(uid, id, category)}
                    onNotesChange={(id, notes) => updateNotes(uid, id, notes)}
                    onSplit={(id, portions) => splitTransaction(uid, id, portions)}
                    onDelete={(id) => removeTransaction(uid, id)}
                />
            </div>

            <AddTransactionDialog
                open={addOpen}
                categories={categories}
                fixedType="income"
                onClose={() => setAddOpen(false)}
                onConfirm={(transaction) => addTransaction(uid, transaction)}
            />
        </Layout>
    );
}
