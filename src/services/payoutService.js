// src/services/payoutService.js
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

/**
 * Initiate a payout request (bank or crypto)
 */
export async function initiatePayout({ uid, method, amount, details }) {
  const res = await fetch(`${BACKEND_URL}/api/payouts/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, method, amount, details }),
  });
  if (!res.ok) throw new Error("Failed to create payout request");
  return res.json();
}

/**
 * Fetch seller payout history
 */
export async function getPayoutHistory(uid) {
  const res = await fetch(`${BACKEND_URL}/api/payouts/history/${uid}`);
  if (!res.ok) throw new Error("Failed to fetch payout history");
  return res.json();
}
