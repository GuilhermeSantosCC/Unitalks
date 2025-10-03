// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBtC2idA2obB5TRR9pJyhE8oEF4fZ4amJs",
    authDomain: "unitalks-41e7b.firebaseapp.com",
    projectId: "unitalks-41e7b",
    storageBucket: "unitalks-41e7b.firebasestorage.app",
    messagingSenderId: "717601738188",
    appId: "1:717601738188:web:b3aa628a95e75ce7296169",
    measurementId: "G-4PGGLX7NJW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);


