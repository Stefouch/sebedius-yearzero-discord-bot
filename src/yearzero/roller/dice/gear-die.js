const YearZeroDie = require('./die');
const { YearZeroDieTypes } = require('./dice-constants');

module.exports = class GearDie extends YearZeroDie {
  static Type = YearZeroDieTypes.GEAR;
};
