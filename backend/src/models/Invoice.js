const mongoose = require('mongoose');
const { PAYMENT } = require('../constants/statuses');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientService: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientService', required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(PAYMENT), default: PAYMENT.PENDING },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

invoiceSchema.virtual('pendingAmount').get(function () { return this.totalAmount - this.paidAmount; });

module.exports = mongoose.model('Invoice', invoiceSchema);
