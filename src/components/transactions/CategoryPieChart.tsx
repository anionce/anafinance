import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Box, Typography } from "@mui/material";
import type { Category } from "../../types/Category";
import type { Transaction } from "../../types/Transaction";
import { calculateAmountByCategory } from "../../services/budget";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";

interface Props {
    transactions: Transaction[];
    categories: Category[];
}

const COLORS = [
    "#9575CD", "#66BB6A", "#F28B82", "#4FC3F7", "#FFB74D",
    "#BA68C8", "#4DB6AC", "#F06292", "#A1887F", "#90A4AE",
];

export default function CategoryPieChart({ transactions, categories }: Props) {
    const { t, locale } = useTranslation();
    const byCategory = calculateAmountByCategory(transactions);
    const data = Object.entries(byCategory)
        .map(([category, value]) => {
            const found = categories.find((c) => c.value === category);
            return {
                name: found ? getCategoryLabel(found, locale) : "—",
                value,
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

    return (
        <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={95}
                        paddingAngle={2}
                        isAnimationActive={false}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        formatter={(value, entry) => {
                            const entryValue = (entry?.payload as { value?: number } | undefined)?.value ?? 0;
                            const pct = total > 0 ? (entryValue / total) * 100 : 0;
                            return `${value} (${pct.toFixed(0)}%)`;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}
