/**
 * Firebase Functions – Notifications + Email Automation
 */
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import sgMail from "@sendgrid/mail";

initializeApp();
const db = getFirestore();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  const msg = {
    to,
    from: process.env.SENDER_EMAIL || "noreply@optionstradinguni.online",
    subject,
    text,
  };
  try {
    await sgMail.send(msg);
    console.log("📨 Email sent:", subject);
  } catch (err) {
    console.error("SendGrid error:", err.response?.body || err.message);
  }
}

/** ✅ Wallet credited */
export const onWalletCredit = functions.firestore
  .document("transactions/{txId}")
  .onCreate(async (snap, context) => {
    const tx = snap.data();
    if (tx.type !== "deposit") return null;

    const userRef = db.collection("users").doc(tx.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;

    const user = userSnap.data();

    // Add notification doc
    await db.collection("notifications").add({
      uid: tx.uid,
      title: "Wallet Credited 💸",
      message: `Your wallet has been credited with ₦${tx.amount.toLocaleString()}`,
      type: "deposit",
      createdAt: new Date(),
      read: false,
    });

    // Send email
    await sendEmail(
      user.email,
      "Wallet Credited",
      `Hi ${user.displayName || "Trader"},\n\n₦${tx.amount} was added to your wallet.\n\n— OptionsTradingUniversity`
    );

    return null;
  });

/** ✅ Payout completed */
export const onPayoutApproved = functions.firestore
  .document("payouts/{payoutId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.status === "pending" && after.status === "approved") {
      const userRef = db.collection("users").doc(after.uid);
      const userSnap = await userRef.get();
      if (!userSnap.exists) return null;
      const user = userSnap.data();

      await db.collection("notifications").add({
        uid: after.uid,
        title: "Payout Sent ✅",
        message: `Your withdrawal of ₦${after.amount.toLocaleString()} was approved.`,
        type: "payout",
        createdAt: new Date(),
        read: false,
      });

      await sendEmail(
        user.email,
        "Payout Completed",
        `Hello ${user.displayName || "Trader"},\n\nYour ₦${after.amount} payout has been sent successfully.\n\n— OptionsTradingUniversity`
      );
    }
    return null;
  });
