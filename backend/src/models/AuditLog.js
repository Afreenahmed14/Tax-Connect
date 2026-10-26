const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. DOCUMENT_APPROVED
  entity: String,
  entityId: mongoose.Schema.Types.ObjectId,
  meta: mongoose.Schema.Types.Mixed,
  ip: String,
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
