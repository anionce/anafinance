import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { calculateAmountByCategory } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    transactions: Transaction[];
    categories: Category[];
    selectedCategory?: string | null;
    onSelectCategory?: (category: string) => void;
}

interface SliceDatum {
    name: string;
    value: number;
    category: string;
}

const COLORS = [
    "#D97757", "#5B9279", "#8B7FB8", "#6B93B8", "#D9A05B",
    "#C9A876", "#C97B84", "#6FA8A0", "#A67B9E", "#8A94A6",
];

export default function CategoryPieChart({ transactions, categories, selectedCategory, onSelectCategory }: Props) {
    const { t, locale } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const byCategory = calculateAmountByCategory(transactions);
    const data: SliceDatum[] = Object.entries(byCategory)
        .map(([category, value]) => {
            const found = categories.find((c) => c.value === category);
            return {
                name: found ? getCategoryLabel(found, locale) : "—",
                value,
                category,
            };
        })
        .sort((a, b) => b.value - a.value);

    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (data.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography color="text.secondary">{t.noTransactionsToShow}</Typography>
            </Box>
        );
    }

    function handleSliceClick(entry: unknown) {
        const category = (entry as { category?: string } | undefined)?.category;
        if (category && onSelectCategory) onSelectCategory(category);
    }

    function handleLegendClick(entry: unknown) {
        const category = (entry as { payload?: { category?: string } } | undefined)?.payload?.category;
        if (category && onSelectCategory) onSelectCategory(category);
    }

    return (
        <Box>
            <Box sx={{ height: isMobile ? 220 : 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={isMobile ? 50 : 55}
                            outerRadius={isMobile ? 85 : 95}
                            paddingAngle={2}
                            isAnimationActive={false}
                            onClick={handleSliceClick}
                            style={{ cursor: onSelectCategory ? "pointer" : "default" }}
                        >
                            {data.map((d, i) => (
                                <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                    opacity={selectedCategory && d.category !== selectedCategory ? 0.3 : 1}
                                />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        {!isMobile && (
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                onClick={handleLegendClick}
                                wrapperStyle={{ cursor: onSelectCategory ? "pointer" : "default" }}
                                formatter={(value, entry) => {
                                    const entryValue = (entry?.payload as { value?: number } | undefined)?.value ?? 0;
                                    const pct = total > 0 ? (entryValue / total) * 100 : 0;
                                    return `${value} (${pct.toFixed(0)}%)`;
                                }}
                            />
                        )}
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            {isMobile && (
                <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1.5, mt: 1.5, px: 1 }}>
                    {data.map((d, i) => {
                        const pct = total > 0 ? (d.value / total) * 100 : 0;
                        return (
                            <Box
                                key={d.category}
                                onClick={() => onSelectCategory?.(d.category)}
                                sx={{
                                    display: "flex", alignItems: "center", gap: 0.5,
                                    cursor: onSelectCategory ? "pointer" : "default",
                                    opacity: selectedCategory && d.category !== selectedCategory ? 0.4 : 1,
                                }}
                            >
                                <Box sx={{ width: 10, height: 10, borderRadius: "3px", flexShrink: 0, bgcolor: COLORS[i % COLORS.length] }} />
                                <Typography variant="caption" sx={{ whiteSpace: "nowrap" }}>
                                    {d.name} ({pct.toFixed(0)}%)
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}
