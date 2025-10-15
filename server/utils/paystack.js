import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export async function verifyPaystackPayment(reference) {
  const url = `https://api.paystack.co/transaction/verify/${reference}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  if (data.status && data.data.status === "success") {
    return {
      success: true,
      amount: data.data.amount / 100,
      email: data.data.customer.email,
      reference: data.data.reference,
    };
  }
  return { success: false };
}

export async function sendPaystackTransfer({ recipientCode, amount, reason }) {
  const url = "https://api.paystack.co/transfer";
  const body = {
    source: "balance",
    reason: reason || "Marketplace Payout",
    amount: Math.round(amount * 100),
    recipient: recipientCode,
  };
  const { data } = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return data;
}
