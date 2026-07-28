import { useState } from "react";
import { Card, Grid, Typography, Button, ToggleButtonGroup, ToggleButton, Chip, TextField, InputAdornment } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import Layout from "../components/Layout";
import TransactionsTable from "../components/transactions/TransactionsTable";
import CalendarView from "../components/transactions/CalendarView";
import CategoryPieChart from "../components/transactions/CategoryPieChart";
import DateRangeFilter from "../components/transactions/DateRangeFilter";
import AddTransactionDialog from "../components/transactions/AddTransactionDialog";
import { useFinanceStore } from "../store/financeStore";
import { useUIStore } from "../store/uiStore";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/useTranslation";
import { getCategoryLabel } from "../i18n/categoryTranslations";
import { filterByDateFilter } from "../utils/dates";
import { formatCurrency } from "../utils/currency";
import { matchesTransactionSearch } from "../utils/search";
import { accent } from "../theme/colors";

export default function ExpensesPage() {
    const { t, locale } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [addOpen, setAddOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { transactions, hasLoaded, resolveCategory, updateNotes, splitTransaction, removeTransaction, addTransaction } = useFinanceStore();
    const { dateFilter, setDateFilter } = useUIStore();
    const { categories } = useSettingsStore();

    if (!hasLoaded) {
        return <Layout scrollMode="contained"><p>{t.loading}</p></Layout>;
    }

    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const expenses = transactions.filter((tx) => tx.amount < 0 && !noComputableValues.has(tx.category));
    const visible = filterByDateFilter(expenses, dateFilter);
    const total = visible.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const categoryFiltered = selectedCategory ? expenses.filter((tx) => tx.category === selectedCategory) : expenses;
    const searchFiltered = categoryFiltered.filter((tx) => matchesTransactionSearch(tx, searchQuery));
    const shown = (selectedCategory ? visible.filter((tx) => tx.category === selectedCategory) : visible)
        .filter((tx) => matchesTransactionSearch(tx, searchQuery));
    const selectedCategoryObj = selectedCategory ? categories.find((c) => c.value === selectedCategory) : undefined;

    function toggleCategory(category: string) {
        setSelectedCategory((prev) => (prev === category ? null : category));
    }

    return (
        <Layout scrollMode="contained">
            <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ p: 3, height: "100%", borderLeft: "4px solid", borderLeftColor: accent.budget }}>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{t.totalSpentTitle}</Typography>
                        <Typography variant="h3" sx={{ color: accent.budget }}>{formatCurrency(total)}</Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ p: 2, height: "100%" }}>
                        <CategoryPieChart
                            transactions={visible}
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={toggleCategory}
                        />
                    </Card>
                </Grid>
            </Grid>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16, flexShrink: 0, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={viewMode}
                        onChange={(_, v: "list" | "calendar" | null) => v && setViewMode(v)}
                    >
                        <ToggleButton value="list" title={t.viewList}><ViewListIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="calendar" title={t.viewCalendar}><CalendarMonthIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                    {viewMode === "list" && (
                        <DateRangeFilter transactions={expenses} value={dateFilter} onChange={setDateFilter} />
                    )}
                    {selectedCategoryObj && (
                        <Chip
                            label={t.categoryFilterChip(getCategoryLabel(selectedCategoryObj, locale))}
                            size="small"
                            onDelete={() => setSelectedCategory(null)}
                        />
                    )}
                    <TextField
                        size="small"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 220 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 18, opacity: 0.5 }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </div>
                <Button variant="outlined" onClick={() => setAddOpen(true)}>{t.addTransactionButton}</Button>
            </div>

            {viewMode === "list" ? (
                <div style={{ flex: 1, minHeight: 320 }}>
                    <TransactionsTable
                        transactions={shown}
                        categories={categories}
                        onCategoryChange={(id, category) => resolveCategory(uid, id, category)}
                        onNotesChange={(id, notes) => updateNotes(uid, id, notes)}
                        onSplit={(id, portions) => splitTransaction(uid, id, portions)}
                        onDelete={(id) => removeTransaction(uid, id)}
                        onCategoryClick={toggleCategory}
                    />
                </div>
            ) : (
                <CalendarView transactions={searchFiltered} categories={categories} />
            )}

            <AddTransactionDialog
                open={addOpen}
                categories={categories}
                fixedType="expense"
                onClose={() => setAddOpen(false)}
                onConfirm={(transaction) => addTransaction(uid, transaction)}
            />
        </Layout>
    );
}
