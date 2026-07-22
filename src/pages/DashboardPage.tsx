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
        estimatedIncome, categoryBudgets, categories, categorizationRules, featuredGoalId, hasLoaded: settingsLoaded,
        setEstimatedIncome, setCategoryBudgets,
        addCategory, updateCategoryLabel, removeCategory, setCategoryNoComputable, setCategoryIncomeOnly,
        addRule, removeRule, setFeaturedGoalId,
    } = useSettingsStore();

    if (!hasLoaded || !settingsLoaded) {
        return <Layout><p>{t.loading}</p></Layout>;
    }

    const featuredGoal =
        goals.find((g) => g.id === featuredGoalId) ??
        goals.find((g) => g.id === FEATURED_GOAL_ID) ??
        goals[0];
    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const hasIncomeData = transactions.some((tx) => tx.amount > 0 && !noComputableValues.has(tx.category));

    const currentMonthTransactions = filterByMonth(transactions, getCurrentMonth())
        .filter((tx) => !noComputableValues.has(tx.category));
    const totalBudget = calculateTotalBudget(categoryBudgets);
    const totalSpentThisMonth = calculateTotalSpent(currentMonthTransactions);
    const totalIncomeThisMonth = calculateTotalIncome(currentMonthTransactions);
    const insights = generateInsights(transactions, categories, locale);

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

            <Dashboard
                spent={totalSpentThisMonth}
                budget={totalBudget}
                income={totalIncomeThisMonth}
                hasIncomeData={hasIncomeData}
                estimatedIncome={estimatedIncome}
                onEstimatedIncomeChange={(v) => setEstimatedIncome(uid, v)}
                goals={goals}
                featuredGoal={featuredGoal}
                onSelectFeaturedGoal={(id) => setFeaturedGoalId(uid, id)}
                onFeaturedGoalAmountChange={(v) => featuredGoal && updateGoalAmount(uid, featuredGoal.id, v)}
                onFeaturedGoalTargetChange={(v) => featuredGoal && updateGoalTarget(uid, featuredGoal.id, v)}
                onFeaturedGoalNameChange={(n) => featuredGoal && updateGoalName(uid, featuredGoal.id, n)}
                onEditBudget={() => setBudgetsDialogOpen(true)}
            />

            <BudgetList
                transactions={transactions}
                categories={categories}
                budgets={categoryBudgets}
                onEditBudget={() => setBudgetsDialogOpen(true)}
                onUpdateCategoryLabel={(value, label) => updateCategoryLabel(uid, value, label)}
                onAddCategory={(value, label) => addCategory(uid, value, label)}
                onRemoveCategory={(value) => removeCategory(uid, value)}
                onToggleNoComputable={(value, noComputable) => setCategoryNoComputable(uid, value, noComputable)}
                onToggleIncomeOnly={(value, incomeOnly) => setCategoryIncomeOnly(uid, value, incomeOnly)}
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
