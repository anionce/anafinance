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
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GoalsList from "../components/goals/GoalsList";
import ImportExcelFlow from "../components/transactions/ImportExcelFlow";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { useSettingsStore } from "../store/settingsStore";
import { useTranslation } from "../i18n/useTranslation";
import { getCategoryLabel } from "../i18n/categoryTranslations";
import type { BudgetPeriod, CategoryBudget } from "../types/Budget";
import type { Category } from "../types/Category";

const EXCLUDED_FROM_BUDGET = ["transferencia"];

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
    categories: Category[];
    setCategories: (uid: string, categories: Category[]) => Promise<void>;
}) {
    const { t, locale } = useTranslation();
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [newLabel, setNewLabel] = useState("");

    useEffect(() => {
        setDrafts(Object.fromEntries(categories.map((c) => [c.value, getCategoryLabel(c, locale)])));
    }, [categories, locale]);

    function handleLabelBlur(value: string) {
        const label = drafts[value]?.trim();
        const original = categories.find((c) => c.value === value);
        const originalDisplay = original ? getCategoryLabel(original, locale) : undefined;
        if (label && label !== originalDisplay) {
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

    function handleToggleNoComputable(value: string, noComputable: boolean) {
        setCategories(uid, categories.map((c) => (c.value === value ? { ...c, noComputable } : c)));
    }

    return (
        <Stack spacing={1.5}>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>{t.onboardingCategoriesHint}</Typography>
            {categories.map((cat) => (
                <Box key={cat.value} sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <FormControlLabel
                        sx={{ ml: 0.5 }}
                        control={
                            <Checkbox
                                size="small"
                                checked={!!cat.noComputable}
                                onChange={(e) => handleToggleNoComputable(cat.value, e.target.checked)}
                            />
                        }
                        label={<Typography variant="caption" color="text.secondary">{t.noComputableLabel}</Typography>}
                    />
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
    categories: Category[];
    budgets: Record<string, CategoryBudget>;
    setCategoryBudgets: (uid: string, budgets: Record<string, CategoryBudget>) => Promise<void>;
}) {
    const { t, locale } = useTranslation();
    const editableCategories = categories.filter((c) => !EXCLUDED_FROM_BUDGET.includes(c.value) && !c.noComputable);
    const [amountDraft, setAmountDraft] = useState<Record<string, string>>(
        Object.fromEntries(editableCategories.map((c) => [c.value, String(budgets[c.value]?.amount ?? "")])),
    );
    const [periodDraft, setPeriodDraft] = useState<Record<string, BudgetPeriod>>(
        Object.fromEntries(editableCategories.map((c) => [c.value, budgets[c.value]?.period ?? "monthly"])),
    );
    const [intervalDraft, setIntervalDraft] = useState<Record<string, string>>(
        Object.fromEntries(editableCategories.map((c) => [c.value, String(budgets[c.value]?.intervalMonths ?? 3)])),
    );

    function persist(nextAmount: Record<string, string>, nextPeriod: Record<string, BudgetPeriod>, nextInterval: Record<string, string>) {
        const parsed: Record<string, CategoryBudget> = {};
        for (const [key, value] of Object.entries(nextAmount)) {
            const num = Number(value);
            if (value.trim() !== "" && !isNaN(num) && num > 0) {
                const period = nextPeriod[key] ?? "monthly";
                parsed[key] = {
                    amount: num,
                    period,
                    ...(period === "everyNMonths" ? { intervalMonths: Math.max(Number(nextInterval[key]) || 1, 1) } : {}),
                };
            }
        }
        setCategoryBudgets(uid, parsed);
    }

    return (
        <Stack spacing={2}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>{t.onboardingBudgetsHint}</Typography>
            {editableCategories.map((cat) => (
                <Box key={cat.value} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="body2">{getCategoryLabel(cat, locale)}</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            type="number"
                            size="small"
                            value={amountDraft[cat.value] ?? ""}
                            onChange={(e) => {
                                const next = { ...amountDraft, [cat.value]: e.target.value };
                                setAmountDraft(next);
                            }}
                            onBlur={() => persist(amountDraft, periodDraft, intervalDraft)}
                            sx={{ flex: 1 }}
                        />
                        <Select
                            size="small"
                            value={periodDraft[cat.value] ?? "monthly"}
                            onChange={(e) => {
                                const next = { ...periodDraft, [cat.value]: e.target.value as BudgetPeriod };
                                setPeriodDraft(next);
                                persist(amountDraft, next, intervalDraft);
                            }}
                            sx={{ minWidth: 140 }}
                        >
                            <MenuItem value="weekly">{t.weekly}</MenuItem>
                            <MenuItem value="monthly">{t.monthly}</MenuItem>
                            <MenuItem value="bimonthly">{t.bimonthly}</MenuItem>
                            <MenuItem value="everyNMonths">{t.everyNMonths}</MenuItem>
                            <MenuItem value="yearly">{t.yearly}</MenuItem>
                        </Select>
                    </Box>
                    {periodDraft[cat.value] === "everyNMonths" && (
                        <TextField
                            type="number"
                            size="small"
                            label={t.intervalMonthsLabel}
                            value={intervalDraft[cat.value] ?? ""}
                            onChange={(e) => {
                                const next = { ...intervalDraft, [cat.value]: e.target.value };
                                setIntervalDraft(next);
                                persist(amountDraft, periodDraft, next);
                            }}
                            sx={{ maxWidth: 180 }}
                        />
                    )}
                </Box>
            ))}
        </Stack>
    );
}
