import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, googleProvider, db, getRecaptchaVerifier } from "../services/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Spinner from "../components/Spinner";

const Login = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState("email"); // email | google | phone | face
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // --- EMAIL LOGIN ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError("Invalid credentials. Please check your email or password.");
    }
    setLoading(false);
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          profilePictureUrl: user.photoURL || "",
          walletBalance: 0,
          role: "Buyer",
          createdAt: serverTimestamp(),
        });
      }
      setSuccess("Welcome back!");
      setTimeout(() => navigate("/profile"), 800);
    } catch (err) {
      console.error(err);
      setError("Google login failed. " + err.message);
    }
    setLoading(false);
  };

  // --- PHONE LOGIN ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const verifier = getRecaptchaVerifier("recaptcha-container");
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(confirmation);
      setSuccess("Code sent to your phone!");
    } catch (err) {
      console.error(err);
      setError("Failed to send verification code. " + err.message);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          walletBalance: 0,
          role: "Buyer",
          createdAt: serverTimestamp(),
        });
      }
      setSuccess("Login successful!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      console.error(err);
      setError("Invalid verification code. " + err.message);
    }
    setLoading(false);
  };

  // --- FACE ID (Placeholder) ---
  const handleFaceIDLogin = () => {
    alert("Face ID / Passkey login will be added once enabled in Firebase Authentication.");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Log In
      </h2>

      {/* Tab Buttons */}
      <div className="flex justify-center mb-6 space-x-2">
        {["email", "google", "phone", "face"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {t === "email" && "Email"}
            {t === "google" && "Google"}
            {t === "phone" && "Phone"}
            {t === "face" && "Face ID"}
          </button>
        ))}
      </div>

      {/* Error + Success */}
      {error && (
        <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
          {success}
        </p>
      )}

      {/* EMAIL LOGIN */}
      {tab === "email" && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>
      )}

      {/* GOOGLE LOGIN */}
      {tab === "google" && (
        <div className="text-center">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-red-400"
          >
            {loading ? "Connecting..." : "Continue with Google"}
          </button>
        </div>
      )}

      {/* PHONE LOGIN */}
      {tab === "phone" && (
        <div>
          {!confirmationResult ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300">
                  Phone Number (with + country code)
                </label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+15551234567"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loading ? "Sending Code..." : "Send Code"}
              </button>
              <div id="recaptcha-container" />
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {loading ? "Verifying..." : "Verify & Log In"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* FACE ID / PASSKEY LOGIN */}
      {tab === "face" && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Face ID / Passkey login coming soon.
          </p>
          <button
            onClick={handleFaceIDLogin}
            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700"
          >
            Try Face ID
          </button>
        </div>
      )}

      {loading && <Spinner label="Authenticating..." />}

      <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-indigo-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default Login;
