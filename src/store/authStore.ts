import { create } from "zustand";
import type { User } from "firebase/auth";
import { watchAuthState, signInWithGoogle, signOutUser } from "../services/auth";

interface AuthState {
    user: User | null;
    authLoading: boolean;
    init: () => void;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

let initialized = false;

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    authLoading: true,

    init() {
        if (initialized) return;
        initialized = true;
        watchAuthState((user) => {
            set({ user, authLoading: false });
        });
    },

    async signIn() {
        await signInWithGoogle();
    },

    async signOut() {
        await signOutUser();
    },
}));
