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
    ToggleButtonGroup,
    ToggleButton,
    Stack,
} from "@mui/material";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    open: boolean;
    categories: Category[];
    onClose: () => void;
    onConfirm: (transaction: Omit<Transaction, "id">) => void;
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

export default function AddTransactionDialog({ open, categories, onClose, onConfirm }: Props) {
    const { t, locale } = useTranslation();
    const [type, setType] = useState<"expense" | "income">("expense");
    const [date, setDate] = useState(todayISO());
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState(categories[0]?.value ?? "");

    const canConfirm = description.trim() !== "" && Number(amount) > 0 && !!date && !!category;

    function reset() {
        setType("expense");
        setDate(todayISO());
        setDescription("");
        setAmount("");
        setCategory(categories[0]?.value ?? "");
    }

    function handleConfirm() {
        if (!canConfirm) return;
        const magnitude = Math.abs(Number(amount));
        onConfirm({
            date,
            description: description.trim(),
            amount: type === "expense" ? -magnitude : magnitude,
            category,
        });
        reset();
    }

    function handleClose() {
        reset();
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.addTransactionDialogTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <ToggleButtonGroup
                        value={type}
                        exclusive
                        fullWidth
                        onChange={(_, value: "expense" | "income" | null) => value && setType(value)}
                    >
                        <ToggleButton value="expense">{t.transactionTypeExpense}</ToggleButton>
                        <ToggleButton value="income">{t.transactionTypeIncome}</ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                        type="date"
                        size="small"
                        label={t.colDate}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                        size="small"
                        label={t.colDescription}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <TextField
                        type="number"
                        size="small"
                        label={t.colAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <Select
                        size="small"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        displayEmpty
                    >
                        {categories.map((c) => (
                            <MenuItem key={c.value} value={c.value}>{getCategoryLabel(c, locale)}</MenuItem>
                        ))}
                    </Select>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>{t.cancel}</Button>
                <Button variant="contained" disabled={!canConfirm} onClick={handleConfirm}>{t.add}</Button>
            </DialogActions>
        </Dialog>
    );
}
