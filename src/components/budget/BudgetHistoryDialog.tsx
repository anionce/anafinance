import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    Stack,
    Box,
    Typography,
    LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import type { Category } from "../../types/Category";
import type { CategoryBudget } from "../../types/Budget";
import type { Transaction } from "../../types/Transaction";
import { getBudgetForMonth, calculateSpentByCategoryForMonth, calculatePercentage } from "../../services/budget";
import { getAvailableMonths, getCurrentMonth, monthlyEquivalentAmount } from "../../utils/dates";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { accent } from "../../theme/colors";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    categoryBudgets: Record<string, CategoryBudget>;
    budgetHistory: Record<string, Record<string, CategoryBudget>>;
    transactions: Transaction[];
}

function formatMonth(month: string, locale: string): string {
    const [year, m] = month.split("-").map(Number);
    if (!year || !m) return month;
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" }).format(new Date(year, m - 1, 1));
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

export default function BudgetHistoryDialog({ open, onClose, categories, categoryBudgets, budgetHistory, transactions }: Props) {
    const { t, locale } = useTranslation();
    const [month, setMonth] = useState(getCurrentMonth());

    const months = Array.from(new Set([getCurrentMonth(), ...getAvailableMonths(transactions), ...Object.keys(budgetHistory)]))
        .sort()
        .reverse();

    useEffect(() => {
        if (open) setMonth(getCurrentMonth());
    }, [open]);

    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const effectiveBudgets = getBudgetForMonth(budgetHistory, categoryBudgets, month);
    const spentByCategory = calculateSpentByCategoryForMonth(
        transactions.filter((tx) => !noComputableValues.has(tx.category)),
        month
    );

    const rows = categories
        .filter((c) => !c.noComputable && !c.incomeOnly && effectiveBudgets[c.value])
        .map((c) => {
            const budgetAmount = monthlyEquivalentAmount(effectiveBudgets[c.value]);
            const spent = spentByCategory[c.value] ?? 0;
            return { category: c, budgetAmount, spent, remaining: budgetAmount - spent };
        })
        .sort((a, b) => b.spent - a.spent);

    const totalBudget = rows.reduce((sum, r) => sum + r.budgetAmount, 0);
    const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);

    function handleDownload() {
        const header = [t.colCategory, t.budgetHistoryColBudget, t.budgetHistoryColSpent, t.budgetHistoryColRemaining];
        const body = rows.map((r) => [
            getCategoryLabel(r.category, locale),
            r.budgetAmount.toFixed(2),
            r.spent.toFixed(2),
            r.remaining.toFixed(2),
        ]);
        const totalRow = [t.budgetHistoryTotalLabel, totalBudget.toFixed(2), totalSpent.toFixed(2), (totalBudget - totalSpent).toFixed(2)];
        downloadCsv(`presupuesto-${month}.csv`, [header, ...body, totalRow]);
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.budgetHistoryDialogTitle}</DialogTitle>
            <DialogContent>
                <Select size="small" value={month} onChange={(e) => setMonth(e.target.value)} sx={{ mb: 2 }} fullWidth>
                    {months.map((m) => (
                        <MenuItem key={m} value={m}>{formatMonth(m, locale)}</MenuItem>
                    ))}
                </Select>

                {rows.length === 0 ? (
                    <Typography color="text.secondary">{t.budgetHistoryNoDataMessage}</Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {rows.map((r) => {
                            const pct = calculatePercentage(r.spent, r.budgetAmount);
                            const over = r.spent > r.budgetAmount;
                            return (
                                <Box key={r.category.value}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="body2">{getCategoryLabel(r.category, locale)}</Typography>
                                        <Typography variant="body2" color={over ? "error" : "text.secondary"}>
                                            {formatCurrency(r.spent)} / {formatCurrency(r.budgetAmount)}
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={pct}
                                        sx={{
                                            height: 6,
                                            bgcolor: accent.budgetSoft,
                                            "& .MuiLinearProgress-bar": { bgcolor: over ? "error.main" : accent.budget },
                                        }}
                                    />
                                </Box>
                            );
                        })}
                        <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: 1, borderColor: "divider" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.budgetHistoryTotalLabel}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                            </Typography>
                        </Box>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button startIcon={<DownloadIcon />} onClick={handleDownload} disabled={rows.length === 0}>
                    {t.budgetHistoryDownloadButton}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose}>{t.close}</Button>
            </DialogActions>
        </Dialog>
    );
}
