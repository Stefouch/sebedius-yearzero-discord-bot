const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  id: String,
  prefix: { type: String, default: '!' },
  locale: { type: String, default: 'en' },
});

module.exports = mongoose.model('Guild', guildSchema);
