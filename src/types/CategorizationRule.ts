export interface CategorizationRule {
    id: string;
    /** Substring matched case-insensitively against a transaction's description. */
    keyword: string;
    category: string;
    /** When set, a matching transaction's amount is also credited to this goal
     *  (always as a positive contribution, regardless of the transaction's own sign). */
    goalId?: string;
}
