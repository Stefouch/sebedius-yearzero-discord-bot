const YearZeroDie = require('./die');
const { YearZeroDieTypes } = require('./dice-constants');

module.exports = class BaseDie extends YearZeroDie {
  static Type = YearZeroDieTypes.BASE;
};