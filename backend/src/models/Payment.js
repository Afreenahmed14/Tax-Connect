
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  mode: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'razorpay'],
    default: 'cash',
  },
  reference: {
    type: String,
    trim: true,
  },
  receiptNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
