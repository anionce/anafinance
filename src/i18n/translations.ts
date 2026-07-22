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

    weekly: string;
    monthly: string;
    bimonthly: string;
    everyNMonths: string;
    everyNMonthsChip: (n: number) => string;
    yearly: string;
    intervalMonthsLabel: string;

    noComputableLabel: string;

    manageRulesTooltip: string;
    rulesDialogTitle: string;
    rulesHint: string;
    ruleKeywordPlaceholder: string;
    noRulesYet: string;
    ruleGoesTo: string;

    splitTooltip: string;
    splitDialogTitle: string;
    splitDialogHint: string;
    splitAddPortion: string;
    splitRemainingLabel: (amount: string) => string;
    splitAllAssignedLabel: string;
    splitConfirm: string;

    addTransactionButton: string;
    addTransactionDialogTitle: string;
    transactionTypeExpense: string;
    transactionTypeIncome: string;

    appName: string;
    signInTitle: string;
    signInSubtitle: string;
    signInWithGoogle: string;
    signInError: string;
    signOut: string;

    onboardingWelcomeTitle: string;
    onboardingWelcomeSubtitle: string;
    onboardingStepCategories: string;
    onboardingStepBudgets: string;
    onboardingStepGoals: string;
    onboardingStepImport: string;
    onboardingCategoriesHint: string;
    onboardingBudgetsHint: string;
    onboardingGoalsHint: string;
    onboardingImportHint: string;
    onboardingImportSkipHint: string;
    onboardingBack: string;
    onboardingSkip: string;
    onboardingFinish: string;
    onboardingAddedGoals: (count: number) => string;

    mappingTitle: string;
    mappingHint: string;
    mappingDateColumn: string;
    mappingDescriptionColumn: string;
    mappingAmountColumn: string;
    mappingNotACurrency: string;
    mappingConfirm: string;
    mappingPreviewTitle: string;
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

        weekly: "Semanal",
        monthly: "Mensual",
        bimonthly: "Bimestral",
        everyNMonths: "Personalizado",
        everyNMonthsChip: (n) => `Cada ${n} meses`,
        yearly: "Anual",
        intervalMonthsLabel: "Cada cuántos meses",

        noComputableLabel: "No computable (no cuenta como gasto ni ingreso)",

        manageRulesTooltip: "Reglas de categorización",
        rulesDialogTitle: "Reglas de categorización",
        rulesHint: "Si la descripción de un movimiento importado incluye esta palabra, se le asignará automáticamente la categoría elegida.",
        ruleKeywordPlaceholder: "Palabra clave (ej: netflix)",
        noRulesYet: "Todavía no tienes reglas de categorización.",
        ruleGoesTo: "va a",

        splitTooltip: "Dividir movimiento",
        splitDialogTitle: "Dividir movimiento",
        splitDialogHint: "Reparte el importe en varias porciones, cada una con su propia categoría.",
        splitAddPortion: "Añadir porción",
        splitRemainingLabel: (amount) => `Quedan ${amount} por asignar`,
        splitAllAssignedLabel: "Todo el importe está asignado",
        splitConfirm: "Dividir",

        addTransactionButton: "Añadir movimiento",
        addTransactionDialogTitle: "Añadir movimiento",
        transactionTypeExpense: "Gasto",
        transactionTypeIncome: "Ingreso",

        appName: "Ana Finance",
        signInTitle: "Bienvenido a Ana Finance",
        signInSubtitle: "Inicia sesión para ver y gestionar tu presupuesto.",
        signInWithGoogle: "Continuar con Google",
        signInError: "No se pudo iniciar sesión. Inténtalo de nuevo.",
        signOut: "Cerrar sesión",

        onboardingWelcomeTitle: "Vamos a configurar tu presupuesto",
        onboardingWelcomeSubtitle: "Cuatro pasos rápidos y ya puedes empezar a usar la app.",
        onboardingStepCategories: "Categorías",
        onboardingStepBudgets: "Presupuesto",
        onboardingStepGoals: "Objetivos",
        onboardingStepImport: "Importar",
        onboardingCategoriesHint: "Estas son las categorías de partida. Puedes editarlas, borrarlas o añadir las tuyas — también podrás cambiarlas más adelante.",
        onboardingBudgetsHint: "Ponle un límite mensual a las categorías que quieras controlar. Puedes dejar el resto vacías y añadirlas cuando quieras.",
        onboardingGoalsHint: "Añade algún objetivo de ahorro si quieres empezar a trackearlo ya. Es opcional, puedes saltarte este paso.",
        onboardingImportHint: "Importa tu primer Excel del banco para empezar a ver tus movimientos.",
        onboardingImportSkipHint: "Puedes hacerlo más tarde desde el Dashboard.",
        onboardingBack: "Atrás",
        onboardingSkip: "Saltar",
        onboardingFinish: "Empezar",
        onboardingAddedGoals: (count) => `${count} objetivo${count === 1 ? "" : "s"} añadido${count === 1 ? "" : "s"}`,

        mappingTitle: "No reconocemos este formato de Excel",
        mappingHint: "Parece que no es de BBVA. Dinos qué columna es cada cosa y lo importamos igual.",
        mappingDateColumn: "Columna de fecha",
        mappingDescriptionColumn: "Columna de concepto",
        mappingAmountColumn: "Columna de importe",
        mappingNotACurrency: "Alguna fila no tiene un importe numérico válido y se ignorará.",
        mappingConfirm: "Importar con este mapeo",
        mappingPreviewTitle: "Vista previa de las primeras filas",
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

        weekly: "Weekly",
        monthly: "Monthly",
        bimonthly: "Bimonthly",
        everyNMonths: "Custom",
        everyNMonthsChip: (n) => `Every ${n} months`,
        yearly: "Yearly",
        intervalMonthsLabel: "Every how many months",

        noComputableLabel: "Not counted (doesn't count as expense or income)",

        manageRulesTooltip: "Categorization rules",
        rulesDialogTitle: "Categorization rules",
        rulesHint: "If an imported transaction's description includes this word, it'll automatically get the chosen category.",
        ruleKeywordPlaceholder: "Keyword (e.g. netflix)",
        noRulesYet: "You don't have any categorization rules yet.",
        ruleGoesTo: "goes to",

        splitTooltip: "Split transaction",
        splitDialogTitle: "Split transaction",
        splitDialogHint: "Divide the amount into several portions, each with its own category.",
        splitAddPortion: "Add portion",
        splitRemainingLabel: (amount) => `${amount} left to assign`,
        splitAllAssignedLabel: "The full amount is assigned",
        splitConfirm: "Split",

        addTransactionButton: "Add transaction",
        addTransactionDialogTitle: "Add transaction",
        transactionTypeExpense: "Expense",
        transactionTypeIncome: "Income",

        appName: "Ana Finance",
        signInTitle: "Welcome to Ana Finance",
        signInSubtitle: "Sign in to see and manage your budget.",
        signInWithGoogle: "Continue with Google",
        signInError: "Couldn't sign in. Please try again.",
        signOut: "Sign out",

        onboardingWelcomeTitle: "Let's set up your budget",
        onboardingWelcomeSubtitle: "Four quick steps and you're ready to go.",
        onboardingStepCategories: "Categories",
        onboardingStepBudgets: "Budget",
        onboardingStepGoals: "Goals",
        onboardingStepImport: "Import",
        onboardingCategoriesHint: "These are the starting categories. Edit, delete, or add your own — you can always change them later.",
        onboardingBudgetsHint: "Set a monthly limit for the categories you want to track. You can leave the rest empty and add them later.",
        onboardingGoalsHint: "Add a savings goal if you want to start tracking one now. This step is optional.",
        onboardingImportHint: "Import your first bank Excel file to start seeing your transactions.",
        onboardingImportSkipHint: "You can do this later from the Dashboard.",
        onboardingBack: "Back",
        onboardingSkip: "Skip",
        onboardingFinish: "Get started",
        onboardingAddedGoals: (count) => `${count} goal${count === 1 ? "" : "s"} added`,

        mappingTitle: "We don't recognize this Excel format",
        mappingHint: "This doesn't look like a BBVA export. Tell us which column is which and we'll import it anyway.",
        mappingDateColumn: "Date column",
        mappingDescriptionColumn: "Description column",
        mappingAmountColumn: "Amount column",
        mappingNotACurrency: "Some rows don't have a valid numeric amount and will be skipped.",
        mappingConfirm: "Import with this mapping",
        mappingPreviewTitle: "Preview of the first rows",
    },
};
