import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApiXmqX5uVGxB_mMchRdc5H7i4QkrzUTc",
  authDomain: "finance-ana.firebaseapp.com",
  projectId: "finance-ana",
  storageBucket: "finance-ana.firebasestorage.app",
  messagingSenderId: "125911160183",
  appId: "1:125911160183:web:b759c6c92534d7372f7d72",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);