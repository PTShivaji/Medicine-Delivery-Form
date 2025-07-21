// routes/deliveries.js
import express from "express";
import Delivery from "../models/delivery.js";

const router = express.Router();

// GET all deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// POST a new delivery
router.post("/", async (req, res) => {
  try {
    const newDelivery = new Delivery(req.body);
    const savedDelivery = await newDelivery.save();
    res.status(201).json(savedDelivery);
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(400).json({ error: error.message });
  }
});

// PUT to update a delivery
router.put("/:id", async (req, res) => {
  try {
    const updated = await Delivery.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE a delivery
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.json({ message: "Delivery deleted", id: deleted._id });
  } catch (error) {
    console.error("Error deleting delivery:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
