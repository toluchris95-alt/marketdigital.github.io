import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

export default function KYCVerification() {
  const { currentUser } = useAuth();
  const [nin, setNin] = useState("");
  const [idFile, setIdFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKYC = async (e) => {
    e.preventDefault();
    if (!nin || !idFile) return setErr("All fields required.");
    setErr(""); setMsg("");
    setLoading(true);
    try {
      const path = `kyc/${currentUser.uid}/${idFile.name}`;
      const sRef = ref(storage, path);
      await uploadBytes(sRef, idFile);
      const url = await getDownloadURL(sRef);

      await updateDoc(doc(db, "users", currentUser.uid), {
        kyc: { nin, idUrl: url, verified: false, submittedAt: new Date() },
      });

      setMsg("KYC submitted successfully. Await verification.");
    } catch (e) {
      setErr("Failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold dark:text-white">KYC Verification</h2>
      {msg && <p className="bg-green-100 text-green-700 p-3 rounded">{msg}</p>}
      {err && <p className="bg-red-100 text-red-700 p-3 rounded">{err}</p>}
      <form onSubmit={handleKYC} className="space-y-4 mt-4">
        <input
          type="text"
          placeholder="NIN / BVN / Passport Number"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setIdFile(e.target.files[0])}
          className="w-full"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
}
