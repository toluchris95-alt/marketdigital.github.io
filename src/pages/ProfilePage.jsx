// Updated ProfilePage with the initiateTopUp handleTopUp version integrated

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { storage, db } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import Spinner from "../components/Spinner";

// For payment gateway integration
import { initiateTopUp } from "../services/paymentGateway";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const ProfilePage = () => {
  const { currentUser, userData, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(userData?.displayName || "");
  const [country, setCountry] = useState(userData?.country || "");
  const [photoFile, setPhotoFile] = useState(null);

  const [topUpAmount, setTopUpAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // For real payments: store a transaction reference, etc.
  const [paymentLoading, setPaymentLoading] = useState(false);

  if (!currentUser) {
    return <p>Please log in to view your profile.</p>;
  }

  const handleProfileSave = async () => {
    setErr(""); setMsg("");
    setLoading(true);
    try {
      let photoURL = userData?.photoURL || "";
      if (photoFile) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}/${photoFile.name}`);
        const uploadRes = await uploadBytes(storageRef, photoFile);
        photoURL = await getDownloadURL(storageRef);
      }
      // Update both Firebase Auth profile (if needed) and userData
      await updateUserProfile({ displayName, country, photoURL });
      setMsg("Profile updated successfully.");
    } catch (e) {
      console.error(e);
      setErr("Failed to update profile. " + (e.message || ""));
    }
    setLoading(false);
  };

  const handleTopUp = async () => {
    setErr(""); setMsg("");
    const amountNum = parseFloat(topUpAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErr("Enter a valid amount.");
      return;
    }
    setPaymentLoading(true);
    try {
      const { link } = await initiateTopUp({
        uid: currentUser.uid,
        amount: amountNum,
        email: currentUser.email,
        method: "paystack" // or "flutterwave"
      });
      if (!link) throw new Error("Payment link not received");
      window.location.href = link; // go to checkout
    } catch (e) {
      console.error("Top-up error:", e);
      setErr("Payment failed: " + e.message);
    }
    setPaymentLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">My Profile</h1>

      {err && <div className="p-3 bg-red-100 text-red-700 rounded">{err}</div>}
      {msg && <div className="p-3 bg-green-100 text-green-700 rounded">{msg}</div>}

      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          {userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
              {(displayName?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium dark:text-gray-200">Display Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-medium dark:text-gray-200">Country</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-medium dark:text-gray-200">Change Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleProfileSave}
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Profile"}
      </button>

      <hr className="my-6 border-gray-300 dark:border-gray-700" />

      <div>
        <h2 className="text-2xl font-semibold dark:text-white">Wallet / Top-up</h2>
        <p className="text-xl text-indigo-600 my-2">
          Balance: ${userData?.walletBalance?.toFixed(2) || "0.00"}
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Amount"
            className="p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
          />
          <button
            onClick={handleTopUp}
            disabled={paymentLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700 disabled:opacity-60"
          >
            {paymentLoading ? "Processing..." : "Top Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
