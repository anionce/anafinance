export function formatCurrency(value: number, fractionDigits = 0): string {
    const formatted = value.toLocaleString("es-ES", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
    return `${formatted} €`;
}
