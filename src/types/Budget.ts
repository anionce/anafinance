export const CATEGORY_BUDGETS: Record<string, number> = {
    ropa: 30,
    libros: 24,
    casa: 50,
    imprevistos: 25,
    salud: 30,
    wellness: 40,
    espectaculos: 20,
    regalos: 60,
    servicios_online: 21,
};

export const TOTAL_BUDGET = Object.values(CATEGORY_BUDGETS).reduce((a, b) => a + b, 0);