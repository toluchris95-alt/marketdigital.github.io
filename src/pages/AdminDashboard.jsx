import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export default function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!currentUser || userData?.role !== "Admin") return;
    fetch(`${BACKEND_URL}/api/admin/overview`)
      .then((res) => res.json())
      .then((data) => setOverview(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentUser, userData]);

  if (!currentUser || userData?.role !== "Admin") {
    return <p className="text-center mt-10 text-red-600">Access denied. Admins only.</p>;
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {msg && <p className="bg-green-100 text-green-700 p-3 rounded mb-4">{msg}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold">{overview?.totalUsers}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Total Sellers</h3>
          <p className="text-3xl font-bold">{overview?.totalSellers}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-gray-500">Platform Revenue</h3>
          <p className="text-3xl font-bold text-indigo-600">
            ₦{Number(overview?.revenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <button
        onClick={async () => {
          const res = await fetch(`${BACKEND_URL}/api/admin/payouts/auto`, { method: "POST" });
          const data = await res.json();
          setMsg(`Payouts sent: ${data.payouts.length}`);
        }}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Trigger Auto Payout
      </button>

      <h2 className="text-2xl mt-8 mb-4">Users</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Wallet</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {overview?.users.map((u) => (
            <tr key={u.uid} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">₦{Number(u.walletBalance || 0).toLocaleString()}</td>
              <td className="p-2">{u.banned ? "🚫 Banned" : "✅ Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
