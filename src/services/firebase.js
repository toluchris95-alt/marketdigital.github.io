import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV2GUGOfYBxjbAHjYaYwSyrCQP5ik0k0s",
  authDomain: "digital-marketplace-4a9a6.firebaseapp.com",
  projectId: "digital-marketplace-4a9a6",
  storageBucket: "digital-marketplace-4a9a6.appspot.com",
  messagingSenderId: "267883417599",
  appId: "1:267883417599:web:f9bd92517a48dc1dcde1ca",
  measurementId: "G-RR6Q1Q8L9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
