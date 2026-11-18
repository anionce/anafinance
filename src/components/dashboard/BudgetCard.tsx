import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useTranslation } from "../../i18n/useTranslation";
import { calculateMaxSpending, calculatePercentage, calculateRawPercentage } from "../../services/budget";
import { accent } from "../../theme/colors";
import { formatCurrency } from "../../utils/currency";
import { AmountOfTotal, Caption, MetricCard } from "./MetricCard";

interface Props {
    spent: number;
    budget: number;
    barColor: string;
    estimatedIncome: number;
    savingsTarget: number;
    onEditBudget: () => void;
    onOpenBudgetHistory: () => void;
}

export const BudgetCard = ({ spent, budget, barColor, estimatedIncome, savingsTarget, onEditBudget, onOpenBudgetHistory }: Props) => {
    const { t } = useTranslation();
    const maxSpending = calculateMaxSpending(estimatedIncome, savingsTarget);
    const budgetExceedsMax = budget > maxSpending;

    return (
        <MetricCard
            icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 20 }} />}
            color={accent.budget}
            softColor={accent.budgetSoft}
            title={t.budgetCardTitle}
            actions={
                <>
                    <IconButton
                        size="small"
                        onClick={onOpenBudgetHistory}
                        title={t.budgetHistoryTooltip}
                        aria-label={t.budgetHistoryTooltip}
                    >
                        <HistoryIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                    </IconButton>
                    <IconButton size="small" onClick={onEditBudget} title={t.editBudgetTooltip} aria-label={t.editBudgetTooltip}>
                        <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                    </IconButton>
                </>
            }
            progress={{ value: calculatePercentage(spent, budget), barColor }}
        >
            <AmountOfTotal amount={formatCurrency(spent)} total={formatCurrency(budget)} highlightTotal={budgetExceedsMax} />
            {budgetExceedsMax && <Caption color="error.main">{t.budgetExceedsMaxSpend(formatCurrency(maxSpending))}</Caption>}
            <Caption>{calculateRawPercentage(spent, budget).toFixed(0)}%</Caption>
        </MetricCard>
    );
};
