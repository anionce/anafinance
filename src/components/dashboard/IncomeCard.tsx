import { Box, IconButton, TextField } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { parseNonEmptyNumber, useInlineEdit } from "../../hooks/useInlineEdit";
import { useTranslation } from "../../i18n/useTranslation";
import { calculatePercentage, calculateRawPercentage } from "../../services/budget";
import { accent } from "../../theme/colors";
import { formatCurrency } from "../../utils/currency";
import { AmountOfTotal, Caption, MetricCard } from "./MetricCard";

interface Props {
    income: number;
    estimatedIncome: number;
    onEstimatedIncomeChange: (value: number) => void;
}

export const IncomeCard = ({ income, estimatedIncome, onEstimatedIncomeChange }: Props) => {
    const { t } = useTranslation();
    const edit = useInlineEdit(estimatedIncome, String, parseNonEmptyNumber, onEstimatedIncomeChange);

    return (
        <MetricCard
            icon={<TrendingUpOutlinedIcon sx={{ fontSize: 20 }} />}
            color={accent.income}
            softColor={accent.incomeSoft}
            title={t.incomeCardTitle}
            actions={
                !edit.editing && (
                    <IconButton size="small" aria-label={t.estimatedIncomeLabel} onClick={edit.start}>
                        <EditIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                    </IconButton>
                )
            }
            progress={{ value: calculatePercentage(income, estimatedIncome), barColor: accent.income }}
        >
            {edit.editing ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                        size="small"
                        type="number"
                        value={edit.input}
                        onChange={(e) => edit.setInput(e.target.value)}
                        onBlur={edit.save}
                        onKeyDown={(e) => e.key === "Enter" && edit.save()}
                        autoFocus
                        slotProps={{ htmlInput: { "aria-label": t.estimatedIncomeLabel } }}
                        sx={{ maxWidth: 140 }}
                    />
                    <IconButton onClick={edit.save} size="small" aria-label={t.save}>
                        <CheckIcon />
                    </IconButton>
                </Box>
            ) : (
                <AmountOfTotal amount={formatCurrency(income)} total={formatCurrency(estimatedIncome)} />
            )}
            <Caption>{calculateRawPercentage(income, estimatedIncome).toFixed(0)}%</Caption>
        </MetricCard>
    );
};
