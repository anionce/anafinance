import type { Transaction } from "../types/Transaction";
import type { Category } from "../types/Category";
import type { Locale } from "../store/localeStore";
import { calculateTotalSpent } from "./budget";
import { filterByMonth, getCurrentMonth, MS_PER_DAY, parseDateKey, shiftMonth, toDateKey } from "../utils/dates";
import { translations } from "../i18n/translations";
import { getCategoryLabel } from "../i18n/categoryTranslations";

const MIN_DAYS_TO_MENTION = 7;
const SIGNIFICANT_CHANGE_PCT = 10;

const daysBetween = (a: Date, b: Date): number => Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);

const splitEmoji = (label: string): { emoji: string; name: string } => {
    const [emoji, ...rest] = label.split(" ");
    return { emoji, name: rest.join(" ") };
};

export const generateInsights = (transactions: Transaction[], categories: Category[], locale: Locale): string[] => {
    if (transactions.length === 0) return [];

    const t = translations[locale];
    const insights: string[] = [];
    const today = parseDateKey(toDateKey(new Date()));
    const currentMonth = getCurrentMonth();
    const previousMonth = shiftMonth(currentMonth, -1);
    const noComputableValues = new Set(categories.filter((c) => c.noComputable).map((c) => c.value));
    const computableTransactions = transactions.filter((tx) => !noComputableValues.has(tx.category));

    const currentSpent = calculateTotalSpent(filterByMonth(computableTransactions, currentMonth));
    const previousSpent = calculateTotalSpent(filterByMonth(computableTransactions, previousMonth));

    if (previousSpent > 0) {
        const changePct = ((currentSpent - previousSpent) / previousSpent) * 100;
        if (changePct <= -SIGNIFICANT_CHANGE_PCT) {
            insights.push(t.spentLessMessage(Math.abs(changePct).toFixed(0)));
        } else if (changePct >= SIGNIFICANT_CHANGE_PCT) {
            insights.push(t.spentMoreMessage(changePct.toFixed(0)));
        }
    }

    const earliestDate = transactions.reduce((earliest, tx) => (tx.date < earliest ? tx.date : earliest), transactions[0].date);
    const historyStart = parseDateKey(earliestDate);

    for (const cat of categories) {
        if (cat.noComputable) continue;

        const lastPurchaseDate = transactions
            .filter((tx) => tx.category === cat.value && tx.amount < 0)
            .reduce<string | null>((latest, tx) => (!latest || tx.date > latest ? tx.date : latest), null);

        const since = lastPurchaseDate ? parseDateKey(lastPurchaseDate) : historyStart;
        const days = daysBetween(today, since);

        if (days >= MIN_DAYS_TO_MENTION) {
            const { emoji, name } = splitEmoji(getCategoryLabel(cat, locale));
            insights.push(t.daysWithoutSpending(emoji, days, name));
        }
    }

    return insights;
};
