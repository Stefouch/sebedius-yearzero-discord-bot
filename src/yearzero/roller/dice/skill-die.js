const YearZeroDie = require('./die');
const { YearZeroDieTypes, LockedValuesMap } = require('./dice-constants');

module.exports = class SkillDie extends YearZeroDie {
  static LockedValues = LockedValuesMap.Skill;
  static Type = YearZeroDieTypes.SKILL;
};
