import { create } from "zustand";
import type { User } from "firebase/auth";
import { signInWithGoogle, signOutUser, watchAuthState } from "../services/auth";

interface AuthState {
    user: User | null;
    authLoading: boolean;
    init: () => void;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

let watching = false;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    authLoading: true,
    init: () => {
        if (watching) return;
        watching = true;
        watchAuthState((user) => set({ user, authLoading: false }));
    },
    signIn: signInWithGoogle,
    signOut: signOutUser,
}));
