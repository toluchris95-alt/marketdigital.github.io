import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  storage,
  sendLoginCode,
} from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Spinner from "../components/Spinner";

const SignUp = () => {
  const navigate = useNavigate();
  const { setUserData } = useAuth();

  const [tab, setTab] = useState("email"); // email | google | phone | face
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState("Buyer");
  const [avatar, setAvatar] = useState(null);

  const [phone, setPhone] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // --- EMAIL SIGNUP ---
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      let photoURL = "";
      if (avatar) {
        const storageRef = ref(storage, `avatars/${user.uid}/${avatar.name}`);
        await uploadBytes(storageRef, avatar);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, { photoURL });
      const data = {
        uid: user.uid,
        email,
        country,
        role,
        walletBalance: 0,
        profilePictureUrl: photoURL,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", user.uid), data);
      setUserData(data);
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to create an account. " + (err.message || ""));
    }
    setLoading(false);
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: "Buyer",
          walletBalance: 0,
          profilePictureUrl: user.photoURL || "",
          country: "",
          createdAt: serverTimestamp(),
        });
      }
      setSuccess("Signed up successfully via Google!");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError("Google sign-up failed. " + err.message);
    }
    setLoading(false);
  };

  // --- PHONE SIGNUP ---
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const confirmationResult = await sendLoginCode(phone, "recaptcha-container");
      setConfirmation(confirmationResult);
      setSuccess("Verification code sent to your phone!");
    } catch (err) {
      setError("Failed to send code. " + err.message);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await confirmation.confirm(code);
      const user = result.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        phoneNumber: user.phoneNumber,
        role: "Buyer",
        walletBalance: 0,
        createdAt: serverTimestamp(),
      });
      setSuccess("Phone number verified! Redirecting...");
      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError("Invalid code. " + err.message);
    }
    setLoading(false);
  };

  // --- FACE ID SIGNUP (Placeholder) ---
  const handleFaceIDSignup = () => {
    alert(
      "Face ID / Passkey sign-up will be enabled once configured in Firebase Authentication."
    );
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Create an Account
      </h2>

      {/* Tabs */}
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

      {/* EMAIL SIGNUP */}
      {tab === "email" && (
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Country</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g., United States"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">
              Profile Picture (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
      )}

      {/* GOOGLE SIGNUP */}
      {tab === "google" && (
        <div className="text-center">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-red-400"
          >
            {loading ? "Signing up..." : "Continue with Google"}
          </button>
        </div>
      )}

      {/* PHONE SIGNUP */}
      {tab === "phone" && (
        <div>
          {!confirmation ? (
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
                {loading ? "Verifying..." : "Verify & Sign Up"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* FACE ID / PASSKEY SIGNUP */}
      {tab === "face" && (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            Face ID / Passkey signup coming soon.
          </p>
          <button
            onClick={handleFaceIDSignup}
            className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-700"
          >
            Try Face ID
          </button>
        </div>
      )}

      {loading && <Spinner label="Processing..." />}

      <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
