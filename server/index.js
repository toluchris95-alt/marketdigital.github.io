import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentsRoutes from "./routes/payments.js";
import transactionsRoutes from "./routes/transactions.js";

dotenv.config();

const app = express();

// NOTE: Paystack/Flutterwave webhooks need raw-body in some cases.
// For regular JSON endpoints:
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",") ?? "*",
    credentials: true
  })
);

app.get("/", (_, res) => res.send("Digital Asset Marketplace API ✔️"));
app.use("/api/payments", paymentsRoutes);
app.use("/api/transactions", transactionsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on ${PORT}`));
