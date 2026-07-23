import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    pending: Transaction[];
    categories: Category[];
    onResolve: (id: string, category: string) => void;
    onFinish: () => void;
}

export default function ReviewDialog({ pending, categories, onResolve, onFinish }: Props) {
    const { t, locale } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);

    if (pending.length === 0) return null;

    const current = pending[0];
    const remaining = pending.length;

    function handleNext() {
        if (!selected) return;

        onResolve(current.id, selected);
        setSelected(null);

        if (remaining === 1) {
            onFinish();
        }
    }

    return (
        <Dialog open={pending.length > 0} maxWidth="xs" fullWidth>
            <DialogTitle>
                {t.reviewDialogTitle(remaining)}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    {current.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatCurrency(current.amount, 2)} — {current.date}
                </Typography>

                <ToggleButtonGroup
                    orientation="vertical"
                    exclusive
                    fullWidth
                    value={selected}
                    onChange={(_, value) => setSelected(value)}
                >
                    {categories.map((cat) => (
                        <ToggleButton
                            key={cat.value}
                            value={cat.value}
                            sx={{ justifyContent: "space-between", display: "flex" }}
                        >
                            {getCategoryLabel(cat, locale)}
                            {selected === cat.value && <CheckCircleIcon sx={{ fontSize: 20 }} />}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </DialogContent>
            <DialogActions>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="contained" disabled={!selected} onClick={handleNext}>
                    {remaining === 1 ? t.finish : t.next}
                </Button>
            </DialogActions>
        </Dialog>
    );
}