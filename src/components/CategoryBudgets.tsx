import { LinearProgress, Typography, Box } from "@mui/material";
import { CATEGORIES } from "../types/Category";
import { CATEGORY_BUDGETS, TOTAL_BUDGET } from "../types/Budget";
import type { Transaction } from "../types/Transaction";

interface Props {
    transactions: Transaction[]; // ya filtradas al mes en curso
}

export default function CategoryBudgets({ transactions }: Props) {
    const spentByCategory: Record<string, number> = {};

    for (const t of transactions) {
        if (t.amount >= 0) continue; // solo gastos
        if (!(t.category in CATEGORY_BUDGETS)) continue;
        spentByCategory[t.category] = (spentByCategory[t.category] ?? 0) + Math.abs(t.amount);
    }

    const totalSpent = Object.values(spentByCategory).reduce((a, b) => a + b, 0);

    return (
        <Box sx={{ mt: 4 }}>
            

            {Object.entries(CATEGORY_BUDGETS).map(([key, limit]) => {
                const spent = spentByCategory[key] ?? 0;
                const pct = Math.min((spent / limit) * 100, 100);
                const label = CATEGORIES.find((c) => c.value === key)?.label ?? key;
                const over = spent > limit;

                return (
                    <Box key={key} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">{label}</Typography>
                            <Typography variant="body2" color={over ? "error" : "text.secondary"}>
                                {spent.toFixed(0)} € / {limit} €
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            color={over ? "error" : "primary"}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
}