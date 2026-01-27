import * as firebaseApp from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyANIBIA_Vl-T9C-zaRUTSfGE9AuWdJcxGY",
  authDomain: "spaceyaa-10d75.firebaseapp.com",
  projectId: "spaceyaa-10d75",
  storageBucket: "spaceyaa-10d75.firebasestorage.app",
  messagingSenderId: "626014132233",
  appId: "1:626014132233:web:03e8eb0b82ab919f8040d8",
  measurementId: "G-8XNGK1MF1T"
};

// Check if config is set up (Simple check to ensure apiKey is present)
const isConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "AIzaSyANIBIA_Vl-T9C-zaRUTSfGE9AuWdJcxGY";

let app;
let db: any;

if (isConfigured) {
  try {
    // Initialize modular app
    app = firebaseApp.initializeApp(firebaseConfig);
    // Initialize modular firestore
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("⚠️ Firebase credentials missing in firebaseConfig.ts. Falling back to LocalStorage only.");
}

export { db, isConfigured };