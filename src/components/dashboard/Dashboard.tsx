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
    let statusColor = "#B8E6C9";
    if (overBudget) {
        statusEmoji = "😬";
        statusText = t.statusOverTitle;
        statusColor = "#FFC9C9";
    } else if (budgetPct > 75) {
        statusEmoji = "😅";
        statusText = t.statusTightTitle;
        statusColor = "#FFE3B8";
    } else if (budgetPct > 40) {
        statusEmoji = "🙂";
        statusText = t.statusOkTitle;
        statusColor = "#D6E8FF";
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
                        bgcolor: statusColor,
                        borderRadius: 1,
                        p: 3,
                        height: "100%",
                        boxShadow: "none",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Typography sx={{ fontSize: 32 }}>{statusEmoji}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {statusText}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                        {overBudget
                            ? t.overBudgetBy(formatCurrency(Math.abs(remaining)))
                            : t.remainingToSpend(formatCurrency(remaining))}
                    </Typography>
                </Card>
            </Grid>

            {/* Budget */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#FFE3E3", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <ShoppingBagOutlinedIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t.budgetCardTitle}</Typography>
                        <IconButton size="small" onClick={onEditBudget} title={t.editBudgetTooltip}>
                            <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                        </IconButton>
                    </Box>
                    <LinearProgress
                        value={budgetPct}
                        variant="determinate"
                        sx={{
                            my: 2, height: 8, borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": { bgcolor: overBudget ? "#E57373" : "#F28B82" },
                        }}
                    />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(spent)} <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/ {formatCurrency(budget)}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.6, mt: 0.5 }}>
                        {budgetPctRaw.toFixed(0)}%
                    </Typography>
                </Card>
            </Grid>

            {/* Income */}
            <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ bgcolor: "#DFF5E1", borderRadius: 1, p: 3, height: "100%", boxShadow: "none" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <TrendingUpOutlinedIcon />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{t.incomeCardTitle}</Typography>
                    </Box>
                    <LinearProgress
                        value={incomePct}
                        variant="determinate"
                        sx={{
                            my: 2, height: 8, borderRadius: 1,
                            bgcolor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": { bgcolor: "#66BB6A" },
                        }}
                    />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {editingIncome ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {formatCurrency(income)} <Typography component="span" variant="body2" sx={{ opacity: 0.6 }}>/ {formatCurrency(estimatedIncome)}</Typography>
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setIncomeInput(String(estimatedIncome));
                                        setEditingIncome(true);
                                    }}
                                >
                                    <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                                </IconButton>
                            </>
                        )}
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.6, mt: 0.5 }}>
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
