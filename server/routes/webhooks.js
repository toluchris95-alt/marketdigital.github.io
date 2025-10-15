import express from "express";
import { db } from "../firebaseAdmin.js";
import { verifyPaystackPayment } from "../utils/paystack.js";
import { verifyFlutterwavePayment } from "../utils/flutterwave.js";

const router = express.Router();

/** ✅ PAYSTACK WEBHOOK */
router.post("/paystack", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const event = req.body.event;
    const data = req.body.data;
    if (event !== "charge.success") return res.sendStatus(200);

    const { reference, customer, amount } = data;
    const email = customer.email;

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

    console.log("✅ Wallet credited:", email);
    res.sendStatus(200);
  } catch (err) {
    console.error("Paystack webhook error:", err.message);
    res.sendStatus(500);
  }
});

/** ✅ FLUTTERWAVE WEBHOOK */
router.post("/flutterwave", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || data.status !== "successful") return res.sendStatus(200);

    const { tx_ref, customer, amount } = data;
    const email = customer.email;

    const existingTx = await db.collection("transactions").doc(tx_ref).get();
    if (existingTx.exists) return res.status(200).json({ message: "Duplicate ignored" });

    const usersSnap = await db.collection("users").where("email", "==", email).get();
    if (usersSnap.empty) return res.status(404).json({ message: "User not found" });

    const userRef = usersSnap.docs[0].ref;
    const userData = usersSnap.docs[0].data();
    const newBalance = (userData.walletBalance || 0) + amount;

    await db.runTransaction(async (tx) => {
      tx.update(userRef, { walletBalance: newBalance });
      tx.set(db.collection("transactions").doc(tx_ref), {
        type: "deposit",
        amount,
        email,
        uid: userData.uid,
        provider: "flutterwave",
        timestamp: new Date(),
      });
    });

    console.log("✅ Wallet credited (Flutterwave):", email);
    res.sendStatus(200);
  } catch (err) {
    console.error("Flutterwave webhook error:", err.message);
    res.sendStatus(500);
  }
});

export default router;
