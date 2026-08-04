export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    notes?: string;
    /** Set on one portion when this transaction came from splitting another —
     *  the amount the original (pre-split) row had, so a re-imported bank
     *  file still recognizes that row as already accounted for. */
    splitFromAmount?: number;
}