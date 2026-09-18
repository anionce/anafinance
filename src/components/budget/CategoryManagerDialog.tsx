import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Box,
    Stack,
    Typography,
    Checkbox,
    Menu,
    MenuItem,
    Divider,
    Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import type { Category } from "../../types/Category";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { deriveNewCategory, resolveCategoryLabelEdit } from "../../utils/categoryDrafts";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    onUpdateLabel: (value: string, label: string) => void;
    onRemove: (value: string) => void;
    onAdd: (value: string, label: string) => void;
    onToggleNoComputable: (value: string, noComputable: boolean) => void;
    onToggleIncomeOnly: (value: string, incomeOnly: boolean) => void;
    onToggleExcludeFromBalance: (value: string, excludeFromBalance: boolean) => void;
    onReorder: (categories: Category[]) => void;
}

export default function CategoryManagerDialog({ open, onClose, categories, onUpdateLabel, onRemove, onAdd, onToggleNoComputable, onToggleIncomeOnly, onToggleExcludeFromBalance, onReorder }: Props) {
    const { t, locale } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [newLabel, setNewLabel] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [menuFor, setMenuFor] = useState<{ index: number; el: HTMLElement } | null>(null);

    // Resets the drafts each time the dialog opens (not on every render while
    // open) — adjusting state during render instead of an effect, per
    // https://react.dev/learn/you-might-not-need-an-effect#adjusting-state-based-on-a-prop
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setDrafts(Object.fromEntries(categories.map((c) => [c.value, getCategoryLabel(c, locale)])));
        }
    }

    function handleLabelBlur(value: string) {
        const label = resolveCategoryLabelEdit(value, drafts[value], categories, locale);
        if (label) onUpdateLabel(value, label);
    }

    function handleAdd() {
        const next = deriveNewCategory(newLabel, categories);
        if (!next) return;
        onAdd(next.value, next.label);
        setNewLabel("");
    }

    function move(index: number, delta: number) {
        const target = index + delta;
        if (target < 0 || target >= categories.length) return;
        const reordered = [...categories];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        onReorder(reordered);
    }

    function handleDrop(targetIndex: number) {
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            return;
        }
        const reordered = [...categories];
        const [moved] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        onReorder(reordered);
        setDraggedIndex(null);
    }

    const menuCategory = menuFor ? categories[menuFor.index] : undefined;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.manageCategoriesDialogTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {categories.map((cat, index) => (
                        <Box
                            key={cat.value}
                            sx={{ display: "flex", alignItems: "center", gap: 0.5, opacity: draggedIndex === index ? 0.4 : 1 }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(index)}
                        >
                            <Box
                                draggable
                                onDragStart={() => setDraggedIndex(index)}
                                onDragEnd={() => setDraggedIndex(null)}
                                sx={{ display: "flex", alignItems: "center", opacity: 0.4, cursor: "grab", "&:active": { cursor: "grabbing" } }}
                            >
                                <DragIndicatorIcon fontSize="small" />
                            </Box>
                            <TextField
                                size="small"
                                value={drafts[cat.value] ?? cat.label}
                                onChange={(e) => setDrafts((d) => ({ ...d, [cat.value]: e.target.value }))}
                                onBlur={() => handleLabelBlur(cat.value)}
                                fullWidth
                            />
                            <IconButton size="small" onClick={(e) => setMenuFor({ index, el: e.currentTarget })}>
                                <MoreVertIcon fontSize="small" sx={{ opacity: 0.5 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => onRemove(cat.value)}>
                                <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                            </IconButton>
                        </Box>
                    ))}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                        <TextField
                            size="small"
                            placeholder={t.newCategoryPlaceholder}
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            fullWidth
                        />
                        <IconButton size="small" onClick={handleAdd} disabled={!newLabel.trim()}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        {t.categoriesHint}
                    </Typography>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.close}</Button>
            </DialogActions>

            <Menu anchorEl={menuFor?.el} open={!!menuFor} onClose={() => setMenuFor(null)}>
                {menuFor && menuCategory && [
                    <MenuItem
                        key="up"
                        disabled={menuFor.index === 0}
                        onClick={() => { move(menuFor.index, -1); setMenuFor(null); }}
                    >
                        <ArrowUpwardIcon fontSize="small" sx={{ mr: 1.5 }} />
                        {t.moveCategoryUpLabel}
                    </MenuItem>,
                    <MenuItem
                        key="down"
                        disabled={menuFor.index === categories.length - 1}
                        onClick={() => { move(menuFor.index, 1); setMenuFor(null); }}
                    >
                        <ArrowDownwardIcon fontSize="small" sx={{ mr: 1.5 }} />
                        {t.moveCategoryDownLabel}
                    </MenuItem>,
                    <Divider key="divider" />,
                    <MenuItem key="noComputable" onClick={() => onToggleNoComputable(menuCategory.value, !menuCategory.noComputable)}>
                        <Checkbox size="small" checked={!!menuCategory.noComputable} sx={{ p: 0, mr: 1.5, pointerEvents: "none" }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>{t.noComputableLabel}</Typography>
                        <Tooltip title={t.noComputableInfo} arrow placement="top">
                            <IconButton size="small" sx={{ p: 0.5, ml: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                            </IconButton>
                        </Tooltip>
                    </MenuItem>,
                    <MenuItem key="incomeOnly" onClick={() => onToggleIncomeOnly(menuCategory.value, !menuCategory.incomeOnly)}>
                        <Checkbox size="small" checked={!!menuCategory.incomeOnly} sx={{ p: 0, mr: 1.5, pointerEvents: "none" }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>{t.incomeOnlyLabel}</Typography>
                        <Tooltip title={t.incomeOnlyInfo} arrow placement="top">
                            <IconButton size="small" sx={{ p: 0.5, ml: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                            </IconButton>
                        </Tooltip>
                    </MenuItem>,
                    <MenuItem key="excludeFromBalance" onClick={() => onToggleExcludeFromBalance(menuCategory.value, !menuCategory.excludeFromBalance)}>
                        <Checkbox size="small" checked={!!menuCategory.excludeFromBalance} sx={{ p: 0, mr: 1.5, pointerEvents: "none" }} />
                        <Typography variant="body2" sx={{ flex: 1 }}>{t.excludeFromBalanceLabel}</Typography>
                        <Tooltip title={t.excludeFromBalanceInfo} arrow placement="top">
                            <IconButton size="small" sx={{ p: 0.5, ml: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                            </IconButton>
                        </Tooltip>
                    </MenuItem>,
                ]}
            </Menu>
        </Dialog>
    );
}
