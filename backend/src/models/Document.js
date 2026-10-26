const mongoose = require('mongoose');
const { DOCUMENT } = require('../constants/statuses');

const documentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clientService: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientService' },
  type: { type: String, required: true },
  fileKey: { type: String, required: true },
  fileName: String,
  mimeType: String,
  size: Number,
  version: { type: Number, default: 1 },
  status: { type: String, enum: Object.values(DOCUMENT), default: DOCUMENT.UPLOADED },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String,
  rejectionReason: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
