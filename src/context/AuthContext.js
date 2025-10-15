import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
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
  const [error, setError] = useState(null);

  // 🔥 Safe helper to create/update user doc
  const createOrUpdateUserDoc = async (user, extra = {}) => {
    try {
      if (!user || !db) return;
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
    } catch (err) {
      console.error("🔥 AuthContext Firestore error:", err);
      setError(err);
    }
  };

  // 🔄 Auth listener (wrapped in try/catch)
  useEffect(() => {
    if (!auth) {
      console.error("❌ Firebase Auth not initialized!");
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          await createOrUpdateUserDoc(user);
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("❌ Auth state error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
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
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err);
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    logout,
    updateUserProfile,
    setUserData,
    error,
  };

  // 🧠 Always render something, even if broken
  if (error) {
    return (
      <div className="bg-red-800 text-white text-center p-6">
        <h2 className="text-xl font-bold">🔥 Auth Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="text-center text-gray-400 p-10">Loading user...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
