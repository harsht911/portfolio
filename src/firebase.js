import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIHjLZ1srygh4C9ZeRm3DTC_B-dNd5TDA",
    authDomain: "portfolio-73652.firebaseapp.com",
    projectId: "portfolio-73652",
    storageBucket: "portfolio-73652.firebasestorage.app",
    messagingSenderId: "93746347560",
    appId: "1:93746347560:web:8c4ec86ca103241ef07f1d",
    measurementId: "G-RZR58QHGGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Export logEvent for easy access
export { logEvent };
