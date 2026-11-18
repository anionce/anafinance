import { useState } from "react";
import { Typography, Stack } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import type { CategoryBudget } from "../../types/Budget";
import { BudgetDraftFields } from "../budget/BudgetDraftFields";
import { isBudgetable, parseBudgetDrafts, toBudgetDrafts, type BudgetDraft } from "../../utils/budgetDrafts";
import type { Category } from "../../types/Category";

export const BudgetsStep = ({
    uid,
    categories,
    setCategoryBudgets,
}: {
    uid: string;
    categories: Category[];
    setCategoryBudgets: (uid: string, budgets: Record<string, CategoryBudget>) => Promise<void>;
}) => {
    const { t, locale } = useTranslation();
    const budgetableCategories = categories.filter(isBudgetable);
    const [drafts, setDrafts] = useState<Record<string, BudgetDraft>>(() => toBudgetDrafts(budgetableCategories, {}));

    const saveDraft = (category: string, draft: BudgetDraft) =>
        setCategoryBudgets(uid, parseBudgetDrafts({ ...drafts, [category]: draft }));

    return (
        <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {t.onboardingBudgetsHint}
            </Typography>
            {budgetableCategories.map((cat) => (
                <BudgetDraftFields
                    key={cat.value}
                    label={getCategoryLabel(cat, locale)}
                    draft={drafts[cat.value]}
                    onChange={(draft) => setDrafts((d) => ({ ...d, [cat.value]: draft }))}
                    onCommit={(draft) => saveDraft(cat.value, draft)}
                />
            ))}
        </Stack>
    );
};
