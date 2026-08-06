import { useMemo, useState } from "react";
import { Card, Grid, Typography, Button, ToggleButtonGroup, ToggleButton, Chip, TextField, InputAdornment } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import Layout from "../Layout";
import TransactionsTable from "./TransactionsTable";
import CalendarView from "./CalendarView";
import CategoryPieChart from "./CategoryPieChart";
import DateRangeFilter from "./DateRangeFilter";
import AddTransactionDialog from "./AddTransactionDialog";
import { useFinanceStore } from "../../store/financeStore";
import { useUIStore } from "../../store/uiStore";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuthStore } from "../../store/authStore";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { filterByDateFilter } from "../../utils/dates";
import { formatCurrency } from "../../utils/currency";
import { matchesTransactionSearch } from "../../utils/search";
import { accent } from "../../theme/colors";

type Kind = "expense" | "income" | "all" | "noComputable";

interface Props {
    kind: Kind;
}

export default function TransactionsView({ kind }: Props) {
    const { t, locale } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [addOpen, setAddOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { transactions, hasLoaded, resolveCategory, updateNotes, splitTransaction, removeTransaction, addTransaction } = useFinanceStore();
    const { dateFilter, setDateFilter } = useUIStore();
    const { categories } = useSettingsStore();

    const noComputableValues = useMemo(
        () => new Set(categories.filter((c) => c.noComputable).map((c) => c.value)),
        [categories]
    );
    const relevant = useMemo(() => transactions.filter((tx) => {
        const isNoComputable = noComputableValues.has(tx.category);
        if (kind === "noComputable") return isNoComputable;
        if (isNoComputable) return false;
        if (kind === "expense") return tx.amount < 0;
        if (kind === "income") return tx.amount > 0;
        return true;
    }), [transactions, noComputableValues, kind]);
    const visible = useMemo(() => filterByDateFilter(relevant, dateFilter), [relevant, dateFilter]);
    const totalSpent = useMemo(() => visible.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0), [visible]);
    const totalIncome = useMemo(() => visible.filter((tx) => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0), [visible]);
    const categoryFiltered = useMemo(
        () => (selectedCategory ? relevant.filter((tx) => tx.category === selectedCategory) : relevant),
        [relevant, selectedCategory]
    );
    // Shared by both views: the list further narrows this to the active date
    // range, the calendar shows it as-is (it browses its own month range).
    const searchFiltered = useMemo(
        () => categoryFiltered.filter((tx) => matchesTransactionSearch(tx, searchQuery)),
        [categoryFiltered, searchQuery]
    );
    const shown = useMemo(() => filterByDateFilter(searchFiltered, dateFilter), [searchFiltered, dateFilter]);
    const selectedCategoryObj = selectedCategory ? categories.find((c) => c.value === selectedCategory) : undefined;

    // "all" and "noComputable" can both contain expense- and income-signed
    // transactions, so they get a spent card and an income card side by side;
    // "expense"/"income" only ever show their own single total.
    const showTwoCards = kind === "all" || kind === "noComputable";
    const statCardSize = showTwoCards ? { xs: 6, md: 3 } : { xs: 12, md: 5 };
    const statCards = showTwoCards
        ? [
            { key: "spent", label: t.totalSpentTitle, value: totalSpent, color: accent.budget },
            { key: "income", label: t.totalIncomeTitle, value: totalIncome, color: accent.income },
        ]
        : [{
            key: kind,
            label: kind === "expense" ? t.totalSpentTitle : t.totalIncomeTitle,
            value: kind === "expense" ? totalSpent : totalIncome,
            color: kind === "expense" ? accent.budget : accent.income,
        }];

    if (!hasLoaded) {
        return <Layout scrollMode="contained"><p>{t.loading}</p></Layout>;
    }

    function toggleCategory(category: string) {
        setSelectedCategory((prev) => (prev === category ? null : category));
    }

    return (
        <Layout scrollMode="contained">
            <Grid container spacing={2} sx={{ mb: 2, flexShrink: 0 }}>
                {statCards.map((card) => (
                    <Grid key={card.key} size={statCardSize}>
                        <Card sx={{ p: 3, height: "100%", borderLeft: "4px solid", borderLeftColor: card.color }}>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>{card.label}</Typography>
                            <Typography variant={showTwoCards ? "h5" : "h3"} sx={{ color: card.color }}>
                                {formatCurrency(card.value)}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
                <Grid size={showTwoCards ? { xs: 12, md: 6 } : { xs: 12, md: 7 }}>
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
                        <DateRangeFilter transactions={relevant} value={dateFilter} onChange={setDateFilter} />
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
                fixedType={kind === "expense" || kind === "income" ? kind : undefined}
                onClose={() => setAddOpen(false)}
                onConfirm={(transaction) => addTransaction(uid, transaction)}
            />
        </Layout>
    );
}
