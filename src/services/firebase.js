// src/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/**
 * 🔥 Firebase Configuration
 * (Uses your real project keys — safe for client-side)
 */
const firebaseConfig = {
  apiKey: "AIzaSyBV2GUGOfYBxjbAHjYaYwSyrCQP5ik0k0s",
  authDomain: "digital-marketplace-4a9a6.firebaseapp.com",
  projectId: "digital-marketplace-4a9a6",
  storageBucket: "digital-marketplace-4a9a6.appspot.com",
  messagingSenderId: "267883417599",
  appId: "1:267883417599:web:f9bd92517a48dc1dcde1ca",
  measurementId: "G-RR6Q1Q8L9B",
};

/**
 * 🧩 Safe Initialization (prevents duplicate app errors on GH Pages)
 */
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized");
} else {
  app = getApp();
  console.log("ℹ️ Using existing Firebase app instance");
}

/**
 * 🔐 Auth Setup
 */
export const auth = getAuth(app);
try {
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log("🔒 Auth persistence set to local"))
    .catch((err) => console.warn("⚠️ Persistence warning:", err.message));
} catch (err) {
  console.warn("⚠️ Persistence not supported in this environment:", err.message);
}

export const googleProvider = new GoogleAuthProvider();

/**
 * 💾 Firestore + Storage
 */
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * 📱 Phone Auth Helper
 */
let recaptchaVerifier = null;

export const getRecaptchaVerifier = (containerId = "recaptcha-container") => {
  try {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
      });
      console.log("✅ RecaptchaVerifier initialized");
    }
    return recaptchaVerifier;
  } catch (err) {
    console.error("❌ RecaptchaVerifier error:", err);
    return null;
  }
};

export const sendLoginCode = async (phoneNumber, containerId = "recaptcha-container") => {
  try {
    const verifier = getRecaptchaVerifier(containerId);
    return await signInWithPhoneNumber(auth, phoneNumber, verifier);
  } catch (err) {
    console.error("❌ sendLoginCode error:", err);
    throw err;
  }
};

export default app;
