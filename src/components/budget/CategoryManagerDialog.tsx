import { useEffect, useState } from "react";
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
    FormControlLabel,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import type { Category } from "../../types/Category";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    onUpdateLabel: (value: string, label: string) => void;
    onRemove: (value: string) => void;
    onAdd: (value: string, label: string) => void;
    onToggleNoComputable: (value: string, noComputable: boolean) => void;
    onToggleIncomeOnly: (value: string, incomeOnly: boolean) => void;
}

function slugify(label: string): string {
    return label
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}

export default function CategoryManagerDialog({ open, onClose, categories, onUpdateLabel, onRemove, onAdd, onToggleNoComputable, onToggleIncomeOnly }: Props) {
    const { t, locale } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        if (open) {
            setDrafts(Object.fromEntries(categories.map((c) => [c.value, getCategoryLabel(c, locale)])));
        }
    }, [open, categories, locale]);

    function handleLabelBlur(value: string) {
        const label = drafts[value]?.trim();
        const original = categories.find((c) => c.value === value);
        const originalDisplay = original ? getCategoryLabel(original, locale) : undefined;
        if (label && label !== originalDisplay) {
            onUpdateLabel(value, label);
        }
    }

    function handleAdd() {
        const label = newLabel.trim();
        if (!label) return;
        const value = slugify(label);
        if (!value || categories.some((c) => c.value === value)) return;
        onAdd(value, label);
        setNewLabel("");
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.manageCategoriesDialogTitle}</DialogTitle>
            <DialogContent>
                <Stack spacing={1.5}>
                    {categories.map((cat) => (
                        <Box key={cat.value} sx={{ display: "flex", flexDirection: "column" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <TextField
                                    size="small"
                                    value={drafts[cat.value] ?? cat.label}
                                    onChange={(e) => setDrafts((d) => ({ ...d, [cat.value]: e.target.value }))}
                                    onBlur={() => handleLabelBlur(cat.value)}
                                    fullWidth
                                />
                                <IconButton size="small" onClick={() => onRemove(cat.value)}>
                                    <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                                </IconButton>
                            </Box>
                            <FormControlLabel
                                sx={{ ml: 0.5 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={!!cat.noComputable}
                                        onChange={(e) => onToggleNoComputable(cat.value, e.target.checked)}
                                    />
                                }
                                label={<Typography variant="caption" color="text.secondary">{t.noComputableLabel}</Typography>}
                            />
                            <FormControlLabel
                                sx={{ ml: 0.5 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={!!cat.incomeOnly}
                                        onChange={(e) => onToggleIncomeOnly(cat.value, e.target.checked)}
                                    />
                                }
                                label={<Typography variant="caption" color="text.secondary">{t.incomeOnlyLabel}</Typography>}
                            />
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
        </Dialog>
    );
}
