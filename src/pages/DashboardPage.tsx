import { useState } from "react";
import Layout from "../components/Layout";
import Dashboard from "../components/dashboard/Dashboard";
import InsightsCard from "../components/dashboard/InsightsCard";
import ImportExcelButton from "../components/transactions/ImportExcelButton";
import BudgetList from "../components/budget/BudgetList";
import EditBudgetsDialog from "../components/budget/EditBudgetsDialog";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { calculateTotalSpent, calculateTotalIncome, calculateTotalBudget } from "../services/budget";
import { generateInsights } from "../services/insights";
import { getCurrentMonth, filterByMonth } from "../utils/dates";
import { FEATURED_GOAL_ID } from "../types/Goal";
import { useTranslation } from "../i18n/useTranslation";

export default function DashboardPage() {
    const { t, locale } = useTranslation();
    const [budgetsDialogOpen, setBudgetsDialogOpen] = useState(false);
    const {
        transactions, hasLoaded, importFile,
        goals, updateGoalAmount, updateGoalTarget, updateGoalName,
    } = useFinanceStore();
    const {
        estimatedIncome, categoryBudgets, categories, hasLoaded: settingsLoaded,
        setEstimatedIncome, setCategoryBudgets,
        addCategory, updateCategoryLabel, removeCategory,
    } = useSettingsStore();

    if (!hasLoaded || !settingsLoaded) {
        return <Layout><p>{t.loading}</p></Layout>;
    }

    const featuredGoal = goals.find((g) => g.id === FEATURED_GOAL_ID);

    const currentMonthTransactions = filterByMonth(transactions, getCurrentMonth());
    const totalBudget = calculateTotalBudget(categoryBudgets);
    const totalSpentThisMonth = calculateTotalSpent(currentMonthTransactions, categoryBudgets);
    const totalIncomeThisMonth = calculateTotalIncome(currentMonthTransactions);
    const insights = generateInsights(transactions, categories, categoryBudgets, locale);

    return (
        <Layout>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <ImportExcelButton onImport={importFile} />
            </div>

            {featuredGoal && (
                <Dashboard
                    spent={totalSpentThisMonth}
                    budget={totalBudget}
                    income={totalIncomeThisMonth}
                    estimatedIncome={estimatedIncome}
                    onEstimatedIncomeChange={setEstimatedIncome}
                    featuredGoal={featuredGoal}
                    onFeaturedGoalAmountChange={(v) => updateGoalAmount(FEATURED_GOAL_ID, v)}
                    onFeaturedGoalTargetChange={(v) => updateGoalTarget(FEATURED_GOAL_ID, v)}
                    onFeaturedGoalNameChange={(n) => updateGoalName(FEATURED_GOAL_ID, n)}
                    onEditBudget={() => setBudgetsDialogOpen(true)}
                />
            )}

            <BudgetList
                transactions={transactions}
                categories={categories}
                budgets={categoryBudgets}
                onEditBudget={() => setBudgetsDialogOpen(true)}
                onUpdateCategoryLabel={updateCategoryLabel}
                onAddCategory={addCategory}
                onRemoveCategory={removeCategory}
            />

            <div style={{ marginTop: 16, marginBottom: 16 }}>
                <InsightsCard insights={insights} />
            </div>

            <EditBudgetsDialog
                open={budgetsDialogOpen}
                onClose={() => setBudgetsDialogOpen(false)}
                categories={categories}
                budgets={categoryBudgets}
                onSave={setCategoryBudgets}
            />
        </Layout>
    );
}
