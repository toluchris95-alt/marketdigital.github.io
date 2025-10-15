// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import paymentsRoutes from "./routes/payments.js";
import transactionsRoutes from "./routes/transactions.js";
import adminRoutes from "./routes/admin.js";   // ✅ add this line

dotenv.config();

const app = express();

// --- Body parsers ---
app.use(express.json());

// --- CORS config ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",") ?? "*",
    credentials: true,
  })
);

// --- Root check ---
app.get("/", (_, res) => res.send("Digital Asset Marketplace API ✔️"));

// --- ROUTES ---
app.use("/api/payments", paymentsRoutes);       // existing
app.use("/api/transactions", transactionsRoutes); // existing
app.use("/api/admin", adminRoutes);             // ✅ new (add admin panel backend)

// --- Server listen ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
