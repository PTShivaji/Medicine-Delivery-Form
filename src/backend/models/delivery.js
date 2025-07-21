import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  building: { type: String, required: true },
  flatNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  deliveryTime: { type: Date, required: true },
  deliveryStatus: { type: String, enum: ["Out for Delivery", "Delivered", "Failed"], required: true },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid"], required: true },
});

export default mongoose.model("Delivery", deliverySchema);
