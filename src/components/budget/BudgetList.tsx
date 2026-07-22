import { useState } from "react";
import { Card, Grid, LinearProgress, Typography, Box, IconButton, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import type { CategoryBudget } from "../../types/Budget";
import type { CategorizationRule } from "../../types/CategorizationRule";
import { calculateSpentByCategory, calculatePercentage, calculateRawPercentage, calculateRemaining } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { accent } from "../../theme/colors";
import CategoryManagerDialog from "./CategoryManagerDialog";
import CategorizationRulesDialog from "./CategorizationRulesDialog";
import type { TranslationSet } from "../../i18n/translations";

interface Props {
    transactions: Transaction[];
    categories: Category[];
    budgets: Record<string, CategoryBudget>;
    onEditBudget: () => void;
    onUpdateCategoryLabel: (value: string, label: string) => void;
    onAddCategory: (value: string, label: string) => void;
    onRemoveCategory: (value: string) => void;
    onToggleNoComputable: (value: string, noComputable: boolean) => void;
    categorizationRules: CategorizationRule[];
    onAddRule: (keyword: string, category: string) => void;
    onRemoveRule: (id: string) => void;
}

function periodChipLabel(budget: CategoryBudget, t: TranslationSet): string | null {
    switch (budget.period) {
        case "weekly": return t.weekly;
        case "bimonthly": return t.bimonthly;
        case "everyNMonths": return t.everyNMonthsChip(Math.max(budget.intervalMonths ?? 1, 1));
        case "yearly": return t.yearly;
        case "monthly":
        default: return null;
    }
}

export default function BudgetList({
    transactions,
    categories,
    budgets,
    onEditBudget,
    onUpdateCategoryLabel,
    onAddCategory,
    onRemoveCategory,
    onToggleNoComputable,
    categorizationRules,
    onAddRule,
    onRemoveRule,
}: Props) {
    const { t, locale } = useTranslation();
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
    const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
    const spentByCategory = calculateSpentByCategory(transactions, budgets);

    return (
        <Card sx={{ mt: 4, p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6">{t.budgetByCategoryTitle}</Typography>
                <Box>
                    <IconButton size="small" onClick={() => setCategoriesDialogOpen(true)} title={t.manageCategoriesTooltip}>
                        <CategoryOutlinedIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => setRulesDialogOpen(true)} title={t.manageRulesTooltip}>
                        <RuleOutlinedIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onEditBudget} title={t.editBudgetTooltip}>
                        <EditIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {Object.entries(budgets).map(([key, budget]) => {
                    const spent = spentByCategory[key] ?? 0;
                    const pct = calculatePercentage(spent, budget.amount);
                    const pctRaw = calculateRawPercentage(spent, budget.amount);
                    const remaining = calculateRemaining(spent, budget.amount);
                    const category = categories.find((c) => c.value === key);
                    const label = category ? getCategoryLabel(category, locale) : key;
                    const over = spent > budget.amount;
                    const chipLabel = periodChipLabel(budget, t);

                    return (
                        <Grid key={key} size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ p: 2, borderRadius: "10px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", height: "100%" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>{label}</Typography>
                                    {chipLabel && (
                                        <Chip label={chipLabel} size="small" variant="outlined" />
                                    )}
                                </Box>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    {formatCurrency(spent)}{" "}
                                    <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontFamily: "inherit" }}>
                                        / {formatCurrency(budget.amount)}
                                    </Typography>
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={pct}
                                    sx={{
                                        height: 8,
                                        bgcolor: accent.budgetSoft,
                                        "& .MuiLinearProgress-bar": { bgcolor: over ? "error.main" : accent.budget },
                                    }}
                                />
                                <Typography variant="body2" color={over ? "error" : "text.secondary"} sx={{ mt: 1 }}>
                                    {over
                                        ? t.overspentAmount(formatCurrency(Math.abs(remaining)))
                                        : t.remainingAmount(formatCurrency(remaining))}
                                    {" · "}{pctRaw.toFixed(0)}%
                                </Typography>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>

            <CategoryManagerDialog
                open={categoriesDialogOpen}
                onClose={() => setCategoriesDialogOpen(false)}
                categories={categories}
                onUpdateLabel={onUpdateCategoryLabel}
                onAdd={onAddCategory}
                onRemove={onRemoveCategory}
                onToggleNoComputable={onToggleNoComputable}
            />

            <CategorizationRulesDialog
                open={rulesDialogOpen}
                onClose={() => setRulesDialogOpen(false)}
                categories={categories}
                rules={categorizationRules}
                onAdd={onAddRule}
                onRemove={onRemoveRule}
            />
        </Card>
    );
}
