import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  building: { type: String, required: true },
  flat: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['OutForDelivery', 'Delivered', 'Failed'],
    default: 'OutForDelivery'
  },
  receivedBy: {
    type: String,
    enum: ['NotYetReceived', 'Security', 'Resident', 'Other'],
    default: 'NotYetReceived'
  },
  deliveryDate: { type: Date, required: true },
  deliveryTime: { type: String, required: true },
  deliveryPerson: { type: String, default: 'Pending' }
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;
