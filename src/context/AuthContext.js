import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Utility to create or update user doc in Firestore
  const createOrUpdateUserDoc = async (user, extra = {}) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    const baseData = {
      uid: user.uid,
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      displayName: user.displayName || user.email?.split("@")[0] || "User",
      photoURL: user.photoURL || "",
      walletBalance: 0,
      role: "Buyer",
      country: "",
      createdAt: serverTimestamp(),
      ...extra,
    };

    if (!snap.exists()) {
      await setDoc(ref, baseData);
      setUserData(baseData);
    } else {
      const existing = snap.data();
      const merged = { ...existing, ...extra };
      await updateDoc(ref, merged);
      setUserData(merged);
    }
  };

  // 🔄 Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await createOrUpdateUserDoc(user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserData(null);
  };

  // 🧩 Update display name or photo in Firebase Auth + Firestore
  const updateUserProfile = async (updates) => {
    if (!currentUser) return;
    if (updates.displayName || updates.photoURL) {
      await updateProfile(currentUser, {
        displayName: updates.displayName || currentUser.displayName,
        photoURL: updates.photoURL || currentUser.photoURL,
      });
    }
    const ref = doc(db, "users", currentUser.uid);
    await updateDoc(ref, updates);
    setUserData({ ...userData, ...updates });
  };

  const value = {
    currentUser,
    userData,
    loading,
    logout,
    updateUserProfile,
    setUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
