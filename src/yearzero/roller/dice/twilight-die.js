const YearZeroDie = require('./yzdie');
const { SuccessTableMap, YearZeroDieTypes } = require('./dice-constants');

module.exports = class BladeRunnerDie extends YearZeroDie {
  static SuccessTable = SuccessTableMap.TwilightRunner;
  static Type = YearZeroDieTypes.BASE;
};
