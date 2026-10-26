const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  pan: { type: String, uppercase: true },
  gstin: { type: String, uppercase: true },
  businessName: String,
  businessType: String,
  address: String,
  financialYear: String,
  assignedConsultant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
