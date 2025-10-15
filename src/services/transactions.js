const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

/**
 * Purchase a product using wallet funds.
 * Server applies commission & credits seller.
 */
export async function purchaseProduct({ buyerId, productId }) {
  const r = await fetch(`${BACKEND_URL}/api/transactions/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ buyerId, productId })
  });
  const data = await r.json();
  if (!r.ok || !data.success) throw new Error(data.error || "Purchase failed");
  return data;
}
