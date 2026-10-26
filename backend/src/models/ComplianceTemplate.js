const mongoose = require('mongoose');

const complianceTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. GSTR-3B
  category: String, // GST / TDS / ITR / Advance Tax
  dueDay: Number,
  dueMonth: Number,
  frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('ComplianceTemplate', complianceTemplateSchema);
