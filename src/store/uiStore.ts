import { create } from "zustand";
import type { DateFilter } from "../utils/dates";
import { defaultDateFilter } from "../utils/dates";

interface UIState {
    dateFilter: DateFilter;
    setDateFilter: (filter: Partial<DateFilter>) => void;
    /** The pendingIds string (see ReviewDialog) last dismissed with "later", so it stays
     *  dismissed across page navigation instead of popping back up on every tab switch. */
    reviewDismissedIds: string;
    dismissReview: (pendingIds: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    dateFilter: defaultDateFilter(),
    setDateFilter: (filter) => set({ dateFilter: { ...get().dateFilter, ...filter } }),
    reviewDismissedIds: "",
    dismissReview: (pendingIds) => set({ reviewDismissedIds: pendingIds }),
}));
