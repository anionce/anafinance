export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
}

/** Value stays "colchon" to match the id already persisted in Firestore. */
export const FEATURED_GOAL_ID = "colchon";
