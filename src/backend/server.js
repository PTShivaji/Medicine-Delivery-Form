import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import deliveryRoutes from "./routes/deliveries.js"; // ✅ default import

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/deliveries", deliveryRoutes);

mongoose
  .connect("mongodb://127.0.0.1:27017/medicine-delivery", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));
