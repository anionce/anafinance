import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import type { Category } from "../../types/Category";
import type { CategoryBudget } from "../../types/Budget";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { calculateMaxSpending, calculateTotalBudget } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";
import { useOnOpen } from "../../hooks/useOnOpen";
import { BudgetDraftFields } from "./BudgetDraftFields";
import { isBudgetable, parseAmount, parseBudgetDrafts, toBudgetDraft, toBudgetDrafts, type BudgetDraft } from "../../utils/budgetDrafts";

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

export const EditBudgetsDialog = ({
    open,
    onClose,
    categories,
    budgets,
    onSave,
    title,
    estimatedIncome,
    savingsTarget,
    onSaveSavingsTarget,
}: Props) => {
    const { t, locale } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, BudgetDraft>>({});
    const [savingsDraft, setSavingsDraft] = useState("");

    useOnOpen(open, () => {
        setDrafts(toBudgetDrafts(categories, budgets));
        setSavingsDraft(String(savingsTarget));
    });

    const handleSave = () => {
        onSave(parseBudgetDrafts(drafts));
        onSaveSavingsTarget(parseAmount(savingsDraft, savingsTarget));
        onClose();
    };

    const maxSpending = calculateMaxSpending(estimatedIncome, parseAmount(savingsDraft, savingsTarget));
    const assigned = calculateTotalBudget(parseBudgetDrafts(drafts));
    const overMax = assigned > maxSpending;

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
                    {categories.filter(isBudgetable).map((cat) => (
                        <BudgetDraftFields
                            key={cat.value}
                            label={getCategoryLabel(cat, locale)}
                            draft={drafts[cat.value] ?? toBudgetDraft()}
                            onChange={(draft) => setDrafts((d) => ({ ...d, [cat.value]: draft }))}
                        />
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.cancel}</Button>
                <Button variant="contained" onClick={handleSave}>
                    {t.save}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
