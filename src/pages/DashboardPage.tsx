import { useState } from "react";
import { Button } from "@mui/material";
import Layout from "../components/Layout";
import Dashboard from "../components/dashboard/Dashboard";
import InsightsCard from "../components/dashboard/InsightsCard";
import ImportExcelFlow from "../components/transactions/ImportExcelFlow";
import AddTransactionDialog from "../components/transactions/AddTransactionDialog";
import BudgetList from "../components/budget/BudgetList";
import EditBudgetsDialog from "../components/budget/EditBudgetsDialog";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import { calculateTotalSpent, calculateTotalIncome, calculateTotalBudget } from "../services/budget";
import { generateInsights } from "../services/insights";
import { getCurrentMonth, filterByMonth } from "../utils/dates";
import { FEATURED_GOAL_ID } from "../types/Goal";
import { useTranslation } from "../i18n/useTranslation";

export default function DashboardPage() {
    const { t, locale } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [budgetsDialogOpen, setBudgetsDialogOpen] = useState(false);
    const [addTransactionOpen, setAddTransactionOpen] = useState(false);
    const {
        transactions, hasLoaded, addTransaction,
        goals, updateGoalAmount, updateGoalTarget, updateGoalName,
    } = useFinanceStore();
    const {
        estimatedIncome, categoryBudgets, categories, categorizationRules, hasLoaded: settingsLoaded,
        setEstimatedIncome, setCategoryBudgets,
        addCategory, updateCategoryLabel, removeCategory, setCategoryNoComputable,
        addRule, removeRule,
    } = useSettingsStore();

    if (!hasLoaded || !settingsLoaded) {
        return <Layout><p>{t.loading}</p></Layout>;
    }

    const featuredGoal = goals.find((g) => g.id === FEATURED_GOAL_ID);
    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));

    const currentMonthTransactions = filterByMonth(transactions, getCurrentMonth());
    const totalBudget = calculateTotalBudget(categoryBudgets);
    const totalSpentThisMonth = calculateTotalSpent(currentMonthTransactions, categoryBudgets);
    const totalIncomeThisMonth = calculateTotalIncome(currentMonthTransactions.filter((tx) => !noComputableValues.has(tx.category)));
    const insights = generateInsights(transactions, categories, categoryBudgets, locale);

    return (
        <Layout>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
                <Button variant="outlined" onClick={() => setAddTransactionOpen(true)}>
                    {t.addTransactionButton}
                </Button>
                <ImportExcelFlow uid={uid} />
            </div>

            <AddTransactionDialog
                open={addTransactionOpen}
                categories={categories}
                onClose={() => setAddTransactionOpen(false)}
                onConfirm={(transaction) => addTransaction(uid, transaction)}
            />

            {featuredGoal && (
                <Dashboard
                    spent={totalSpentThisMonth}
                    budget={totalBudget}
                    income={totalIncomeThisMonth}
                    estimatedIncome={estimatedIncome}
                    onEstimatedIncomeChange={(v) => setEstimatedIncome(uid, v)}
                    featuredGoal={featuredGoal}
                    onFeaturedGoalAmountChange={(v) => updateGoalAmount(uid, FEATURED_GOAL_ID, v)}
                    onFeaturedGoalTargetChange={(v) => updateGoalTarget(uid, FEATURED_GOAL_ID, v)}
                    onFeaturedGoalNameChange={(n) => updateGoalName(uid, FEATURED_GOAL_ID, n)}
                    onEditBudget={() => setBudgetsDialogOpen(true)}
                />
            )}

            <BudgetList
                transactions={transactions}
                categories={categories}
                budgets={categoryBudgets}
                onEditBudget={() => setBudgetsDialogOpen(true)}
                onUpdateCategoryLabel={(value, label) => updateCategoryLabel(uid, value, label)}
                onAddCategory={(value, label) => addCategory(uid, value, label)}
                onRemoveCategory={(value) => removeCategory(uid, value)}
                onToggleNoComputable={(value, noComputable) => setCategoryNoComputable(uid, value, noComputable)}
                categorizationRules={categorizationRules}
                onAddRule={(keyword, category) => addRule(uid, keyword, category)}
                onRemoveRule={(id) => removeRule(uid, id)}
            />

            <div style={{ marginTop: 16, marginBottom: 16 }}>
                <InsightsCard insights={insights} />
            </div>

            <EditBudgetsDialog
                open={budgetsDialogOpen}
                onClose={() => setBudgetsDialogOpen(false)}
                categories={categories}
                budgets={categoryBudgets}
                onSave={(budgets) => setCategoryBudgets(uid, budgets)}
            />
        </Layout>
    );
}
