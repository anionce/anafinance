import { Box, Grid, MenuItem, Select } from "@mui/material";
import { budgetStatus } from "../../services/budget";
import type { Goal } from "../../types/Goal";
import { FeaturedGoalCard } from "../goals/FeaturedGoalCard";
import { BalanceCard } from "./BalanceCard";
import { BudgetCard } from "./BudgetCard";
import { IncomeCard } from "./IncomeCard";
import { STATUS_STYLE } from "../../theme/statusStyle";
import { StatusCard } from "./StatusCard";

interface Props {
    spent: number;
    budget: number;
    income: number;
    balance: number;
    hasIncomeData: boolean;
    estimatedIncome: number;
    savingsTarget: number;
    onEstimatedIncomeChange: (value: number) => void;
    goals: Goal[];
    featuredGoal?: Goal;
    onSelectFeaturedGoal: (id: string) => void;
    onFeaturedGoalAmountChange: (value: number) => void;
    onFeaturedGoalTargetChange: (value: number) => void;
    onFeaturedGoalNameChange: (name: string) => void;
    onEditBudget: () => void;
    onOpenBudgetHistory: () => void;
}

export const Dashboard = ({
    spent,
    budget,
    income,
    balance,
    hasIncomeData,
    estimatedIncome,
    savingsTarget,
    onEstimatedIncomeChange,
    goals,
    featuredGoal,
    onSelectFeaturedGoal,
    onFeaturedGoalAmountChange,
    onFeaturedGoalTargetChange,
    onFeaturedGoalNameChange,
    onEditBudget,
    onOpenBudgetHistory,
}: Props) => {
    const status = budgetStatus(spent, budget);

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
                <StatusCard status={status} remaining={budget - spent} />
            </Grid>
            {hasIncomeData && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <BalanceCard balance={balance} />
                </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
                <BudgetCard
                    spent={spent}
                    budget={budget}
                    barColor={STATUS_STYLE[status].color}
                    estimatedIncome={estimatedIncome}
                    savingsTarget={savingsTarget}
                    onEditBudget={onEditBudget}
                    onOpenBudgetHistory={onOpenBudgetHistory}
                />
            </Grid>
            {hasIncomeData && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <IncomeCard income={income} estimatedIncome={estimatedIncome} onEstimatedIncomeChange={onEstimatedIncomeChange} />
                </Grid>
            )}
            {featuredGoal && (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ position: "relative", height: "100%" }}>
                        {goals.length > 1 && (
                            <Select
                                size="small"
                                value={featuredGoal.id}
                                onChange={(e) => onSelectFeaturedGoal(e.target.value)}
                                sx={{
                                    position: "absolute",
                                    top: 12,
                                    right: 52,
                                    zIndex: 1,
                                    fontSize: "0.8rem",
                                    "& .MuiSelect-select": { py: 0.5 },
                                }}
                            >
                                {goals.map((g) => (
                                    <MenuItem key={g.id} value={g.id}>
                                        {g.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                        <FeaturedGoalCard
                            goal={featuredGoal}
                            onAmountChange={onFeaturedGoalAmountChange}
                            onTargetChange={onFeaturedGoalTargetChange}
                            onNameChange={onFeaturedGoalNameChange}
                        />
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};
