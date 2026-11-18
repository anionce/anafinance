import { Box, Card, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";
import type { BudgetStatus } from "../../services/budget";
import { STATUS_STYLE } from "../../theme/statusStyle";
import { formatCurrency } from "../../utils/currency";

export const StatusCard = ({ status, remaining }: { status: BudgetStatus; remaining: number }) => {
    const { t } = useTranslation();
    const style = STATUS_STYLE[status];
    const title = { great: t.statusGreatTitle, ok: t.statusOkTitle, tight: t.statusTightTitle, over: t.statusOverTitle }[status];

    return (
        <Card sx={{ bgcolor: style.background, borderColor: "transparent", p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography sx={{ fontSize: 32, lineHeight: 1 }}>{style.emoji}</Typography>
                <Typography variant="h6" sx={{ color: style.color }}>
                    {title}
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {remaining < 0 ? t.overBudgetBy(formatCurrency(Math.abs(remaining))) : t.remainingToSpend(formatCurrency(remaining))}
            </Typography>
        </Card>
    );
};
