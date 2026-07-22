import { useState } from "react";
import { Box, ToggleButtonGroup, ToggleButton, Select, MenuItem, TextField, Button } from "@mui/material";
import type { Transaction } from "../../types/Transaction";
import type { DateFilter } from "../../utils/dates";
import { getAvailableMonths, getAvailableYears, getCurrentMonth, getCurrentYear } from "../../utils/dates";
import { useTranslation } from "../../i18n/useTranslation";

interface Props {
    transactions: Transaction[];
    value: DateFilter;
    onChange: (filter: Partial<DateFilter>) => void;
}

function formatMonth(month: string, locale: string): string {
    const [year, monthIndex] = month.split("-").map(Number);
    const date = new Date(year, monthIndex - 1, 1);
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" }).format(date);
}

export default function DateRangeFilter({ transactions, value, onChange }: Props) {
    const { t, locale } = useTranslation();
    const months = Array.from(new Set([getCurrentMonth(), ...getAvailableMonths(transactions)])).sort().reverse();
    const years = Array.from(new Set([getCurrentYear(), ...getAvailableYears(transactions)])).sort().reverse();

    const [fromDraft, setFromDraft] = useState(value.from);
    const [toDraft, setToDraft] = useState(value.to);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <ToggleButtonGroup
                size="small"
                exclusive
                value={value.mode}
                onChange={(_, mode: DateFilter["mode"] | null) => mode && onChange({ mode })}
            >
                <ToggleButton value="monthly">{t.dateFilterMonthly}</ToggleButton>
                <ToggleButton value="annual">{t.dateFilterAnnual}</ToggleButton>
                <ToggleButton value="custom">{t.dateFilterCustom}</ToggleButton>
            </ToggleButtonGroup>

            {value.mode === "monthly" && (
                <Select size="small" value={value.month} onChange={(e) => onChange({ month: e.target.value })}>
                    {months.map((m) => (
                        <MenuItem key={m} value={m}>{formatMonth(m, locale)}</MenuItem>
                    ))}
                </Select>
            )}

            {value.mode === "annual" && (
                <Select size="small" value={value.year} onChange={(e) => onChange({ year: e.target.value })}>
                    {years.map((y) => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                </Select>
            )}

            {value.mode === "custom" && (
                <>
                    <TextField
                        type="date"
                        size="small"
                        label={t.dateFilterFrom}
                        value={fromDraft}
                        onChange={(e) => setFromDraft(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <TextField
                        type="date"
                        size="small"
                        label={t.dateFilterTo}
                        value={toDraft}
                        onChange={(e) => setToDraft(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <Button variant="outlined" size="small" onClick={() => onChange({ from: fromDraft, to: toDraft })}>
                        {t.dateFilterApply}
                    </Button>
                </>
            )}
        </Box>
    );
}
