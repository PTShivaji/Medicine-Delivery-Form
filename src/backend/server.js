import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import deliveriesRouter from './routes/delivery.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/deliveries', deliveriesRouter);

// Connected to MongoDB
mongoose.connect('mongodb://localhost:27017/medicineDelivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(5000, () => {
    console.log('🚀 Server is running at http://localhost:5000');
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});
