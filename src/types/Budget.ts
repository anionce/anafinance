export type BudgetPeriod = "monthly" | "bimonthly";

export interface CategoryBudget {
    amount: number;
    period: BudgetPeriod;
}

export const DEFAULT_CATEGORY_BUDGETS: Record<string, CategoryBudget> = {
    ropa: { amount: 30, period: "monthly" },
    libros: { amount: 24, period: "monthly" },
    casa: { amount: 50, period: "monthly" },
    imprevistos: { amount: 25, period: "monthly" },
    salud: { amount: 30, period: "monthly" },
    wellness: { amount: 40, period: "monthly" },
    espectaculos: { amount: 20, period: "monthly" },
    regalos: { amount: 60, period: "monthly" },
    servicios_online: { amount: 21, period: "monthly" },
};
