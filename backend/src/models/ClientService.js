const mongoose = require('mongoose');

const clientServiceSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  consultant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fee: { type: Number, required: true },
  financialYear: String,
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('ClientService', clientServiceSchema);
