const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type: { type: String, required: true },
  filters: mongoose.Schema.Types.Mixed,
  period: { from: Date, to: Date },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  outputKey: String,
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
