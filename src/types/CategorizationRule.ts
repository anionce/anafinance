export interface CategorizationRule {
    id: string;
    /** Substring matched case-insensitively against a transaction's description. */
    keyword: string;
    category: string;
}
