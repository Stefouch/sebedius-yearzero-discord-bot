const mongoose = require('mongoose');

module.exports = mongoose.model('Guild', new mongoose.Schema({
  _id: String,
  // prefix: { type: String, default: '!' },
  game: String,
  locale: String,
  lastActivityTimestamp: Date,
  joinTimestamp: { type: Date, default: Date.now },
  leaveTimestamp: Date,
  isBanned: Boolean,
  banDate: Date,
  banReason: String,
}));
