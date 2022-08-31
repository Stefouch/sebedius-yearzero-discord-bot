const mongoose = require('mongoose');
const { YearZeroGames } = require('../../constants');
const { defaultLocale } = require('../../config');

module.exports = mongoose.model('Guild', new mongoose.Schema({
  id: String,
  prefix: { type: String, default: '!' },
  locale: { type: String, default: defaultLocale },
  game: { type: String, default: YearZeroGames.MUTANT_YEAR_ZERO },
  createTimestamp: { type: Date, default: Date.now() },
  isBanned: Boolean,
  banDate: Date,
  banReason: String,
}));
