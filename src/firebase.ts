// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// This code now reads from your .env.local file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Simple check to ensure variables are loaded (you can remove this later)
if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key is not configured. Check your .env.local file.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth service
export const auth = getAuth(app);