const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientService: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientService' },
  lastMessage: String,
  lastMessageAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
