// src/pages/AdminKYCPanel.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export default function AdminKYCPanel() {
  const { currentUser, userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all pending KYCs
  useEffect(() => {
    if (!currentUser || userData?.role !== "Admin") return;
    const fetchPendingKYC = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/kyc/pending`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error loading KYCs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingKYC();
  }, [currentUser, userData]);

  const handleKycUpdate = async (uid, status) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/kyc/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, status }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ KYC for ${uid} marked as ${status}.`);
        setUsers((prev) => prev.filter((u) => u.uid !== uid));
      } else {
        setMsg("❌ Failed to update KYC.");
      }
    } catch (err) {
      console.error(err);
      setMsg("❌ Error updating KYC: " + err.message);
    }
  };

  if (userData?.role !== "Admin")
    return <p className="text-center text-red-500 mt-8">Admins only.</p>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-4 dark:text-white">KYC Verification Panel</h2>
      {msg && <p className="mb-4 bg-green-100 text-green-700 p-3 rounded">{msg}</p>}

      {loading ? (
        <p className="text-gray-500">Loading pending verifications...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400">No pending KYC verifications.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">NIN / ID</th>
              <th className="p-2 text-left">Document</th>
              <th className="p-2 text-left">Confidence</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-t dark:border-gray-700">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.kyc?.nin}</td>
                <td className="p-2">
                  <a
                    href={u.kyc?.idUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline"
                  >
                    View
                  </a>
                </td>
                <td className="p-2 text-sm text-gray-500">
                  {(u.kyc?.confidence * 100 || 0).toFixed(0)}%
                </td>
                <td className="p-2 text-center space-x-2">
                  <button
                    onClick={() => handleKycUpdate(u.uid, "approved")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleKycUpdate(u.uid, "rejected")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
