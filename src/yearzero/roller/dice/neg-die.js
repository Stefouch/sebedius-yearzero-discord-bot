const SkillDie = require('./skill-die');
const { YearZeroDieTypes, SuccessTableMap } = require('./dice-constants');

module.exports = class NegativeDie extends SkillDie {
  static SuccessTable = SuccessTableMap.Negative;
  static Type = YearZeroDieTypes.NEG;
};
