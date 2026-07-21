import Layout from "../components/Layout";
import GoalsList from "../components/goals/GoalsList";
import { useFinanceStore } from "../store/financeStore";
import { useTranslation } from "../i18n/useTranslation";

export default function GoalsPage() {
    const { t } = useTranslation();
    const {
        goals, hasLoaded, addGoal,
        updateGoalAmount, updateGoalName, updateGoalTarget, removeGoal,
    } = useFinanceStore();

    if (!hasLoaded) {
        return <Layout><p>{t.loading}</p></Layout>;
    }

    return (
        <Layout>
            <GoalsList
                goals={goals}
                onAdd={addGoal}
                onUpdateAmount={updateGoalAmount}
                onUpdateName={updateGoalName}
                onUpdateTarget={updateGoalTarget}
                onRemove={removeGoal}
            />
        </Layout>
    );
}
