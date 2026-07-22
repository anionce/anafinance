import Layout from "../components/Layout";
import GoalsList from "../components/goals/GoalsList";
import { useFinanceStore } from "../store/financeStore";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../i18n/useTranslation";

export default function GoalsPage() {
    const { t } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
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
                onAdd={(goal) => addGoal(uid, goal)}
                onUpdateAmount={(id, amount) => updateGoalAmount(uid, id, amount)}
                onUpdateName={(id, name) => updateGoalName(uid, id, name)}
                onUpdateTarget={(id, target) => updateGoalTarget(uid, id, target)}
                onRemove={(id) => removeGoal(uid, id)}
            />
        </Layout>
    );
}
