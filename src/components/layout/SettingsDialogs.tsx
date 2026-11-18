import { useSortedCategories } from "../../hooks/useSortedCategories";
import { useAuthStore } from "../../store/authStore";
import { useFinanceStore } from "../../store/financeStore";
import { useSettingsStore } from "../../store/settingsStore";
import { BudgetHistoryDialog } from "../budget/BudgetHistoryDialog";
import { CategorizationRulesDialog } from "../budget/CategorizationRulesDialog";
import { CategoryManagerDialog } from "../budget/CategoryManagerDialog";
import { EditBudgetsDialog } from "../budget/EditBudgetsDialog";

export type SettingsDialog = "categories" | "rules" | "budgets" | "budgetHistory";

interface Props {
    open: SettingsDialog | null;
    onClose: () => void;
}

export const SettingsDialogs = ({ open, onClose }: Props) => {
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const transactions = useFinanceStore((s) => s.transactions);
    const goals = useFinanceStore((s) => s.goals);
    const settings = useSettingsStore();
    const categories = useSortedCategories();
    const saveSavingsTarget = (savings: number) => settings.setSavingsTarget(uid, savings);

    return (
        <>
            <CategoryManagerDialog
                open={open === "categories"}
                onClose={onClose}
                categories={categories}
                onUpdateLabel={(value, label) => settings.updateCategoryLabel(uid, value, label)}
                onAdd={(value, label) => settings.addCategory(uid, value, label)}
                onRemove={(value) => settings.removeCategory(uid, value)}
                onToggleNoComputable={(value, checked) => settings.setCategoryNoComputable(uid, value, checked)}
                onToggleIncomeOnly={(value, checked) => settings.setCategoryIncomeOnly(uid, value, checked)}
                onToggleExcludeFromBalance={(value, checked) => settings.setCategoryExcludeFromBalance(uid, value, checked)}
            />
            <CategorizationRulesDialog
                open={open === "rules"}
                onClose={onClose}
                categories={categories}
                goals={goals}
                rules={settings.categorizationRules}
                onAdd={(keyword, category, goalId) => settings.addRule(uid, keyword, category, goalId)}
                onRemove={(id) => settings.removeRule(uid, id)}
            />
            <EditBudgetsDialog
                open={open === "budgets"}
                onClose={onClose}
                categories={categories}
                budgets={settings.categoryBudgets}
                onSave={(budgets) => settings.setCategoryBudgets(uid, budgets)}
                estimatedIncome={settings.estimatedIncome}
                savingsTarget={settings.savingsTarget}
                onSaveSavingsTarget={saveSavingsTarget}
            />
            <BudgetHistoryDialog
                open={open === "budgetHistory"}
                onClose={onClose}
                categories={categories}
                categoryBudgets={settings.categoryBudgets}
                budgetHistory={settings.budgetHistory}
                transactions={transactions}
                onSaveMonth={(month, budgets) => settings.setCategoryBudgets(uid, budgets, month)}
                estimatedIncome={settings.estimatedIncome}
                savingsTarget={settings.savingsTarget}
                onSaveSavingsTarget={saveSavingsTarget}
            />
        </>
    );
};
