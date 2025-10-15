import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function verifyFlutterwavePayment(tx_ref) {
  try {
    const res = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${tx_ref}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET}` } }
    );
    return res.data.status === "success";
  } catch (err) {
    console.error("Flutterwave verification error:", err.message);
    return false;
  }
}
