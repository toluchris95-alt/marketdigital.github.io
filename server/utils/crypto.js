import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const CC_API = process.env.COINBASE_COMMERCE_BASE || "https://api.commerce.coinbase.com";
const CC_KEY = process.env.COINBASE_COMMERCE_API_KEY;
const CC_WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;

/** Create a charge and return hosted_url + charge id */
export async function createCryptoCharge({ uid, amount, currency = "USD", email }) {
  const body = {
    name: "Wallet Top-up",
    description: `Top-up for user ${uid}`,
    pricing_type: "fixed_price",
    local_price: { amount: String(amount), currency }, // USD/NGN etc. (Coinbase supports many)
    metadata: { uid, email },
  };

  const { data } = await axios.post(`${CC_API}/charges`, body, {
    headers: {
      "X-CC-Api-Key": CC_KEY,
      "X-CC-Version": "2018-03-22",
      "Content-Type": "application/json",
    },
  });

  const charge = data?.data;
  return {
    id: charge?.id,
    hosted_url: charge?.hosted_url,
  };
}

/** Verify Coinbase Commerce webhook signature */
export function verifyCryptoSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !CC_WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac("sha256", CC_WEBHOOK_SECRET);
  hmac.update(rawBody, "utf8");
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(digest));
}
