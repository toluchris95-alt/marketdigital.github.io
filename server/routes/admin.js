import express from "express";
import { db } from "../firebaseAdmin.js";
import { sendPaystackTransfer } from "../utils/paystack.js";

const router = express.Router();

/** ✅ Get platform overview */
router.get("/overview", async (req, res) => {
  const usersSnap = await db.collection("users").get();
  const users = usersSnap.docs.map((d) => d.data());
  const metrics = (await db.collection("platform").doc("metrics").get()).data() || {};

  res.json({
    totalUsers: users.length,
    totalSellers: users.filter((u) => u.role === "Seller").length,
    revenue: metrics.revenue || 0,
    users,
  });
});

/** ✅ Ban or unban */
router.post("/ban", async (req, res) => {
  const { uid, banned } = req.body;
  await db.collection("users").doc(uid).update({ banned });
  res.json({ success: true });
});

/** ✅ Auto Payout (for sellers) */
router.post("/payouts/auto", async (req, res) => {
  const sellersSnap = await db.collection("users").where("role", "==", "Seller").get();
  const threshold = 10000; // ₦10,000
  const payouts = [];

  for (const doc of sellersSnap.docs) {
    const u = doc.data();
    if (u.walletBalance >= threshold && u.recipientCode) {
      try {
        const payout = await sendPaystackTransfer({
          recipientCode: u.recipientCode,
          amount: u.walletBalance,
          reason: "Automatic Payout",
        });
        payouts.push({ email: u.email, amount: u.walletBalance, status: "sent" });
        await doc.ref.update({ walletBalance: 0 });
      } catch (err) {
        payouts.push({ email: u.email, error: err.message });
      }
    }
  }

  res.json({ success: true, payouts });
});

export default router;
