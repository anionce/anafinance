import type { Locale } from "../store/localeStore";

export interface TranslationSet {
    navDashboard: string;
    navExpenses: string;
    navIncome: string;
    navGoals: string;
    loading: string;

    importExcelButton: string;

    statusOverTitle: string;
    statusTightTitle: string;
    statusOkTitle: string;
    statusGreatTitle: string;
    overBudgetBy: (amount: string) => string;
    remainingToSpend: (amount: string) => string;
    budgetCardTitle: string;
    incomeCardTitle: string;

    budgetByCategoryTitle: string;
    manageCategoriesTooltip: string;
    editBudgetTooltip: string;
    remainingAmount: (amount: string) => string;
    overspentAmount: (amount: string) => string;

    editBudgetDialogTitle: string;
    editBudgetDialogHint: string;
    cancel: string;
    save: string;

    manageCategoriesDialogTitle: string;
    newCategoryPlaceholder: string;
    categoriesHint: string;
    close: string;

    savingsGoalsTitle: string;
    goalLabel: string;
    targetLabel: string;
    add: string;
    noGoalsYet: string;
    percentAchieved: (pct: string) => string;

    colDescription: string;
    colDate: string;
    colAmount: string;
    colCategory: string;
    colNotes: string;
    noCategoryPlaceholder: string;

    reviewDialogTitle: (remaining: number) => string;
    finish: string;
    next: string;

    noTransactionsToShow: string;

    totalSpentTitle: string;
    totalIncomeTitle: string;
    allMonths: string;

    insightsTitle: string;
    spentLessMessage: (pct: string) => string;
    spentMoreMessage: (pct: string) => string;
    daysWithoutSpending: (emoji: string, days: number, categoryName: string) => string;

    monthly: string;
    bimonthly: string;
}

export const translations: Record<Locale, TranslationSet> = {
    es: {
        navDashboard: "Dashboard",
        navExpenses: "Gastos",
        navIncome: "Ingresos",
        navGoals: "Objetivos",
        loading: "Cargando...",

        importExcelButton: "Importar Excel BBVA",

        statusOverTitle: "Te has pasado del presupuesto",
        statusTightTitle: "Vas ajustada este mes",
        statusOkTitle: "Vas bien este mes",
        statusGreatTitle: "Vas genial este mes",
        overBudgetBy: (amount) => `Te has pasado ${amount} del presupuesto`,
        remainingToSpend: (amount) => `Te quedan ${amount} por gastar este mes`,
        budgetCardTitle: "Presupuesto",
        incomeCardTitle: "Ingresos del mes",

        budgetByCategoryTitle: "Presupuesto por categoría",
        manageCategoriesTooltip: "Gestionar categorías",
        editBudgetTooltip: "Editar presupuesto",
        remainingAmount: (amount) => `Quedan ${amount}`,
        overspentAmount: (amount) => `Te has pasado ${amount}`,

        editBudgetDialogTitle: "Editar presupuesto por categoría",
        editBudgetDialogHint: "Deja una categoría vacía o en 0 para que no cuente en el presupuesto.",
        cancel: "Cancelar",
        save: "Guardar",

        manageCategoriesDialogTitle: "Gestionar categorías",
        newCategoryPlaceholder: "Nueva categoría (ej: 🎨 Arte)",
        categoriesHint: "Los cambios se guardan al momento y afectan a toda la app.",
        close: "Cerrar",

        savingsGoalsTitle: "Objetivos de ahorro",
        goalLabel: "Objetivo",
        targetLabel: "Meta (€)",
        add: "Añadir",
        noGoalsYet: "Todavía no tienes objetivos de ahorro.",
        percentAchieved: (pct) => `${pct}% conseguido`,

        colDescription: "Concepto",
        colDate: "Fecha",
        colAmount: "Importe",
        colCategory: "Categoría",
        colNotes: "Notas",
        noCategoryPlaceholder: "— sin categoría —",

        reviewDialogTitle: (remaining) => `Clasificar movimiento (quedan ${remaining})`,
        finish: "Terminar",
        next: "Siguiente",

        noTransactionsToShow: "No hay movimientos para mostrar.",

        totalSpentTitle: "Total gastado",
        totalIncomeTitle: "Total ingresado",
        allMonths: "Todos los meses",

        insightsTitle: "Resumen",
        spentLessMessage: (pct) => `💚 Este mes has gastado un ${pct}% menos que el anterior.`,
        spentMoreMessage: (pct) => `⚠️ Este mes has gastado un ${pct}% más que el anterior.`,
        daysWithoutSpending: (emoji, days, categoryName) => `${emoji} Llevas ${days} días sin gastar en ${categoryName}.`,

        monthly: "Mensual",
        bimonthly: "Bimestral",
    },
    en: {
        navDashboard: "Dashboard",
        navExpenses: "Expenses",
        navIncome: "Income",
        navGoals: "Goals",
        loading: "Loading...",

        importExcelButton: "Import BBVA Excel",

        statusOverTitle: "You've gone over budget",
        statusTightTitle: "It's tight this month",
        statusOkTitle: "You're doing okay this month",
        statusGreatTitle: "You're doing great this month",
        overBudgetBy: (amount) => `You've gone ${amount} over budget`,
        remainingToSpend: (amount) => `You have ${amount} left to spend this month`,
        budgetCardTitle: "Budget",
        incomeCardTitle: "Income this month",

        budgetByCategoryTitle: "Budget by category",
        manageCategoriesTooltip: "Manage categories",
        editBudgetTooltip: "Edit budget",
        remainingAmount: (amount) => `${amount} left`,
        overspentAmount: (amount) => `You've overspent by ${amount}`,

        editBudgetDialogTitle: "Edit budget by category",
        editBudgetDialogHint: "Leave a category empty or at 0 so it isn't counted in the budget.",
        cancel: "Cancel",
        save: "Save",

        manageCategoriesDialogTitle: "Manage categories",
        newCategoryPlaceholder: "New category (e.g. 🎨 Art)",
        categoriesHint: "Changes save instantly and affect the whole app.",
        close: "Close",

        savingsGoalsTitle: "Savings goals",
        goalLabel: "Goal",
        targetLabel: "Target (€)",
        add: "Add",
        noGoalsYet: "You don't have any savings goals yet.",
        percentAchieved: (pct) => `${pct}% achieved`,

        colDescription: "Description",
        colDate: "Date",
        colAmount: "Amount",
        colCategory: "Category",
        colNotes: "Notes",
        noCategoryPlaceholder: "— no category —",

        reviewDialogTitle: (remaining) => `Classify transaction (${remaining} left)`,
        finish: "Finish",
        next: "Next",

        noTransactionsToShow: "No transactions to show.",

        totalSpentTitle: "Total spent",
        totalIncomeTitle: "Total income",
        allMonths: "All months",

        insightsTitle: "Summary",
        spentLessMessage: (pct) => `💚 You've spent ${pct}% less than last month.`,
        spentMoreMessage: (pct) => `⚠️ You've spent ${pct}% more than last month.`,
        daysWithoutSpending: (emoji, days, categoryName) => `${emoji} You haven't spent on ${categoryName} in ${days} days.`,

        monthly: "Monthly",
        bimonthly: "Bimonthly",
    },
};
