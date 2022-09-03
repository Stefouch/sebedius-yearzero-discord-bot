const SkillDie = require('./skill-die');
const { LockedValuesMap, SuccessTableMap, YearZeroDieTypes } = require('./dice-constants');

module.exports = class ArtifactDie extends SkillDie {
  static LockedValues = LockedValuesMap.Artifact;
  static SuccessTable = SuccessTableMap.FBLArtifact;
  static Type = YearZeroDieTypes.ARTO;
};
