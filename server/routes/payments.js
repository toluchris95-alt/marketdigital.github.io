import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createCryptoCharge } from "../utils/crypto.js";

dotenv.config();
const router = express.Router();

// POST /api/payments/initiate
// body: { uid, amount, email, method }
router.post("/initiate", async (req, res) => {
  try {
    const { uid, amount, email, method } = req.body;
    if (!uid || !amount || !method) {
      return res.status(400).json({ error: "Missing uid, amount, or method" });
    }

    if (method === "paystack") {
      // ...existing Paystack code unchanged...
    }

    if (method === "flutterwave") {
      // ...existing Flutterwave code unchanged...
    }

    if (method === "crypto") {
      const { hosted_url, id } = await createCryptoCharge({
        uid,
        amount: Number(amount),
        currency: "USD", // You can switch to NGN or keep USD stable
        email: email || "noemail@domain.com",
      });
      return res.json({ link: hosted_url, reference: id, provider: "coinbase" });
    }

    return res.status(400).json({ error: "Unsupported method" });
  } catch (e) {
    console.error("Initiate payment error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
});

export default router;
