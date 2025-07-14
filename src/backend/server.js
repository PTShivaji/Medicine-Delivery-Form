import dotenv from "dotenv";
dotenv.config();
console.log("MONGO_URI loaded:", process.env.MONGO_URI);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import deliveriesRouter from "./routes/deliveries.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
  process.exit(1);
});

// Routes
app.use("/api/deliveries", deliveriesRouter);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Medicine Delivery API is running");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
