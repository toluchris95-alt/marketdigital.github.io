const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

export async function initiateTopUp({ uid, amount, email, method }) {
  const r = await fetch(`${BACKEND_URL}/api/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, amount, email, method })
  });
  if (!r.ok) throw new Error("Failed to initiate payment");
  return r.json(); // { link, reference }
}
