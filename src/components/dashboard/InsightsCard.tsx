import { Card, Typography, Stack } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    insights: string[];
}

export default function InsightsCard({ insights }: Props) {
    const { t } = useTranslation();

    if (insights.length === 0) return null;

    return (
        <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>{t.insightsTitle}</Typography>
            <Stack spacing={1}>
                {insights.map((insight, i) => (
                    <Typography key={i} variant="body2">{insight}</Typography>
                ))}
            </Stack>
        </Card>
    );
}
