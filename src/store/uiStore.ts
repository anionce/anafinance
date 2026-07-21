import { create } from "zustand";

interface UIState {
    selectedMonth: string;
    setSelectedMonth: (month: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    selectedMonth: "all",
    setSelectedMonth: (month) => set({ selectedMonth: month }),
}));
