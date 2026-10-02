import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    Stack,
    Box,
    Typography,
} from "@mui/material";
import type { Category } from "../../types/Category";
import type { BudgetPeriod, CategoryBudget } from "../../types/Budget";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { calculateMaxSpending, calculateTotalBudget } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    budgets: Record<string, CategoryBudget>;
    onSave: (budgets: Record<string, CategoryBudget>) => void;
    title?: string;
    estimatedIncome: number;
    savingsTarget: number;
    onSaveSavingsTarget: (savingsTarget: number) => void;
}

function parseAmount(raw: string, fallback: number): number {
    const num = Number(raw);
    return raw.trim() !== "" && !isNaN(num) && num >= 0 ? num : fallback;
}

export default function EditBudgetsDialog({ open, onClose, categories, budgets, onSave, title, estimatedIncome, savingsTarget, onSaveSavingsTarget }: Props) {
    const { t, locale } = useTranslation();
    const [amountDraft, setAmountDraft] = useState<Record<string, string>>({});
    const [periodDraft, setPeriodDraft] = useState<Record<string, BudgetPeriod>>({});
    const [intervalDraft, setIntervalDraft] = useState<Record<string, string>>({});
    const [savingsDraft, setSavingsDraft] = useState("");

    // Resets the drafts each time the dialog opens, not on every render while
    // open — see the same comment in CategoryManagerDialog.tsx.
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setAmountDraft(Object.fromEntries(categories.map((c) => [c.value, String(budgets[c.value]?.amount ?? "")])));
            setPeriodDraft(Object.fromEntries(categories.map((c) => [c.value, budgets[c.value]?.period ?? "monthly"])));
            setIntervalDraft(Object.fromEntries(categories.map((c) => [c.value, String(budgets[c.value]?.intervalMonths ?? 3)])));
            setSavingsDraft(String(savingsTarget));
        }
    }

    function buildBudgets(): Record<string, CategoryBudget> {
        const parsed: Record<string, CategoryBudget> = {};
        for (const [key, value] of Object.entries(amountDraft)) {
            const num = Number(value);
            if (value.trim() !== "" && !isNaN(num) && num > 0) {
                const period = periodDraft[key] ?? "monthly";
                parsed[key] = {
                    amount: num,
                    period,
                    ...(period === "everyNMonths" ? { intervalMonths: Math.max(Number(intervalDraft[key]) || 1, 1) } : {}),
                };
            }
        }
        return parsed;
    }

    function handleSave() {
        onSave(buildBudgets());
        onSaveSavingsTarget(parseAmount(savingsDraft, savingsTarget));
        onClose();
    }

    const maxSpending = calculateMaxSpending(estimatedIncome, parseAmount(savingsDraft, savingsTarget));
    const assigned = calculateTotalBudget(buildBudgets());
    const overMax = assigned > maxSpending;

    const editableCategories = categories.filter((c) => !c.noComputable && !c.incomeOnly);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title ?? t.editBudgetDialogTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t.editBudgetDialogHint}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {t.estimatedIncomeLabel}: {formatCurrency(estimatedIncome)}
                </Typography>
                <TextField
                    type="number"
                    size="small"
                    label={t.savingsTargetLabel}
                    value={savingsDraft}
                    onChange={(e) => setSavingsDraft(e.target.value)}
                    fullWidth
                    sx={{ mb: 1 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {t.savingsMaxSpend(formatCurrency(maxSpending))}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: overMax ? "error.main" : "success.main" }}>
                    {overMax
                        ? t.savingsAssignedOver(formatCurrency(assigned), formatCurrency(assigned - maxSpending))
                        : t.savingsAssignedWithin(formatCurrency(assigned), formatCurrency(maxSpending - assigned))}
                </Typography>
                <Stack spacing={2}>
                    {editableCategories.map((cat) => (
                        <Box key={cat.value} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            <Typography variant="body2">{getCategoryLabel(cat, locale)}</Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <TextField
                                    type="number"
                                    size="small"
                                    value={amountDraft[cat.value] ?? ""}
                                    onChange={(e) => setAmountDraft((d) => ({ ...d, [cat.value]: e.target.value }))}
                                    sx={{ flex: 1 }}
                                />
                                <Select
                                    size="small"
                                    value={periodDraft[cat.value] ?? "monthly"}
                                    onChange={(e) => setPeriodDraft((d) => ({ ...d, [cat.value]: e.target.value as BudgetPeriod }))}
                                    sx={{ minWidth: 140 }}
                                >
                                    <MenuItem value="weekly">{t.weekly}</MenuItem>
                                    <MenuItem value="monthly">{t.monthly}</MenuItem>
                                    <MenuItem value="bimonthly">{t.bimonthly}</MenuItem>
                                    <MenuItem value="everyNMonths">{t.everyNMonths}</MenuItem>
                                    <MenuItem value="yearly">{t.yearly}</MenuItem>
                                </Select>
                            </Box>
                            {periodDraft[cat.value] === "everyNMonths" && (
                                <TextField
                                    type="number"
                                    size="small"
                                    label={t.intervalMonthsLabel}
                                    value={intervalDraft[cat.value] ?? ""}
                                    onChange={(e) => setIntervalDraft((d) => ({ ...d, [cat.value]: e.target.value }))}
                                    sx={{ maxWidth: 180 }}
                                />
                            )}
                        </Box>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.cancel}</Button>
                <Button variant="contained" onClick={handleSave}>{t.save}</Button>
            </DialogActions>
        </Dialog>
    );
}
