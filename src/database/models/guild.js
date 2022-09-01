const mongoose = require('mongoose');

module.exports = mongoose.model('Guild', new mongoose.Schema({
  id: String,
  // prefix: { type: String, default: '!' },
  locale: String,
  game: String,
  createTimestamp: { type: Date, default: Date.now() },
  deleteTimestamp: Date,
  isBanned: Boolean,
  banDate: Date,
  banReason: String,
}));
