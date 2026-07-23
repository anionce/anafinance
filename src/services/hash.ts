// Description is deliberately excluded: BBVA exports the same transaction
// with different wording depending on the file's language (Spanish/Catalan),
// which would otherwise make re-importing the same period in another
// language create duplicates instead of being recognized as already-imported.
export function hashTransaction(
    date: string,
    amount: number,
    occurrence: number = 0
): string {
    const raw = `${date}|${amount}|${occurrence}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = (hash << 5) - hash + raw.charCodeAt(i);
        hash |= 0;
    }
    return `tx_${Math.abs(hash)}_${raw.length}`;
}