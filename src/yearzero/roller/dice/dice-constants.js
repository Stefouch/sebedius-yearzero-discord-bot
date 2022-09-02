/** @enum {number} */
const YearZeroDieTypes = {
  NONE: 0,
  BASE: 1 << 0,
  SKILL: 1 << 1,
  GEAR: 1 << 2,
  NEG: 1 << 3,
  ARTO: 1 << 4,
  STRESS: 1 << 5,
  AMMO: 1 << 6,
  HIT: 1 << 7,
};

const BanableTypesBitField = YearZeroDieTypes.BASE
  + YearZeroDieTypes.GEAR
  + YearZeroDieTypes.STRESS
  + YearZeroDieTypes.AMMO;

/** @enum {number[]} */
const SuccessTableMap = {};
SuccessTableMap.Default = [0, 0, 0, 0, 0, 0, 1];
SuccessTableMap.Negative = [0, 0, 0, 0, 0, 0, -1];
SuccessTableMap.FBLArtifact = SuccessTableMap.Default.concat(1, 2, 2, 3, 3, 4);
SuccessTableMap.TwilightRunner = SuccessTableMap.Default.concat(1, 1, 1, 2, 2, 2);

/** @enum {number[]} */
const LockedValuesMap = {
  /** [1,6+] */ Default: [1, 6, 7, 8, 9, 10, 11, 12],
  /** [6+] */ Skill: [6, 7, 8, 9, 10, 11, 12],
  /** [6+] */ Artifact: [6, 7, 8, 9, 10, 11, 12],
};

module.exports = {
  BanableTypesBitField,
  LockedValuesMap,
  SuccessTableMap,
  YearZeroDieTypes,
};
