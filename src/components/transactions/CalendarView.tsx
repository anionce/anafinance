import { useMemo, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    Stack,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Transaction } from "../../types/Transaction";
import type { Category } from "../../types/Category";
import { useTranslation } from "../../i18n/useTranslation";
import { getCategoryLabel } from "../../i18n/categoryTranslations";
import { formatCurrency } from "../../utils/currency";
import { accent } from "../../theme/colors";

interface Props {
    transactions: Transaction[];
    categories: Category[];
}

const MAX_VISIBLE_PER_DAY = 3;

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function currentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

function weekdayLabels(locale: string): string[] {
    const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { weekday: "short" });
    // 2024-01-01 is a Monday — a stable reference week to read labels off.
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(2024, 0, 1 + i);
        const label = formatter.format(d);
        return label.charAt(0).toUpperCase() + label.slice(1);
    });
}

function monthLabel(month: string, locale: string): string {
    const [year, m] = month.split("-").map(Number);
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" }).format(new Date(year, m - 1, 1));
}

export default function CalendarView({ transactions, categories }: Props) {
    const { t, locale } = useTranslation();
    const [viewMonth, setViewMonth] = useState(currentMonth());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const [year, month] = viewMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;

    const byDay = useMemo(() => {
        const map = new Map<string, Transaction[]>();
        for (const tx of transactions) {
            if (!tx.date.startsWith(viewMonth)) continue;
            const list = map.get(tx.date) ?? [];
            list.push(tx);
            map.set(tx.date, list);
        }
        return map;
    }, [transactions, viewMonth]);

    const cells: (string | null)[] = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => `${viewMonth}-${String(i + 1).padStart(2, "0")}`),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    function shiftMonth(delta: number) {
        const d = new Date(year, month - 1 + delta, 1);
        setViewMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }

    const today = todayISO();
    const selectedDayTransactions = selectedDay ? byDay.get(selectedDay) ?? [] : [];

    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
                <IconButton size="small" onClick={() => shiftMonth(-1)}>
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6" sx={{ minWidth: 200, textAlign: "center", textTransform: "capitalize" }}>
                    {monthLabel(viewMonth, locale)}
                </Typography>
                <IconButton size="small" onClick={() => shiftMonth(1)}>
                    <ChevronRightIcon />
                </IconButton>
            </Box>

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: "16px", overflow: "hidden", bgcolor: "background.paper" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", bgcolor: "background.default" }}>
                    {weekdayLabels(locale).map((label) => (
                        <Box key={label} sx={{ p: 1, textAlign: "center" }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>{label}</Typography>
                        </Box>
                    ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {cells.map((dateStr, i) => {
                        const dayTransactions = dateStr ? byDay.get(dateStr) ?? [] : [];
                        const isToday = dateStr === today;
                        const visible = dayTransactions.slice(0, MAX_VISIBLE_PER_DAY);
                        const extra = dayTransactions.length - visible.length;

                        return (
                            <Box
                                key={i}
                                onClick={() => dateStr && dayTransactions.length > 0 && setSelectedDay(dateStr)}
                                sx={{
                                    minHeight: 96,
                                    p: 0.75,
                                    borderTop: "1px solid",
                                    borderLeft: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: dateStr ? "background.paper" : "background.default",
                                    cursor: dateStr && dayTransactions.length > 0 ? "pointer" : "default",
                                    "&:hover": dateStr && dayTransactions.length > 0 ? { bgcolor: "background.default" } : undefined,
                                }}
                            >
                                {dateStr && (
                                    <>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 600,
                                                color: isToday ? "primary.contrastText" : "text.secondary",
                                                bgcolor: isToday ? "primary.main" : "transparent",
                                                borderRadius: "999px",
                                                width: 20, height: 20,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            {Number(dateStr.slice(-2))}
                                        </Typography>
                                        <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                            {visible.map((tx) => (
                                                <Box key={tx.id} sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                                                    <Box sx={{
                                                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                                                        bgcolor: tx.amount < 0 ? accent.budget : accent.income,
                                                    }} />
                                                    <Typography variant="caption" noWrap sx={{ fontSize: "0.68rem", color: "text.primary" }}>
                                                        {tx.description}
                                                    </Typography>
                                                </Box>
                                            ))}
                                            {extra > 0 && (
                                                <Typography variant="caption" sx={{ fontSize: "0.68rem", color: "text.disabled" }}>
                                                    {t.calendarMoreCount(extra)}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Dialog open={!!selectedDay} onClose={() => setSelectedDay(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{selectedDay && t.calendarDayDialogTitle(selectedDay)}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.5}>
                        {selectedDayTransactions.length === 0 && (
                            <Typography color="text.secondary">{t.calendarNoTransactionsThisDay}</Typography>
                        )}
                        {selectedDayTransactions.map((tx) => {
                            const category = categories.find((c) => c.value === tx.category);
                            return (
                                <Box key={tx.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" noWrap>{tx.description}</Typography>
                                        {category && (
                                            <Typography variant="caption" color="text.secondary">
                                                {getCategoryLabel(category, locale)}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: tx.amount < 0 ? accent.budget : accent.income, whiteSpace: "nowrap" }}>
                                        {tx.amount < 0 ? "−" : "+"}{formatCurrency(Math.abs(tx.amount))}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
