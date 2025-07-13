import express from 'express';
import Delivery from '../models/delivery.js'; // ✅ Must be exactly 'delivery.js'

const router = express.Router();

// POST: Create a new delivery
router.post('/', async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    const saved = await delivery.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create delivery', error: error.message });
  }
});

// GET: Get all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch deliveries', error: error.message });
  }
});

// PUT: Update a delivery by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Delivery.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true, runValidators: true } 
    );

    if (!updated) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Delivery updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update delivery', error: error.message });
  }
});

// DELETE: Delete a delivery by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Delivery.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete delivery', error: error.message });
  }
});

export default router;
