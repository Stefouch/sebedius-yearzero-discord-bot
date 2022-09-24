const mongoose = require('mongoose');

module.exports = mongoose.model('Initiative', new mongoose.Schema({
  _id: String, // _id = guildId
  cards: { type: [Number], default: [] },
}, {
  timestamps: true,
}));
