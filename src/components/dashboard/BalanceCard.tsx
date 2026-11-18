import { Typography } from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { useTranslation } from "../../i18n/useTranslation";
import { accent } from "../../theme/colors";
import { formatCurrency } from "../../utils/currency";
import { Caption, MetricCard } from "./MetricCard";

export const BalanceCard = ({ balance }: { balance: number }) => {
    const { t } = useTranslation();
    const positive = balance >= 0;
    const color = positive ? accent.statusGreat : accent.statusOver;

    return (
        <MetricCard
            icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 20 }} />}
            color={color}
            softColor={positive ? accent.statusGreatSoft : accent.statusOverSoft}
            title={t.balanceCardTitle}
        >
            <Typography variant="h4" sx={{ lineHeight: 1, color }}>
                {positive ? "+" : "−"}
                {formatCurrency(Math.abs(balance))}
            </Typography>
            <Caption>{t.balanceCardSubtitle}</Caption>
        </MetricCard>
    );
};
