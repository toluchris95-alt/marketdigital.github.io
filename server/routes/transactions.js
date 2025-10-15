import express from "express";
import dotenv from "dotenv";
import { db } from "../firebaseAdmin.js";

dotenv.config();
const router = express.Router();

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE ?? 0.05);

/**
 * POST /api/transactions/purchase
 * body: { buyerId, productId }
 * Firestore schema assumed:
 * - users/{uid}: { walletBalance, role, email, ... }
 * - products/{productId}: { sellerId, name, price, ... }
 * - orders/{orderId}: created here
 * - platform/metrics: { revenue } (single doc for platform revenue aggregation)
 */
router.post("/purchase", async (req, res) => {
  const { buyerId, productId } = req.body;
  if (!buyerId || !productId) return res.status(400).json({ error: "Missing buyerId or productId" });

  const buyerRef = db.collection("users").doc(buyerId);
  const productRef = db.collection("products").doc(productId);
  const metricsRef = db.collection("platform").doc("metrics");

  try {
    await db.runTransaction(async (tx) => {
      const [buyerSnap, productSnap, metricsSnap] = await Promise.all([
        tx.get(buyerRef),
        tx.get(productRef),
        tx.get(metricsRef)
      ]);

      if (!buyerSnap.exists) throw new Error("Buyer not found");
      if (!productSnap.exists) throw new Error("Product not found");

      const buyer = buyerSnap.data();
      const product = productSnap.data();
      const price = Number(product.price);
      if (Number.isNaN(price) || price <= 0) throw new Error("Invalid product price");

      if (buyer.walletBalance < price) throw new Error("Insufficient wallet balance");

      const sellerId = product.sellerId;
      if (!sellerId) throw new Error("Product missing sellerId");
      if (sellerId === buyerId) throw new Error("You cannot buy your own listing");

      const sellerRef = db.collection("users").doc(sellerId);
      const sellerSnap = await tx.get(sellerRef);
      if (!sellerSnap.exists) throw new Error("Seller not found");

      // Commission
      const commission = Math.round(price * COMMISSION_RATE * 100) / 100;
      const sellerCredit = Math.round((price - commission) * 100) / 100;

      // Update wallet balances
      tx.update(buyerRef, { walletBalance: Math.round((buyer.walletBalance - price) * 100) / 100 });

      const seller = sellerSnap.data();
      tx.update(sellerRef, {
        walletBalance: Math.round(((seller.walletBalance || 0) + sellerCredit) * 100) / 100
      });

      // Update platform revenue
      const prevRevenue = metricsSnap.exists ? (metricsSnap.data().revenue || 0) : 0;
      tx.set(metricsRef, { revenue: Math.round((prevRevenue + commission) * 100) / 100 }, { merge: true });

      // Create order
      const orderRef = db.collection("orders").doc();
      tx.set(orderRef, {
        id: orderRef.id,
        productId,
        productName: product.name,
        price,
        buyerId,
        sellerId,
        commission,
        sellerCredit,
        purchaseDate: new Date()
      });
    });

    return res.json({ success: true, message: "Purchase completed" });
  } catch (e) {
    console.error("Purchase error:", e.message);
    return res.status(400).json({ success: false, error: e.message });
  }
});

export default router;
