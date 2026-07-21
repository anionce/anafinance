import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Stack,
    Box,
    Typography,
} from "@mui/material";
import type { Category } from "../../types/Category";
import type { BudgetPeriod, CategoryBudget } from "../../types/Budget";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    budgets: Record<string, CategoryBudget>;
    onSave: (budgets: Record<string, CategoryBudget>) => void;
}

const EXCLUDED = ["ahorro", "transferencia", "no_computable", "vinted_wallapop"];

export default function EditBudgetsDialog({ open, onClose, categories, budgets, onSave }: Props) {
    const { t, locale } = useTranslation();
    const [amountDraft, setAmountDraft] = useState<Record<string, string>>({});
    const [periodDraft, setPeriodDraft] = useState<Record<string, BudgetPeriod>>({});

    useEffect(() => {
        if (open) {
            setAmountDraft(Object.fromEntries(categories.map((c) => [c.value, String(budgets[c.value]?.amount ?? "")])));
            setPeriodDraft(Object.fromEntries(categories.map((c) => [c.value, budgets[c.value]?.period ?? "monthly"])));
        }
    }, [open, categories, budgets]);

    function handleSave() {
        const parsed: Record<string, CategoryBudget> = {};
        for (const [key, value] of Object.entries(amountDraft)) {
            const num = Number(value);
            if (value.trim() !== "" && !isNaN(num) && num > 0) {
                parsed[key] = { amount: num, period: periodDraft[key] ?? "monthly" };
            }
        }
        onSave(parsed);
        onClose();
    }

    const editableCategories = categories.filter((c) => !EXCLUDED.includes(c.value));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.editBudgetDialogTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t.editBudgetDialogHint}
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
                                <ToggleButtonGroup
                                    size="small"
                                    exclusive
                                    value={periodDraft[cat.value] ?? "monthly"}
                                    onChange={(_, value: BudgetPeriod | null) => value && setPeriodDraft((d) => ({ ...d, [cat.value]: value }))}
                                >
                                    <ToggleButton value="monthly">{t.monthly}</ToggleButton>
                                    <ToggleButton value="bimonthly">{t.bimonthly}</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
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
