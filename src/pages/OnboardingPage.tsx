import { useState } from "react";
import { Box, Card, Container, Stepper, Step, StepLabel, Typography, Button } from "@mui/material";
import { GoalsList } from "../components/goals/GoalsList";
import { ImportExcelFlow } from "../components/transactions/ImportExcelFlow";
import { useAuthStore } from "../store/authStore";
import { useSortedCategories } from "../hooks/useSortedCategories";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "../i18n/useTranslation";
import { BudgetsStep } from "../components/onboarding/BudgetsStep";
import { CategoriesStep } from "../components/onboarding/CategoriesStep";

const BUDGETS_STEP = 1;

export const OnboardingPage = () => {
    const { t } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [step, setStep] = useState(0);

    const {
        setCategoryBudgets,
        completeOnboarding,
        addCategory,
        updateCategoryLabel,
        removeCategory,
        setCategoryNoComputable,
        setCategoryIncomeOnly,
    } = useSettingsStore();
    const categories = useSortedCategories();
    const { goals, addGoal, updateGoalAmount, updateGoalName, updateGoalTarget, removeGoal } = useFinanceStore();

    const steps = [t.onboardingStepCategories, t.onboardingStepBudgets, t.onboardingStepGoals, t.onboardingStepImport];

    const goToStep = (next: number) => {
        if (next === BUDGETS_STEP) void setCategoryBudgets(uid, {});
        setStep(next);
    };

    const handleFinish = async () => {
        await completeOnboarding(uid);
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5 }}>
            <Container maxWidth="sm">
                <Typography variant="h4" sx={{ color: "primary.main", mb: 0.5 }}>
                    {t.onboardingWelcomeTitle}
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>
                    {t.onboardingWelcomeSubtitle}
                </Typography>

                <Stepper activeStep={step} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Card sx={{ p: 3 }}>
                    {step === 0 && (
                        <CategoriesStep
                            uid={uid}
                            categories={categories}
                            onAdd={addCategory}
                            onUpdateLabel={updateCategoryLabel}
                            onRemove={removeCategory}
                            onToggleNoComputable={setCategoryNoComputable}
                            onToggleIncomeOnly={setCategoryIncomeOnly}
                        />
                    )}
                    {step === BUDGETS_STEP && <BudgetsStep uid={uid} categories={categories} setCategoryBudgets={setCategoryBudgets} />}
                    {step === 2 && (
                        <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                                {t.onboardingGoalsHint}
                            </Typography>
                            <GoalsList
                                goals={goals}
                                onAdd={(goal) => addGoal(uid, goal, goals.length === 0)}
                                onUpdateAmount={(id, amount) => updateGoalAmount(uid, id, amount)}
                                onUpdateName={(id, name) => updateGoalName(uid, id, name)}
                                onUpdateTarget={(id, target) => updateGoalTarget(uid, id, target)}
                                onRemove={(id) => removeGoal(uid, id)}
                            />
                        </Box>
                    )}
                    {step === 3 && (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
                                {t.onboardingImportHint}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <ImportExcelFlow uid={uid} />
                            </Box>
                            <Typography variant="caption" sx={{ display: "block", color: "text.disabled", mt: 2 }}>
                                {t.onboardingImportSkipHint}
                            </Typography>
                        </Box>
                    )}
                </Card>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button disabled={step === 0} onClick={() => goToStep(step - 1)}>
                        {t.onboardingBack}
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button variant="contained" onClick={() => goToStep(step + 1)}>
                            {t.next}
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleFinish}>
                            {t.onboardingFinish}
                        </Button>
                    )}
                </Box>
            </Container>
        </Box>
    );
};
