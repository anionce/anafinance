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
import { useUIStore } from "../../store/uiStore";
import ConfirmDialog from "../ConfirmDialog";

interface Props {
    pending: Transaction[];
    categories: Category[];
    onResolve: (id: string, category: string) => void;
    onDiscardAll: () => void;
    onFinish: () => void;
}

export default function ReviewDialog({ pending, categories, onResolve, onDiscardAll, onFinish }: Props) {
    const { t, locale } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);
    const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
    const reviewDismissedIds = useUIStore((s) => s.reviewDismissedIds);
    const dismissReview = useUIStore((s) => s.dismissReview);

    const pendingIds = pending.map((tx) => tx.id).join(",");

    if (pending.length === 0) return null;

    const current = pending[0];
    const remaining = pending.length;
    // Stays dismissed for this exact set of pending items, even across page
    // navigation — only a genuinely new/changed pending set reopens it.
    const open = pendingIds !== reviewDismissedIds;

    function handleNext() {
        if (!selected) return;

        onResolve(current.id, selected);
        setSelected(null);

        if (remaining === 1) {
            onFinish();
        }
    }

    function handleDismiss() {
        dismissReview(pendingIds);
        onFinish();
    }

    function handleDiscardAll() {
        onDiscardAll();
        onFinish();
    }

    return (
        <>
            <Dialog open={open} onClose={handleDismiss} maxWidth="xs" fullWidth>
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
                <DialogActions sx={{ flexWrap: "wrap" }}>
                    <Button color="error" onClick={() => setDiscardConfirmOpen(true)}>{t.reviewDiscardAllButton}</Button>
                    <Button onClick={handleDismiss}>{t.reviewLaterButton}</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button variant="contained" disabled={!selected} onClick={handleNext}>
                        {remaining === 1 ? t.finish : t.next}
                    </Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog
                open={discardConfirmOpen}
                onClose={() => setDiscardConfirmOpen(false)}
                title={t.reviewDiscardAllConfirmTitle}
                message={t.reviewDiscardAllConfirmMessage(remaining)}
                confirmLabel={t.reviewDiscardAllButton}
                danger
                onConfirm={handleDiscardAll}
            />
        </>
    );
}
