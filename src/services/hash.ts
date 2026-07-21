export function hashTransaction(
    date: string,
    description: string,
    amount: number,
    occurrence: number = 0
): string {
    const raw = `${date}|${description}|${amount}|${occurrence}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = (hash << 5) - hash + raw.charCodeAt(i);
        hash |= 0;
    }
    return `tx_${Math.abs(hash)}_${raw.length}`;
}