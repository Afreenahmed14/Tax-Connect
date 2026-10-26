const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  message: { type: String, required: true },
  type: { type: String, enum: ['document', 'task', 'deadline', 'payment', 'chat', 'system'], default: 'system' },
  relatedEntity: { kind: String, id: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
