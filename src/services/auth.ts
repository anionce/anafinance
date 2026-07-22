import {
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export function watchAuthState(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, googleProvider);
}

export async function signOutUser(): Promise<void> {
    await signOut(auth);
}
