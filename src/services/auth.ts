import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const watchAuthState = (callback: (user: User | null) => void): (() => void) => onAuthStateChanged(auth, callback);

export const signInWithGoogle = async (): Promise<void> => {
    await signInWithPopup(auth, googleProvider);
};

export const signOutUser = async (): Promise<void> => {
    await signOut(auth);
};
