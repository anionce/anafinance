import { useState } from "react";
import {
    Card,
    Box,
    Grid,
    Typography,
    TextField,
    IconButton,
    LinearProgress,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { formatCurrency } from "../../utils/currency";
import { calculateRawPercentage } from "../../services/budget";
import { useTranslation } from "../../i18n/useTranslation";
import { accent } from "../../theme/colors";
import FeaturedGoalCard from "../goals/FeaturedGoalCard";
import type { Goal } from "../../types/Goal";

interface Props {
    spent: number;
    budget: number;
    income: number;
    estimatedIncome: number;
    onEstimatedIncomeChange: (value: number) => void;
    featuredGoal: Goal;
    onFeaturedGoalAmountChange: (value: number) => void;
    onFeaturedGoalTargetChange: (value: number) => void;
    onFeaturedGoalNameChange: (name: string) => void;
    onEditBudget: () => void;
}

function IconBadge({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
    return (
        <Box
            sx={{
                width: 36, height: 36, borderRadius: "50%",
                bgcolor: bg, color,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
            }}
        >
            {children}
        </Box>
    );
}

export default function Dashboard({
    spent,
    budget,
    income,
    estimatedIncome,
    onEstimatedIncomeChange,
    featuredGoal,
    onFeaturedGoalAmountChange,
    onFeaturedGoalTargetChange,
    onFeaturedGoalNameChange,
    onEditBudget,
}: Props) {
    const { t } = useTranslation();
    const [editingIncome, setEditingIncome] = useState(false);
    const [incomeInput, setIncomeInput] = useState(String(estimatedIncome));

    const remaining = budget - spent;
    const overBudget = remaining < 0;
    const budgetPct = Math.min((spent / budget) * 100, 100);
    const budgetPctRaw = calculateRawPercentage(spent, budget);
    const incomePct = Math.min((income / estimatedIncome) * 100, 100);
    const incomePctRaw = calculateRawPercentage(income, estimatedIncome);

    let statusEmoji = "🎉";
    let statusText = t.statusGreatTitle;
    let statusColor = accent.statusGreat;
    let statusBg = accent.statusGreatSoft;
    if (overBudget) {
        statusEmoji = "😬";
        statusText = t.statusOverTitle;
        statusColor = accent.statusOver;
        statusBg = accent.statusOverSoft;
    } else if (budgetPct > 75) {
        statusEmoji = "😅";
        statusText = t.statusTightTitle;
        statusColor = accent.statusTight;
        statusBg = accent.statusTightSoft;
    } else if (budgetPct > 40) {
        statusEmoji = "🙂";
        statusText = t.statusOkTitle;
        statusColor = accent.statusOk;
        statusBg = accent.statusOkSoft;
    }

    function handleSaveIncome() {
        const parsed = Number(incomeInput);
        if (!isNaN(parsed)) {
            onEstimatedIncomeChange(parsed);
        }
        setEditingIncome(false);
    }

    return (
        <Grid container spacing={3}>
            {/* Month status */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card
                    sx={{
                        bgcolor: statusBg,
                        borderColor: "transparent",
                        p: 3,
                        height: "100%",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                        <Typography sx={{ fontSize: 32, lineHeight: 1 }}>{statusEmoji}</Typography>
                        <Typography variant="h6" sx={{ color: statusColor }}>
                            {statusText}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        {overBudget
                            ? t.overBudgetBy(formatCurrency(Math.abs(remaining)))
                            : t.remainingToSpend(formatCurrency(remaining))}
                    </Typography>
                </Card>
            </Grid>

            {/* Budget */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <IconBadge color={accent.budget} bg={accent.budgetSoft}>
                            <ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconBadge>
                        <Typography variant="h6" sx={{ flex: 1 }}>{t.budgetCardTitle}</Typography>
                        <IconButton size="small" onClick={onEditBudget} title={t.editBudgetTooltip}>
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                    <LinearProgress
                        value={budgetPct}
                        variant="determinate"
                        sx={{
                            mb: 2, height: 8,
                            bgcolor: accent.budgetSoft,
                            "& .MuiLinearProgress-bar": { bgcolor: overBudget ? "error.main" : accent.budget },
                        }}
                    />
                    <Typography variant="h4">
                        {formatCurrency(spent)} <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontFamily: "inherit" }}>/ {formatCurrency(budget)}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        {budgetPctRaw.toFixed(0)}%
                    </Typography>
                </Card>
            </Grid>

            {/* Income */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, height: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                        <IconBadge color={accent.income} bg={accent.incomeSoft}>
                            <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />
                        </IconBadge>
                        <Typography variant="h6" sx={{ flex: 1 }}>{t.incomeCardTitle}</Typography>
                        {!editingIncome && (
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setIncomeInput(String(estimatedIncome));
                                    setEditingIncome(true);
                                }}
                            >
                                <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                            </IconButton>
                        )}
                    </Box>
                    <LinearProgress
                        value={incomePct}
                        variant="determinate"
                        sx={{
                            mb: 2, height: 8,
                            bgcolor: accent.incomeSoft,
                            "& .MuiLinearProgress-bar": { bgcolor: accent.income },
                        }}
                    />
                    {editingIncome ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <TextField
                                size="small"
                                type="number"
                                value={incomeInput}
                                onChange={(e) => setIncomeInput(e.target.value)}
                                autoFocus
                                sx={{ maxWidth: 140 }}
                            />
                            <IconButton onClick={handleSaveIncome} size="small">
                                <CheckIcon />
                            </IconButton>
                        </Box>
                    ) : (
                        <Typography variant="h4">
                            {formatCurrency(income)} <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontFamily: "inherit" }}>/ {formatCurrency(estimatedIncome)}</Typography>
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                        {incomePctRaw.toFixed(0)}%
                    </Typography>
                </Card>
            </Grid>

            {/* Featured goal - persisted like any other Goal */}
            <Grid size={{ xs: 12, md: 6 }}>
                <FeaturedGoalCard
                    goal={featuredGoal}
                    onAmountChange={onFeaturedGoalAmountChange}
                    onTargetChange={onFeaturedGoalTargetChange}
                    onNameChange={onFeaturedGoalNameChange}
                />
            </Grid>
        </Grid>
    );
}
