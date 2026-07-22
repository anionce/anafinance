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
    Select,
    MenuItem,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import type { Category } from "../../types/Category";
import type { CategorizationRule } from "../../types/CategorizationRule";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    rules: CategorizationRule[];
    onAdd: (keyword: string, category: string) => void;
    onRemove: (id: string) => void;
}

export default function CategorizationRulesDialog({ open, onClose, categories, rules, onAdd, onRemove }: Props) {
    const { t, locale } = useTranslation();
    const [keyword, setKeyword] = useState("");
    const [category, setCategory] = useState(categories[0]?.value ?? "");

    function handleAdd() {
        const trimmed = keyword.trim();
        if (!trimmed || !category) return;
        onAdd(trimmed, category);
        setKeyword("");
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t.rulesDialogTitle}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t.rulesHint}</Typography>
                <Stack spacing={1.5}>
                    {rules.length === 0 && (
                        <Typography color="text.secondary">{t.noRulesYet}</Typography>
                    )}
                    {rules.map((rule) => {
                        const cat = categories.find((c) => c.value === rule.category);
                        return (
                            <Box key={rule.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    <strong>"{rule.keyword}"</strong> {t.ruleGoesTo} {cat ? getCategoryLabel(cat, locale) : rule.category}
                                </Typography>
                                <IconButton size="small" onClick={() => onRemove(rule.id)}>
                                    <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                                </IconButton>
                            </Box>
                        );
                    })}

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                        <TextField
                            size="small"
                            placeholder={t.ruleKeywordPlaceholder}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            fullWidth
                        />
                        <Select
                            size="small"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            sx={{ minWidth: 140 }}
                        >
                            {categories.map((c) => (
                                <MenuItem key={c.value} value={c.value}>{getCategoryLabel(c, locale)}</MenuItem>
                            ))}
                        </Select>
                        <IconButton size="small" onClick={handleAdd} disabled={!keyword.trim()}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t.close}</Button>
            </DialogActions>
        </Dialog>
    );
}
