import { Card, Grid, Typography } from "@mui/material";
import Layout from "../components/Layout";
import TransactionsTable from "../components/transactions/TransactionsTable";
import CategoryPieChart from "../components/transactions/CategoryPieChart";
import { useFinanceStore } from "../store/financeStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "../i18n/useTranslation";
import { getAvailableMonths, filterByMonth } from "../utils/dates";
import { formatCurrency } from "../utils/currency";

export default function IncomesPage() {
    const { t } = useTranslation();
    const { transactions, hasLoaded, resolveCategory, updateNotes } = useFinanceStore();
    const { selectedMonth, setSelectedMonth } = useUIStore();
    const { categories } = useSettingsStore();

    if (!hasLoaded) {
        return <Layout scrollMode="contained"><p>{t.loading}</p></Layout>;
    }

    const incomes = transactions.filter((tx) => tx.amount > 0 && tx.category !== "no_computable");
    const months = getAvailableMonths(incomes);
    const visible = selectedMonth === "all" ? incomes : filterByMonth(incomes, selectedMonth);
    const total = visible.reduce((sum, tx) => sum + tx.amount, 0);

    return (
        <Layout scrollMode="contained">
            <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ bgcolor: "#DFF5E1", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{t.totalIncomeTitle}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>{formatCurrency(total)}</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: 1, p: 2, height: "100%", boxShadow: "none" }}>
                        <CategoryPieChart transactions={visible} categories={categories} />
                    </Card>
                </Grid>
            </Grid>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, flexShrink: 0 }}>
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    style={{ padding: 8 }}
                >
                    <option value="all">{t.allMonths}</option>
                    {months.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <div style={{ flex: 1, minHeight: 320 }}>
                <TransactionsTable
                    transactions={visible}
                    categories={categories}
                    onCategoryChange={resolveCategory}
                    onNotesChange={updateNotes}
                />
            </div>
        </Layout>
    );
}
