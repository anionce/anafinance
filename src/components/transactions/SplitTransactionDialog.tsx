import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    IconButton,
    Box,
    Stack,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { Transaction } from "../../types/Transaction";
import type { Category } from "../../types/Category";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { formatCurrency } from "../../utils/currency";

interface Props {
    open: boolean;
    transaction: Transaction | null;
    categories: Category[];
    onClose: () => void;
    onConfirm: (portions: { category: string; amount: number }[]) => void;
}

interface Portion {
    category: string;
    amount: string;
}

export default function SplitTransactionDialog({ open, transaction, categories, onClose, onConfirm }: Props) {
    const { t, locale } = useTranslation();
    const [portions, setPortions] = useState<Portion[]>([]);

    useEffect(() => {
        if (open && transaction) {
            const total = Math.abs(transaction.amount);
            const half = Math.round((total / 2) * 100) / 100;
            setPortions([
                { category: transaction.category || (categories[0]?.value ?? ""), amount: String(half) },
                { category: categories[0]?.value ?? "", amount: String(Math.round((total - half) * 100) / 100) },
            ]);
        }
    }, [open, transaction, categories]);

    if (!transaction) return null;

    const total = Math.abs(transaction.amount);
    const assigned = portions.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const remaining = Math.round((total - assigned) * 100) / 100;
    const allValid = portions.length >= 2 && portions.every((p) => p.category && Number(p.amount) > 0);
    const canConfirm = allValid && Math.abs(remaining) < 0.01;

    function updatePortion(index: number, patch: Partial<Portion>) {
        setPortions((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    }

    function addPortion() {
        setPortions((prev) => [...prev, { category: categories[0]?.value ?? "", amount: "" }]);
    }

    function removePortion(index: number) {
        setPortions((prev) => prev.filter((_, i) => i !== index));
    }

    function handleConfirm() {
        if (!canConfirm) return;
        onConfirm(portions.map((p) => ({ category: p.category, amount: Number(p.amount) })));
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.splitDialogTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{transaction.description}</Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>{formatCurrency(total)}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t.splitDialogHint}</Typography>

                <Stack spacing={1.5}>
                    {portions.map((portion, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                                type="number"
                                size="small"
                                value={portion.amount}
                                onChange={(e) => updatePortion(i, { amount: e.target.value })}
                                sx={{ maxWidth: 110 }}
                            />
                            <Select
                                size="small"
                                value={portion.category}
                                onChange={(e) => updatePortion(i, { category: e.target.value })}
                                fullWidth
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.value} value={c.value}>{getCategoryLabel(c, locale)}</MenuItem>
                                ))}
                            </Select>
                            <IconButton size="small" onClick={() => removePortion(i)} disabled={portions.length <= 2}>
                                <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                            </IconButton>
                        </Box>
                    ))}

                    <Button startIcon={<AddIcon />} size="small" onClick={addPortion} sx={{ alignSelf: "flex-start" }}>
                        {t.splitAddPortion}
                    </Button>

                    <Typography variant="body2" color={Math.abs(remaining) < 0.01 ? "success.main" : "warning.main"}>
                        {Math.abs(remaining) < 0.01 ? t.splitAllAssignedLabel : t.splitRemainingLabel(formatCurrency(remaining, 2))}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.cancel}</Button>
                <Button variant="contained" disabled={!canConfirm} onClick={handleConfirm}>{t.splitConfirm}</Button>
            </DialogActions>
        </Dialog>
    );
}
