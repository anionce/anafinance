export type BudgetPeriod = "weekly" | "monthly" | "bimonthly" | "everyNMonths" | "yearly";

export interface CategoryBudget {
    amount: number;
    period: BudgetPeriod;
    /** Only used when period === "everyNMonths": how many months each period spans. */
    intervalMonths?: number;
}

export const DEFAULT_CATEGORY_BUDGETS: Record<string, CategoryBudget> = {
    ropa: { amount: 30, period: "monthly" },
    libros: { amount: 24, period: "monthly" },
    casa: { amount: 50, period: "monthly" },
    salud: { amount: 30, period: "monthly" },
    wellness: { amount: 40, period: "monthly" },
    espectaculos: { amount: 20, period: "monthly" },
    regalos: { amount: 60, period: "monthly" },
    servicios_online: { amount: 21, period: "monthly" },
};
