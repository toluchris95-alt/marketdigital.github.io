// src/services/firebase.js
import { initializeApp } from "firebase/app";
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

// ✅ Secure environment-based Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth setup
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore & Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

// ✅ Phone Auth helpers
let recaptchaVerifier;
export const getRecaptchaVerifier = (containerId = "recaptcha-container") => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
};

export const sendLoginCode = async (phoneNumber, containerId = "recaptcha-container") => {
  const verifier = getRecaptchaVerifier(containerId);
  return await signInWithPhoneNumber(auth, phoneNumber, verifier);
};

export default app;
