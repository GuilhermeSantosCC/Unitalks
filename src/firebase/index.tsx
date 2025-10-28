// src/firebase/index.tsx
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5ePbbJ2fTdwt6q1jA3KyprfROauojhaw",
  authDomain: "unitalks-ac00b.firebaseapp.com",
  projectId: "unitalks-ac00b",
  storageBucket: "unitalks-ac00b.firebasestorage.app",
  messagingSenderId: "22145016101",
  appId: "1:22145016101:web:8c322cbef538edfe97facc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);