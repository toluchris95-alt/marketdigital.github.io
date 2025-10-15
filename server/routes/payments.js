import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// POST /api/payments/initiate
// body: { uid, amount, email, method: "paystack" | "flutterwave" }
router.post("/initiate", async (req, res) => {
  try {
    const { uid, amount, email, method } = req.body;
    if (!uid || !amount || !method) {
      return res.status(400).json({ error: "Missing uid, amount, or method" });
    }

    if (method === "paystack") {
      const r = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          amount: Math.round(Number(amount) * 100),
          email,
          callback_url: `${process.env.FRONTEND_URL}/profile` // or dedicated success route
        },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET}` } }
      );
      return res.json({ link: r.data.data.authorization_url, reference: r.data.data.reference });
    }

    if (method === "flutterwave") {
      const tx_ref = `${uid}_${Date.now()}`;
      const r = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        {
          tx_ref,
          amount: Number(amount),
          currency: "NGN",
          redirect_url: `${process.env.FRONTEND_URL}/profile`,
          customer: { email: email || "noemail@domain.com" }
        },
        { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET}` } }
      );
      return res.json({ link: r.data.data.link, reference: tx_ref });
    }

    return res.status(400).json({ error: "Unsupported method" });
  } catch (e) {
    console.error("Initiate payment error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
});

export default router;
