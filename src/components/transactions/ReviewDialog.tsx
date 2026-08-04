import { useRef, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
    Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweepOutlined";
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
    onDiscardOne: (id: string) => void;
    onDiscardAll: () => void;
    onFinish: () => void;
}

export default function ReviewDialog({ pending, categories, onResolve, onDiscardOne, onDiscardAll, onFinish }: Props) {
    const { t, locale } = useTranslation();
    const [selected, setSelected] = useState<string | null>(null);
    const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
    const [discarding, setDiscarding] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const reviewDismissedIds = useUIStore((s) => s.reviewDismissedIds);
    const dismissReview = useUIStore((s) => s.dismissReview);

    const pendingIds = pending.map((tx) => tx.id).join(",");

    if (pending.length === 0) {
        if (discarding) setDiscarding(false);
        return null;
    }

    const current = pending[0];
    const remaining = pending.length;
    // Stays dismissed for this exact set of pending items, even across page
    // navigation — only a genuinely new/changed pending set reopens it.
    // Hidden while the discard-all confirmation is up so the list of items
    // shrinking (as each gets deleted) isn't visible behind/through it, and
    // hidden for the whole discard (not just a pendingIds snapshot) since
    // deletions resolve one at a time and shrink pendingIds mid-flight,
    // which would otherwise no longer match the dismissed snapshot.
    const open = pendingIds !== reviewDismissedIds && !discardConfirmOpen && !discarding;

    function scrollContentToTop() {
        contentRef.current?.scrollTo({ top: 0 });
    }

    function advance(action: () => void) {
        action();
        setSelected(null);
        scrollContentToTop();

        if (remaining === 1) {
            onFinish();
        }
    }

    function handleNext() {
        if (!selected) return;
        advance(() => onResolve(current.id, selected));
    }

    function handleDiscardOne() {
        advance(() => onDiscardOne(current.id));
    }

    function handleDismiss() {
        dismissReview(pendingIds);
        onFinish();
    }

    function handleDiscardAll() {
        setDiscarding(true);
        dismissReview(pendingIds);
        onDiscardAll();
        onFinish();
    }

    return (
        <>
            <Dialog open={open} onClose={handleDismiss} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {t.reviewDialogTitle(remaining)}
                </DialogTitle>
                <DialogContent ref={contentRef}>
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
                    <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
                        <MenuItem onClick={() => { setMenuAnchor(null); handleDiscardOne(); }}>
                            <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText sx={{ color: "error.main" }}>{t.reviewDiscardOneButton}</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => { setMenuAnchor(null); setDiscardConfirmOpen(true); }}>
                            <ListItemIcon><DeleteSweepIcon fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText sx={{ color: "error.main" }}>{t.reviewDiscardAllButton}</ListItemText>
                        </MenuItem>
                    </Menu>
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
