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

// ✅ Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBV2GUGOfYBxjbAHjYaYwSyrCQP5ik0k0s",
  authDomain: "digital-marketplace-4a9a6.firebaseapp.com",
  projectId: "digital-marketplace-4a9a6",
  storageBucket: "digital-marketplace-4a9a6.appspot.com",
  messagingSenderId: "267883417599",
  appId: "1:267883417599:web:f9bd92517a48dc1dcde1ca",
  measurementId: "G-RR6Q1Q8L9B"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const googleProvider = new GoogleAuthProvider();

// ✅ Firestore
export const db = getFirestore(app);

// ✅ Storage (for uploaded files)
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
