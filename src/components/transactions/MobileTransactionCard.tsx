import { useState } from "react";
import { Box, IconButton, Menu, MenuItem, TextField, Typography } from "@mui/material";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditIcon from "@mui/icons-material/Edit";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { useTranslation } from "../../i18n/useTranslation";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { formatShortDate } from "../../utils/dates";
import { CategoryChip } from "./CategoryChip";
import { SignedAmount } from "./SignedAmount";

interface Props {
    tx: Transaction;
    categories: Category[];
    onCategoryChange: (id: string, category: string) => void;
    onNotesChange: (id: string, notes: string) => void;
    onCategoryClick?: (category: string) => void;
    onSplitClick: () => void;
    onDelete: () => void;
}

export const MobileTransactionCard = ({
    tx,
    categories,
    onCategoryChange,
    onNotesChange,
    onCategoryClick,
    onSplitClick,
    onDelete,
}: Props) => {
    const { t, locale } = useTranslation();
    const [categoryAnchor, setCategoryAnchor] = useState<HTMLElement | null>(null);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notesDraft, setNotesDraft] = useState(tx.notes ?? "");

    const saveNotes = () => {
        if (notesDraft !== (tx.notes ?? "")) onNotesChange(tx.id, notesDraft);
        setEditingNotes(false);
    };

    const pickCategory = (category: string) => {
        onCategoryChange(tx.id, category);
        setCategoryAnchor(null);
    };

    return (
        <Box sx={{ p: 1.5, borderRadius: "12px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, minWidth: 0 }}>
                    {tx.description}
                </Typography>
                <SignedAmount amount={tx.amount} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 0.75 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {formatShortDate(tx.date, locale)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 0 }}>
                    <CategoryChip category={categories.find((c) => c.value === tx.category)} onClick={onCategoryClick} />
                    <IconButton size="small" aria-label={t.editCategoryLabel} onClick={(e) => setCategoryAnchor(e.currentTarget)}>
                        <EditIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" aria-label={t.editNotesLabel} onClick={() => setEditingNotes((v) => !v)}>
                        <NoteAltOutlinedIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" aria-label={t.splitTooltip} title={t.splitTooltip} onClick={onSplitClick}>
                        <CallSplitIcon sx={{ fontSize: 15, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" aria-label={t.deleteTransactionTooltip} title={t.deleteTransactionTooltip} onClick={onDelete}>
                        <DeleteOutlineIcon sx={{ fontSize: 15, opacity: 0.6 }} />
                    </IconButton>
                </Box>
            </Box>

            <Menu anchorEl={categoryAnchor} open={!!categoryAnchor} onClose={() => setCategoryAnchor(null)}>
                {categories.map((c) => (
                    <MenuItem key={c.value} selected={c.value === tx.category} onClick={() => pickCategory(c.value)}>
                        {getCategoryLabel(c, locale)}
                    </MenuItem>
                ))}
            </Menu>

            {editingNotes ? (
                <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    placeholder={t.colNotes}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    onBlur={saveNotes}
                    onKeyDown={(e) => e.key === "Enter" && saveNotes()}
                    sx={{ mt: 1 }}
                />
            ) : (
                tx.notes && (
                    <Typography
                        variant="caption"
                        sx={{ display: "block", color: "text.secondary", mt: 0.75 }}
                        onClick={() => setEditingNotes(true)}
                    >
                        {tx.notes}
                    </Typography>
                )
            )}
        </Box>
    );
};
