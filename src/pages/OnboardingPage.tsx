import { useEffect, useState } from "react";
import {
    Box,
    Card,
    Container,
    Stepper,
    Step,
    StepLabel,
    Typography,
    TextField,
    IconButton,
    Button,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GoalsList from "../components/goals/GoalsList";
import ImportExcelFlow from "../components/transactions/ImportExcelFlow";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "../i18n/useTranslation";
import type { BudgetPeriod, CategoryBudget } from "../types/Budget";

const EXCLUDED_FROM_BUDGET = ["ahorro", "transferencia", "no_computable", "vinted_wallapop"];

function slugify(label: string): string {
    return label
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");
}

export default function OnboardingPage() {
    const { t } = useTranslation();
    const uid = useAuthStore((s) => s.user?.uid ?? "");
    const [step, setStep] = useState(0);

    const { categories, categoryBudgets, setCategories, setCategoryBudgets, completeOnboarding } = useSettingsStore();
    const { goals, addGoal, updateGoalAmount, updateGoalName, updateGoalTarget, removeGoal } = useFinanceStore();

    const steps = [t.onboardingStepCategories, t.onboardingStepBudgets, t.onboardingStepGoals, t.onboardingStepImport];

    async function handleFinish() {
        await completeOnboarding(uid);
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 5 }}>
            <Container maxWidth="sm">
                <Typography variant="h4" sx={{ color: "primary.main", mb: 0.5 }}>{t.onboardingWelcomeTitle}</Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", mb: 4 }}>{t.onboardingWelcomeSubtitle}</Typography>

                <Stepper activeStep={step} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                <Card sx={{ p: 3 }}>
                    {step === 0 && <CategoriesStep uid={uid} categories={categories} setCategories={setCategories} />}
                    {step === 1 && (
                        <BudgetsStep
                            uid={uid}
                            categories={categories}
                            budgets={categoryBudgets}
                            setCategoryBudgets={setCategoryBudgets}
                        />
                    )}
                    {step === 2 && (
                        <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>{t.onboardingGoalsHint}</Typography>
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
                            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>{t.onboardingImportHint}</Typography>
                            <ImportExcelFlow uid={uid} />
                            <Typography variant="caption" sx={{ display: "block", color: "text.disabled", mt: 2 }}>
                                {t.onboardingImportSkipHint}
                            </Typography>
                        </Box>
                    )}
                </Card>

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                        {t.onboardingBack}
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button variant="contained" onClick={() => setStep((s) => s + 1)}>
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
}

function CategoriesStep({ uid, categories, setCategories }: {
    uid: string;
    categories: { value: string; label: string }[];
    setCategories: (uid: string, categories: { value: string; label: string }[]) => Promise<void>;
}) {
    const { t } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        setDrafts(Object.fromEntries(categories.map((c) => [c.value, c.label])));
    }, [categories]);

    function handleLabelBlur(value: string) {
        const label = drafts[value]?.trim();
        const original = categories.find((c) => c.value === value)?.label;
        if (label && label !== original) {
            setCategories(uid, categories.map((c) => (c.value === value ? { ...c, label } : c)));
        }
    }

    function handleAdd() {
        const label = newLabel.trim();
        if (!label) return;
        const value = slugify(label);
        if (!value || categories.some((c) => c.value === value)) return;
        setCategories(uid, [...categories, { value, label }]);
        setNewLabel("");
    }

    function handleRemove(value: string) {
        setCategories(uid, categories.filter((c) => c.value !== value));
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>{t.onboardingCategoriesHint}</Typography>
            {categories.map((cat) => (
                <Box key={cat.value} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                        size="small"
                        value={drafts[cat.value] ?? cat.label}
                        onChange={(e) => setDrafts((d) => ({ ...d, [cat.value]: e.target.value }))}
                        onBlur={() => handleLabelBlur(cat.value)}
                        fullWidth
                    />
                    <IconButton size="small" onClick={() => handleRemove(cat.value)}>
                        <DeleteOutlineIcon fontSize="small" sx={{ opacity: 0.5 }} />
                    </IconButton>
                </Box>
            ))}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                <TextField
                    size="small"
                    placeholder={t.newCategoryPlaceholder}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    fullWidth
                />
                <IconButton size="small" onClick={handleAdd} disabled={!newLabel.trim()}>
                    <AddIcon fontSize="small" />
                </IconButton>
            </Box>
        </Stack>
    );
}

function BudgetsStep({ uid, categories, budgets, setCategoryBudgets }: {
    uid: string;
    categories: { value: string; label: string }[];
    budgets: Record<string, CategoryBudget>;
    setCategoryBudgets: (uid: string, budgets: Record<string, CategoryBudget>) => Promise<void>;
}) {
    const { t } = useTranslation();
    const editableCategories = categories.filter((c) => !EXCLUDED_FROM_BUDGET.includes(c.value));
    const [amountDraft, setAmountDraft] = useState<Record<string, string>>(
        Object.fromEntries(editableCategories.map((c) => [c.value, String(budgets[c.value]?.amount ?? "")])),
    );
    const [periodDraft, setPeriodDraft] = useState<Record<string, BudgetPeriod>>(
        Object.fromEntries(editableCategories.map((c) => [c.value, budgets[c.value]?.period ?? "monthly"])),
    );

    function persist(nextAmount: Record<string, string>, nextPeriod: Record<string, BudgetPeriod>) {
        const parsed: Record<string, CategoryBudget> = {};
        for (const [key, value] of Object.entries(nextAmount)) {
            const num = Number(value);
            if (value.trim() !== "" && !isNaN(num) && num > 0) {
                parsed[key] = { amount: num, period: nextPeriod[key] ?? "monthly" };
            }
        }
        setCategoryBudgets(uid, parsed);
    }

    return (
        <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t.onboardingBudgetsHint}</Typography>
            {editableCategories.map((cat) => (
                <Box key={cat.value} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="body2">{cat.label}</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            type="number"
                            size="small"
                            value={amountDraft[cat.value] ?? ""}
                            onChange={(e) => {
                                const next = { ...amountDraft, [cat.value]: e.target.value };
                                setAmountDraft(next);
                            }}
                            onBlur={() => persist(amountDraft, periodDraft)}
                            sx={{ flex: 1 }}
                        />
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={periodDraft[cat.value] ?? "monthly"}
                            onChange={(_, value: BudgetPeriod | null) => {
                                if (!value) return;
                                const next = { ...periodDraft, [cat.value]: value };
                                setPeriodDraft(next);
                                persist(amountDraft, next);
                            }}
                        >
                            <ToggleButton value="monthly">{t.monthly}</ToggleButton>
                            <ToggleButton value="bimonthly">{t.bimonthly}</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
            ))}
        </Stack>
    );
}
