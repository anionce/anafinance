import { useMemo, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Select,
    MenuItem,
    Stack,
    Box,
    Typography,
    LinearProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Category } from "../../types/Category";
import type { CategoryBudget } from "../../types/Budget";
import type { Transaction } from "../../types/Transaction";
import { getBudgetForMonth, calculateSpentByCategoryForMonth, calculatePercentage } from "../../services/budget";
import { getAvailableMonths, getCurrentMonth, monthlyEquivalentAmount, formatMonthLabel, shiftMonth } from "../../utils/dates";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { accent } from "../../theme/colors";
import EditBudgetsDialog from "./EditBudgetsDialog";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    categoryBudgets: Record<string, CategoryBudget>;
    budgetHistory: Record<string, Record<string, CategoryBudget>>;
    transactions: Transaction[];
    onSaveMonth: (month: string, budgets: Record<string, CategoryBudget>) => void;
}

interface BudgetRow {
    category: Category;
    /** 0 when this category has no budget for the month — spending still shows, just with no target to compare against. */
    budgetAmount: number;
    spent: number;
    remaining: number;
}

/** How many months past the current one are always offered in the picker, so a
 *  future month's budget can be set in advance even before it has any data. */
const FUTURE_MONTHS_AHEAD = 12;

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

export default function BudgetHistoryDialog({ open, onClose, categories, categoryBudgets, budgetHistory, transactions, onSaveMonth }: Props) {
    const { t, locale } = useTranslation();
    const [month, setMonth] = useState(getCurrentMonth());
    const [editOpen, setEditOpen] = useState(false);

    // Resets the selected month each time the dialog opens — see the same
    // comment in CategoryManagerDialog.tsx.
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) setMonth(getCurrentMonth());
    }

    // Skipped while closed — Layout mounts this dialog on every page, so this
    // would otherwise re-scan the full transaction list on every render.
    const { months, effectiveBudgets, rows, totalBudget, totalSpent } = useMemo(() => {
        if (!open) {
            return { months: [] as string[], effectiveBudgets: {} as Record<string, CategoryBudget>, rows: [] as BudgetRow[], totalBudget: 0, totalSpent: 0 };
        }

        const currentMonth = getCurrentMonth();
        const futureMonths = Array.from({ length: FUTURE_MONTHS_AHEAD }, (_, i) => shiftMonth(currentMonth, i + 1));
        // Always includes `month` itself — the prev/next arrows can land on a
        // month outside this "usual" range, and the Select needs a matching
        // MenuItem for whatever is currently selected.
        const months = Array.from(new Set([month, ...futureMonths, currentMonth, ...getAvailableMonths(transactions), ...Object.keys(budgetHistory)]))
            .sort()
            .reverse();

        const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
        const effectiveBudgets = getBudgetForMonth(budgetHistory, categoryBudgets, month);
        const spentByCategory = calculateSpentByCategoryForMonth(
            transactions.filter((tx) => !noComputableValues.has(tx.category)),
            month
        );

        // A full breakdown of where money went that month — not just the
        // categories that happen to have a budget set.
        const rows: BudgetRow[] = categories
            .filter((c) => !c.noComputable && !c.incomeOnly && (effectiveBudgets[c.value] || spentByCategory[c.value]))
            .map((c) => {
                const budgetAmount = effectiveBudgets[c.value] ? monthlyEquivalentAmount(effectiveBudgets[c.value]) : 0;
                const spent = spentByCategory[c.value] ?? 0;
                return { category: c, budgetAmount, spent, remaining: budgetAmount - spent };
            })
            .sort((a, b) => b.spent - a.spent);

        const totalBudget = rows.reduce((sum, r) => sum + r.budgetAmount, 0);
        const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);

        return { months, effectiveBudgets, rows, totalBudget, totalSpent };
    }, [open, transactions, budgetHistory, categories, categoryBudgets, month]);

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
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                    <IconButton size="small" onClick={() => setMonth(shiftMonth(month, -1))} title={t.prevMonthTooltip}>
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Select size="small" value={month} onChange={(e) => setMonth(e.target.value)} fullWidth>
                        {months.map((m) => (
                            <MenuItem key={m} value={m}>{formatMonthLabel(m, locale)}</MenuItem>
                        ))}
                    </Select>
                    <IconButton size="small" onClick={() => setMonth(shiftMonth(month, 1))} title={t.nextMonthTooltip}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Box>

                {rows.length === 0 ? (
                    <Typography color="text.secondary">{t.budgetHistoryNoDataMessage}</Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {rows.map((r) => {
                            const hasBudget = r.budgetAmount > 0;
                            const pct = hasBudget ? calculatePercentage(r.spent, r.budgetAmount) : 0;
                            const over = hasBudget && r.spent > r.budgetAmount;
                            return (
                                <Box key={r.category.value}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                        <Typography variant="body2">{getCategoryLabel(r.category, locale)}</Typography>
                                        <Typography variant="body2" color={over ? "error" : "text.secondary"}>
                                            {hasBudget
                                                ? `${formatCurrency(r.spent)} / ${formatCurrency(r.budgetAmount)}`
                                                : `${formatCurrency(r.spent)} · ${t.budgetHistoryNoBudgetLabel}`}
                                        </Typography>
                                    </Box>
                                    {hasBudget && (
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{
                                                height: 6,
                                                bgcolor: accent.budgetSoft,
                                                "& .MuiLinearProgress-bar": { bgcolor: over ? "error.main" : accent.statusGreat },
                                            }}
                                        />
                                    )}
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
            <DialogActions sx={{ flexWrap: "wrap" }}>
                <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                    {t.budgetHistoryEditButton}
                </Button>
                <Button startIcon={<DownloadIcon />} onClick={handleDownload} disabled={rows.length === 0}>
                    {t.budgetHistoryDownloadButton}
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose}>{t.close}</Button>
            </DialogActions>

            <EditBudgetsDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                categories={categories}
                budgets={effectiveBudgets}
                onSave={(budgets) => onSaveMonth(month, budgets)}
                title={t.editBudgetDialogTitleForMonth(formatMonthLabel(month, locale))}
            />
        </Dialog>
    );
}
