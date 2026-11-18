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
    Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { Category } from "../../types/Category";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { deriveNewCategory, resolveCategoryLabelEdit } from "../../utils/categoryDrafts";
import { useOnOpen } from "../../hooks/useOnOpen";

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
}

export const CategoryManagerDialog = ({
    open,
    onClose,
    categories,
    onUpdateLabel,
    onRemove,
    onAdd,
    onToggleNoComputable,
    onToggleIncomeOnly,
    onToggleExcludeFromBalance,
}: Props) => {
    const { t, locale } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [newLabel, setNewLabel] = useState("");
    const [menuFor, setMenuFor] = useState<{ index: number; el: HTMLElement } | null>(null);

    useOnOpen(open, () => setDrafts(Object.fromEntries(categories.map((c) => [c.value, getCategoryLabel(c, locale)]))));

    const handleLabelBlur = (value: string) => {
        const label = resolveCategoryLabelEdit(value, drafts[value], categories, locale);
        if (label) onUpdateLabel(value, label);
    };

    const handleAdd = () => {
        const next = deriveNewCategory(newLabel, categories);
        if (!next) return;
        onAdd(next.value, next.label);
        setNewLabel("");
    };

    const menuCategory = menuFor ? categories[menuFor.index] : undefined;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.manageCategoriesDialogTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {categories.map((cat, index) => (
                        <Box key={cat.value} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                {menuFor &&
                    menuCategory && [
                        <MenuItem key="noComputable" onClick={() => onToggleNoComputable(menuCategory.value, !menuCategory.noComputable)}>
                            <Checkbox size="small" checked={!!menuCategory.noComputable} sx={{ p: 0, mr: 1.5, pointerEvents: "none" }} />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {t.noComputableLabel}
                            </Typography>
                            <Tooltip title={t.noComputableInfo} arrow placement="top">
                                <IconButton size="small" sx={{ p: 0.5, ml: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                    <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                                </IconButton>
                            </Tooltip>
                        </MenuItem>,
                        <MenuItem key="incomeOnly" onClick={() => onToggleIncomeOnly(menuCategory.value, !menuCategory.incomeOnly)}>
                            <Checkbox size="small" checked={!!menuCategory.incomeOnly} sx={{ p: 0, mr: 1.5, pointerEvents: "none" }} />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {t.incomeOnlyLabel}
                            </Typography>
                            <Tooltip title={t.incomeOnlyInfo} arrow placement="top">
                                <IconButton size="small" sx={{ p: 0.5, ml: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                    <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                                </IconButton>
                            </Tooltip>
                        </MenuItem>,
                        <MenuItem
                            key="excludeFromBalance"
                            onClick={() => onToggleExcludeFromBalance(menuCategory.value, !menuCategory.excludeFromBalance)}
                        >
                            <Checkbox
                                size="small"
                                checked={!!menuCategory.excludeFromBalance}
                                sx={{ p: 0, mr: 1.5, pointerEvents: "none" }}
                            />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                                {t.excludeFromBalanceLabel}
                            </Typography>
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
};
