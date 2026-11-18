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
import { calculatePercentage } from "../../services/budget";
import { historyMonths, monthBudgetReport } from "../../services/budgetHistory";
import { downloadCsv } from "../../utils/csv";
import { getCurrentMonth, formatMonthLabel, shiftMonth } from "../../utils/dates";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { accent } from "../../theme/colors";
import { EditBudgetsDialog } from "./EditBudgetsDialog";
import { useOnOpen } from "../../hooks/useOnOpen";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    categoryBudgets: Record<string, CategoryBudget>;
    budgetHistory: Record<string, Record<string, CategoryBudget>>;
    transactions: Transaction[];
    onSaveMonth: (month: string, budgets: Record<string, CategoryBudget>) => void;
    estimatedIncome: number;
    savingsTarget: number;
    onSaveSavingsTarget: (savingsTarget: number) => void;
}

export const BudgetHistoryDialog = ({
    open,
    onClose,
    categories,
    categoryBudgets,
    budgetHistory,
    transactions,
    onSaveMonth,
    estimatedIncome,
    savingsTarget,
    onSaveSavingsTarget,
}: Props) => {
    const { t, locale } = useTranslation();
    const [month, setMonth] = useState(getCurrentMonth());
    const [editOpen, setEditOpen] = useState(false);

    useOnOpen(open, () => setMonth(getCurrentMonth()));

    const months = useMemo(
        () => historyMonths(month, getCurrentMonth(), transactions, budgetHistory),
        [month, transactions, budgetHistory],
    );
    const { effectiveBudgets, rows, totalBudget, totalSpent } = useMemo(
        () => monthBudgetReport(month, categories, transactions, budgetHistory, categoryBudgets),
        [month, categories, transactions, budgetHistory, categoryBudgets],
    );

    const handleDownload = () => {
        const header = [t.colCategory, t.budgetHistoryColBudget, t.budgetHistoryColSpent, t.budgetHistoryColRemaining];
        const body = rows.map((r) => [
            getCategoryLabel(r.category, locale),
            r.budgetAmount.toFixed(2),
            r.spent.toFixed(2),
            r.remaining.toFixed(2),
        ]);
        const totalRow = [t.budgetHistoryTotalLabel, totalBudget.toFixed(2), totalSpent.toFixed(2), (totalBudget - totalSpent).toFixed(2)];
        downloadCsv(`presupuesto-${month}.csv`, [header, ...body, totalRow]);
    };

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
                            <MenuItem key={m} value={m}>
                                {formatMonthLabel(m, locale)}
                            </MenuItem>
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
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {t.budgetHistoryTotalLabel}
                            </Typography>
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
                estimatedIncome={estimatedIncome}
                savingsTarget={savingsTarget}
                onSaveSavingsTarget={onSaveSavingsTarget}
                title={t.editBudgetDialogTitleForMonth(formatMonthLabel(month, locale))}
            />
        </Dialog>
    );
};
