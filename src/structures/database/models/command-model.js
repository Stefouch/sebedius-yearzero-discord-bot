const mongoose = require('mongoose');

module.exports = mongoose.model('Command', new mongoose.Schema({
  name: String,
  count: { type: Number, default: 0 },
  lastUseTimestamp: Date,
}));
