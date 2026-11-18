import { useState } from "react";
import { Box, Typography, TextField, IconButton, Stack, Checkbox, FormControlLabel, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import type { Category } from "../../types/Category";
import { deriveNewCategory, resolveCategoryLabelEdit } from "../../utils/categoryDrafts";

export const CategoriesStep = ({
    uid,
    categories,
    onAdd,
    onUpdateLabel,
    onRemove,
    onToggleNoComputable,
    onToggleIncomeOnly,
}: {
    uid: string;
    categories: Category[];
    onAdd: (uid: string, value: string, label: string) => Promise<void>;
    onUpdateLabel: (uid: string, value: string, label: string) => Promise<void>;
    onRemove: (uid: string, value: string) => Promise<void>;
    onToggleNoComputable: (uid: string, value: string, noComputable: boolean) => Promise<void>;
    onToggleIncomeOnly: (uid: string, value: string, incomeOnly: boolean) => Promise<void>;
}) => {
    const { t, locale } = useTranslation();

    const [drafts, setDrafts] = useState<Record<string, string>>(() =>
        Object.fromEntries(categories.map((c) => [c.value, getCategoryLabel(c, locale)])),
    );
    const [newLabel, setNewLabel] = useState("");

    const handleLabelBlur = (value: string) => {
        const label = resolveCategoryLabelEdit(value, drafts[value], categories, locale);
        if (label) onUpdateLabel(uid, value, label);
    };

    const handleAdd = () => {
        const next = deriveNewCategory(newLabel, categories);
        if (!next) return;
        onAdd(uid, next.value, next.label);
        setNewLabel("");
    };

    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                {t.onboardingCategoriesHint}
            </Typography>
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
                        <IconButton size="small" onClick={() => onRemove(uid, cat.value)}>
                            <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 1, rowGap: 0.25 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                sx={{ mr: 0, ml: 0 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        sx={{ p: 0.5 }}
                                        checked={!!cat.noComputable}
                                        onChange={(e) => onToggleNoComputable(uid, cat.value, e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                        {t.noComputableLabel}
                                    </Typography>
                                }
                            />
                            <Tooltip title={t.noComputableInfo} arrow placement="top">
                                <IconButton size="small" sx={{ p: 0.5 }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                sx={{ mr: 0, ml: 0 }}
                                control={
                                    <Checkbox
                                        size="small"
                                        sx={{ p: 0.5 }}
                                        checked={!!cat.incomeOnly}
                                        onChange={(e) => onToggleIncomeOnly(uid, cat.value, e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                                        {t.incomeOnlyLabel}
                                    </Typography>
                                }
                            />
                            <Tooltip title={t.incomeOnlyInfo} arrow placement="top">
                                <IconButton size="small" sx={{ p: 0.5 }}>
                                    <InfoOutlinedIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
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
        </Stack>
    );
};
