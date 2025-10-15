// This is a placeholder. Replace with real gateway SDK / API calls
export async function initializePayment({ uid, amount, currency }) {
  // Call your backend API to create a payment session
  // Return some payment reference / session ID
  const session = await fetch("/api/createPayment", {
    method: "POST",
    body: JSON.stringify({ uid, amount, currency }),
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.json());
  return session.id; // or session object
}

export async function verifyPayment(sessionId) {
  // Call your backend to verify payment status
  const resp = await fetch(`/api/verifyPayment?sessionId=${sessionId}`);
  const { success } = await resp.json();
  return success;
}
