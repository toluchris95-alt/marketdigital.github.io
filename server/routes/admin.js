// server/routes/admin.js
import express from "express";
import { db } from "../firebaseAdmin.js";
import { sendPaystackTransfer } from "../utils/paystack.js";

const router = express.Router();

/** ✅ Get platform overview */
router.get("/overview", async (req, res) => {
  try {
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
    const metricsDoc = await db.collection("platform").doc("metrics").get();
    const metrics = metricsDoc.exists ? metricsDoc.data() : {};

    res.json({
      totalUsers: users.length,
      totalSellers: users.filter((u) => u.role === "Seller").length,
      revenue: metrics.revenue || 0,
      users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ Ban or unban user */
router.post("/ban", async (req, res) => {
  try {
    const { uid, banned } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing UID" });
    await db.collection("users").doc(uid).update({ banned });
    res.json({ success: true, uid, banned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ Get all pending KYC verifications */
router.get("/kyc/pending", async (req, res) => {
  try {
    const snap = await db
      .collection("users")
      .where("kyc.verified", "==", false)
      .get();

    const pending = snap.docs.map((d) => ({
      uid: d.id,
      email: d.data().email,
      kyc: d.data().kyc,
    }));

    res.json(pending);
  } catch (err) {
    console.error("KYC fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

/** ✅ Approve or reject KYC */
router.post("/kyc/update", async (req, res) => {
  try {
    const { uid, status } = req.body;
    if (!uid || !status) return res.status(400).json({ error: "Missing UID or status" });

    const verified = status === "approved";
    await db.collection("users").doc(uid).update({
      "kyc.verified": verified,
      "kyc.status": status,
      "kyc.reviewedAt": new Date(),
    });

    // Add notification record
    await db.collection("notifications").add({
      uid,
      title: verified ? "KYC Approved ✅" : "KYC Rejected ⚠️",
      message: verified
        ? "Your KYC has been approved. You can now withdraw funds."
        : "Your KYC was rejected. Please re-upload clearer documents.",
      type: "kyc",
      read: false,
      createdAt: new Date(),
    });

    res.json({ success: true, uid, verified, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/** ✅ Auto Payout (for sellers with enough balance) */
router.post("/payouts/auto", async (req, res) => {
  try {
    const sellersSnap = await db.collection("users").where("role", "==", "Seller").get();
    const threshold = 10000; // ₦10,000 minimum payout
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

          await doc.ref.update({
            walletBalance: 0,
            lastPayoutAt: new Date(),
          });
        } catch (err) {
          payouts.push({ email: u.email, error: err.message });
        }
      }
    }

    res.json({ success: true, payouts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
