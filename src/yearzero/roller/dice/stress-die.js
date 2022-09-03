const YearZeroDie = require('./yzdie');
const { YearZeroDieTypes } = require('./dice-constants');

module.exports = class StressDie extends YearZeroDie {
  static Type = YearZeroDieTypes.STRESS;
};
