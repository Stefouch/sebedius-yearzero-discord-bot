const YearZeroDie = require('./yzdie');
const { YearZeroDieTypes, LockedValuesMap } = require('./dice-constants');

module.exports = class StressDie extends YearZeroDie {
  static LockedValues = LockedValuesMap.Skill;
  static Type = YearZeroDieTypes.STRESS;
};
