const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  id: String,
  prefix: { type: String, default: '!' },
  locale: { type: String, default: 'en' },
  game: { type: String, default: 'myz' },
});

module.exports = mongoose.model('Guild', guildSchema);
