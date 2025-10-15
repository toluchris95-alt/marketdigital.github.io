import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { verifyPaystackPayment } from "../utils/verifyPaystack.js";
import { verifyFlutterwavePayment } from "../utils/verifyFlutterwave.js";
import { verifyCryptoPayment } from "../utils/verifyCrypto.js";

dotenv.config();
const router = express.Router();

// ✅ Initialize payment (Flutterwave / Paystack)
router.post("/initiate", async (req, res) => {
  try {
    const { uid, amount, email, method } = req.body;
    if (!uid || !amount) return res.status(400).json({ error: "Missing parameters" });

    let response;
    if (method === "paystack") {
      response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          amount: amount * 100, // kobo
          email,
          callback_url: `https://yourdomain.com/wallet/verify`,
        },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
      );
    } else if (method === "flutterwave") {
      response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        {
          tx_ref: `${uid}_${Date.now()}`,
          amount,
          currency: "NGN",
          redirect_url: `https://yourdomain.com/wallet/verify`,
          customer: { email },
        },
        { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET}` } }
      );
    } else {
      return res.status(400).json({ error: "Unsupported payment method" });
    }

    res.json({ link: response.data.data?.authorization_url || response.data.data?.link });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// ✅ Verify payment after callback
router.get("/verify", async (req, res) => {
  try {
    const { reference, method } = req.query;
    let verified = false;
    if (method === "paystack") verified = await verifyPaystackPayment(reference);
    else if (method === "flutterwave") verified = await verifyFlutterwavePayment(reference);
    else if (method === "crypto") verified = await verifyCryptoPayment(reference);

    if (verified) {
      // TODO: Update user wallet in Firestore
      return res.json({ success: true, message: "Payment verified!" });
    }
    res.status(400).json({ success: false, message: "Verification failed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Verification error" });
  }
});

export default router;
