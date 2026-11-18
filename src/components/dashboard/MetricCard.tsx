import type { ReactNode } from "react";
import { Box, Card, LinearProgress, Typography } from "@mui/material";

interface Props {
    icon: ReactNode;
    color: string;
    softColor: string;
    title: string;
    actions?: ReactNode;
    progress?: { value: number; barColor: string };
    children: ReactNode;
}

export const MetricCard = ({ icon, color, softColor, title, actions, progress, children }: Props) => (
    <Card sx={{ p: 3, height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Box
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    bgcolor: softColor,
                    color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Typography variant="h6" sx={{ flex: 1, lineHeight: 1 }}>
                {title}
            </Typography>
            {actions}
        </Box>
        {progress && (
            <LinearProgress
                value={progress.value}
                variant="determinate"
                sx={{ mb: 2, height: 8, bgcolor: softColor, "& .MuiLinearProgress-bar": { bgcolor: progress.barColor } }}
            />
        )}
        {children}
    </Card>
);

export const AmountOfTotal = ({ amount, total, highlightTotal = false }: { amount: string; total: string; highlightTotal?: boolean }) => (
    <Typography variant="h4" sx={{ lineHeight: 1 }}>
        {amount}{" "}
        <Typography
            component="span"
            variant="body2"
            sx={{
                color: highlightTotal ? "error.main" : "text.secondary",
                fontWeight: highlightTotal ? 700 : undefined,
                fontFamily: "inherit",
            }}
        >
            / {total}
        </Typography>
    </Typography>
);

export const Caption = ({ children, color = "text.secondary" }: { children: ReactNode; color?: string }) => (
    <Typography variant="body2" sx={{ color, mt: 0.5 }}>
        {children}
    </Typography>
);
