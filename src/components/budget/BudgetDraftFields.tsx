import { Box, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useTranslation } from "../../i18n/useTranslation";
import type { BudgetPeriod } from "../../types/Budget";
import type { BudgetDraft } from "../../utils/budgetDrafts";

const PERIODS: BudgetPeriod[] = ["weekly", "monthly", "bimonthly", "everyNMonths", "yearly"];

interface Props {
    label: string;
    draft: BudgetDraft;
    onChange: (draft: BudgetDraft) => void;
    onCommit?: (draft: BudgetDraft) => void;
}

export const BudgetDraftFields = ({ label, draft, onChange, onCommit }: Props) => {
    const { t } = useTranslation();

    const update = (patch: Partial<BudgetDraft>, commit: boolean) => {
        const next = { ...draft, ...patch };
        onChange(next);
        if (commit) onCommit?.(next);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">{label}</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    type="number"
                    size="small"
                    value={draft.amount}
                    onChange={(e) => update({ amount: e.target.value }, false)}
                    onBlur={() => onCommit?.(draft)}
                    slotProps={{ htmlInput: { "aria-label": label } }}
                    sx={{ flex: 1 }}
                />
                <Select
                    size="small"
                    value={draft.period}
                    onChange={(e) => update({ period: e.target.value as BudgetPeriod }, true)}
                    sx={{ minWidth: 140 }}
                >
                    {PERIODS.map((period) => (
                        <MenuItem key={period} value={period}>
                            {t[period]}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
            {draft.period === "everyNMonths" && (
                <TextField
                    type="number"
                    size="small"
                    label={t.intervalMonthsLabel}
                    value={draft.intervalMonths}
                    onChange={(e) => update({ intervalMonths: e.target.value }, true)}
                    sx={{ maxWidth: 180 }}
                />
            )}
        </Box>
    );
};
