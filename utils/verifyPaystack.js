import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function verifyPaystackPayment(reference) {
  try {
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
    );
    return res.data.data.status === "success";
  } catch (err) {
    console.error("Paystack verification error:", err.message);
    return false;
  }
}
