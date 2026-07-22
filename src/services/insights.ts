import type { Transaction } from "../types/Transaction";
import type { Category } from "../types/Category";
import type { Locale } from "../store/localeStore";
import { calculateTotalSpent } from "./budget";
import { getCurrentMonth, filterByMonth } from "../utils/dates";
import { translations } from "../i18n/translations";
import { getCategoryLabel } from "../i18n/categoryTranslations";

const MIN_DAYS_TO_MENTION = 7;
const SIGNIFICANT_CHANGE_PCT = 10;

function shiftMonth(month: string, delta: number): string {
    const [year, monthIndex] = month.split("-").map(Number);
    const date = new Date(year, monthIndex - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysBetween(a: Date, b: Date): number {
    return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function splitEmoji(label: string): { emoji: string; name: string } {
    const [emoji, ...rest] = label.split(" ");
    return { emoji, name: rest.join(" ") };
}

/**
 * Generates short messages from real comparisons: total spend vs. last
 * month (only if that month has data), and days without spending in each
 * category, always bounded to the real available history (never assumes
 * more months than are actually on record).
 */
export function generateInsights(
    transactions: Transaction[],
    categories: Category[],
    locale: Locale
): string[] {
    if (transactions.length === 0) return [];

    const t = translations[locale];
    const insights: string[] = [];
    const today = new Date();
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

    const earliestDate = transactions.reduce(
        (earliest, tx) => (tx.date < earliest ? tx.date : earliest),
        transactions[0].date
    );
    const historyStart = new Date(earliestDate);

    for (const cat of categories) {
        // Categories that never represent an expense
        if (cat.noComputable) continue;

        const lastPurchaseDate = transactions
            .filter((tx) => tx.category === cat.value && tx.amount < 0)
            .reduce<string | null>((latest, tx) => (!latest || tx.date > latest ? tx.date : latest), null);

        // If nothing was ever spent in this category, count from the start of
        // the available history, not from an arbitrary date.
        const since = lastPurchaseDate ? new Date(lastPurchaseDate) : historyStart;
        const days = daysBetween(today, since);

        if (days >= MIN_DAYS_TO_MENTION) {
            const { emoji, name } = splitEmoji(getCategoryLabel(cat, locale));
            insights.push(t.daysWithoutSpending(emoji, days, name));
        }
    }

    return insights;
}
