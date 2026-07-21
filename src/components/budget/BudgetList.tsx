import { useState } from "react";
import { LinearProgress, Typography, Box, IconButton, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import type { CategoryBudget } from "../../types/Budget";
import { calculateSpentByCategory, calculatePercentage, calculateRawPercentage, calculateRemaining } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import CategoryManagerDialog from "./CategoryManagerDialog";

interface Props {
    transactions: Transaction[];
    categories: Category[];
    budgets: Record<string, CategoryBudget>;
    onEditBudget: () => void;
    onUpdateCategoryLabel: (value: string, label: string) => void;
    onAddCategory: (value: string, label: string) => void;
    onRemoveCategory: (value: string) => void;
}

export default function BudgetList({
    transactions,
    categories,
    budgets,
    onEditBudget,
    onUpdateCategoryLabel,
    onAddCategory,
    onRemoveCategory,
}: Props) {
    const { t, locale } = useTranslation();
    const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false);
    const spentByCategory = calculateSpentByCategory(transactions, budgets);

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{t.budgetByCategoryTitle}</Typography>
                <Box>
                    <IconButton size="small" onClick={() => setCategoriesDialogOpen(true)} title={t.manageCategoriesTooltip}>
                        <CategoryOutlinedIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onEditBudget} title={t.editBudgetTooltip}>
                        <EditIcon sx={{ fontSize: 20, opacity: 0.75 }} />
                    </IconButton>
                </Box>
            </Box>

            {Object.entries(budgets).map(([key, budget]) => {
                const spent = spentByCategory[key] ?? 0;
                const pct = calculatePercentage(spent, budget.amount);
                const pctRaw = calculateRawPercentage(spent, budget.amount);
                const remaining = calculateRemaining(spent, budget.amount);
                const category = categories.find((c) => c.value === key);
                const label = category ? getCategoryLabel(category, locale) : key;
                const over = spent > budget.amount;

                return (
                    <Box key={key} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2">{label}</Typography>
                                {budget.period === "bimonthly" && (
                                    <Chip label={t.bimonthly} size="small" variant="outlined" sx={{ height: 18, fontSize: 11 }} />
                                )}
                            </Box>
                            <Typography variant="body2" color={over ? "error" : "text.secondary"}>
                                {formatCurrency(spent)} / {formatCurrency(budget.amount)} · {pctRaw.toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            color={over ? "error" : "primary"}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color={over ? "error" : "text.secondary"} sx={{ display: "block", mt: 0.5 }}>
                            {over
                                ? t.overspentAmount(formatCurrency(Math.abs(remaining)))
                                : t.remainingAmount(formatCurrency(remaining))}
                        </Typography>
                    </Box>
                );
            })}

            <CategoryManagerDialog
                open={categoriesDialogOpen}
                onClose={() => setCategoriesDialogOpen(false)}
                categories={categories}
                onUpdateLabel={onUpdateCategoryLabel}
                onAdd={onAddCategory}
                onRemove={onRemoveCategory}
            />
        </Box>
    );
}
