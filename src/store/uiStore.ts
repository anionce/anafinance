import { create } from "zustand";
import type { DateFilter } from "../utils/dates";
import { defaultDateFilter } from "../utils/dates";

interface UIState {
    dateFilter: DateFilter;
    setDateFilter: (filter: Partial<DateFilter>) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    dateFilter: defaultDateFilter(),
    setDateFilter: (filter) => set({ dateFilter: { ...get().dateFilter, ...filter } }),
}));
