import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import paymentRoutes from "./routes/payments.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Payment API is running..."));
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
