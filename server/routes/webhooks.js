import express from "express";
import { db } from "../firebaseAdmin.js";
import { verifyPaystackPayment } from "../utils/paystack.js";
import { verifyFlutterwavePayment } from "../utils/flutterwave.js";
import { verifyCryptoSignature } from "../utils/crypto.js";

const router = express.Router();

/** ✅ PAYSTACK WEBHOOK (JSON) */
router.post("/paystack", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const event = req.body.event;
    if (event !== "charge.success") return res.sendStatus(200);

    const data = req.body.data;
    const { reference, customer, amount } = data;
    const email = customer?.email;

    const existingTx = await db.collection("transactions").doc(reference).get();
    if (existingTx.exists) return res.status(200).json({ message: "Duplicate ignored" });

    const usersSnap = await db.collection("users").where("email", "==", email).get();
    if (usersSnap.empty) return res.status(404).json({ message: "User not found" });

    const userRef = usersSnap.docs[0].ref;
    const userData = usersSnap.docs[0].data();
    const newBalance = (userData.walletBalance || 0) + amount / 100;

    await db.runTransaction(async (tx) => {
      tx.update(userRef, { walletBalance: newBalance });
      tx.set(db.collection("transactions").doc(reference), {
        type: "deposit",
        amount: amount / 100,
        email,
        uid: userData.uid,
        provider: "paystack",
        timestamp: new Date(),
      });
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error("Paystack webhook error:", err.message);
    return res.sendStatus(500);
  }
});

/** ✅ FLUTTERWAVE WEBHOOK (JSON) */
router.post("/flutterwave", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || data.status !== "successful") return res.sendStatus(200);

    const { tx_ref, customer, amount } = data;
    const email = customer?.email;

    const existingTx = await db.collection("transactions").doc(tx_ref).get();
    if (existingTx.exists) return res.status(200).json({ message: "Duplicate ignored" });

    const usersSnap = await db.collection("users").where("email", "==", email).get();
    if (usersSnap.empty) return res.status(404).json({ message: "User not found" });

    const userRef = usersSnap.docs[0].ref;
    const userData = usersSnap.docs[0].data();
    const newBalance = (userData.walletBalance || 0) + Number(amount);

    await db.runTransaction(async (tx) => {
      tx.update(userRef, { walletBalance: newBalance });
      tx.set(db.collection("transactions").doc(tx_ref), {
        type: "deposit",
        amount: Number(amount),
        email,
        uid: userData.uid,
        provider: "flutterwave",
        timestamp: new Date(),
      });
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error("Flutterwave webhook error:", err.message);
    return res.sendStatus(500);
  }
});

/** ✅ CRYPTO WEBHOOK (Coinbase Commerce) — RAW BODY REQUIRED */
router.post(
  "/crypto",
  // raw parser ONLY for this endpoint
  express.raw({ type: "*/*" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-cc-webhook-signature"];
      const raw = req.body?.toString("utf8") || "";

      const valid = verifyCryptoSignature(raw, signature);
      if (!valid) return res.status(400).send("Invalid signature");

      const event = JSON.parse(raw);
      const type = event?.type; // e.g., 'charge:confirmed'
      const charge = event?.data;
      const reference = charge?.id;
      const meta = charge?.metadata || {};
      const amountPaid = charge?.pricing?.local?.amount || null; // local currency amount
      const email = meta?.email;

      if (type !== "charge:confirmed") return res.sendStatus(200);

      // prevent duplicates
      const txDoc = await db.collection("transactions").doc(reference).get();
      if (txDoc.exists) return res.status(200).json({ message: "Duplicate ignored" });

      // locate user
      let userRef;
      if (meta?.uid) {
        userRef = db.collection("users").doc(meta.uid);
      } else if (email) {
        const usersSnap = await db.collection("users").where("email", "==", email).get();
        if (usersSnap.empty) return res.status(404).json({ message: "User not found" });
        userRef = usersSnap.docs[0].ref;
      } else {
        return res.status(400).json({ message: "No user identity provided" });
      }

      const userSnap = await userRef.get();
      if (!userSnap.exists) return res.status(404).json({ message: "User not found" });

      const user = userSnap.data();
      const newBalance = (user.walletBalance || 0) + Number(amountPaid || 0);

      await db.runTransaction(async (tx) => {
        tx.update(userRef, { walletBalance: newBalance });
        tx.set(db.collection("transactions").doc(reference), {
          type: "deposit",
          amount: Number(amountPaid || 0),
          email: email || user.email,
          uid: user.uid,
          provider: "coinbase",
          chargeId: reference,
          timestamp: new Date(),
        });
      });

      console.log("✅ Wallet credited via Coinbase:", email || user.email, amountPaid);
      return res.sendStatus(200);
    } catch (e) {
      console.error("Crypto webhook error:", e.message);
      return res.sendStatus(500);
    }
  }
);

export default router;
