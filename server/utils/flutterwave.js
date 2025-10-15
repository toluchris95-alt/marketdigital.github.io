import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET;

export async function verifyFlutterwavePayment(tx_ref) {
  const url = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  });
  if (data.status === "success" && data.data.status === "successful") {
    return {
      success: true,
      amount: data.data.amount,
      email: data.data.customer.email,
      reference: data.data.tx_ref,
    };
  }
  return { success: false };
}
