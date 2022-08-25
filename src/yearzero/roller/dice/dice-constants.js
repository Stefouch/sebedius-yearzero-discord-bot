/** @enum {number} */
exports.YearZeroDieTypes = {
  NONE: 0,
  BASE: 1 << 0,
  SKILL: 1 << 1,
  GEAR: 1 << 2,
  STRESS: 1 << 3,
  AMMO: 1 << 4,
  HIT: 1 << 5,
};

exports.DefaultSuccessTable = [0, 0, 0, 0, 0, 0, 1];
exports.D8ArtifactDieSuccessTable = this.DefaultSuccessTable.concat(1, 2);
exports.D10ArtifactDieSuccessTable = this.D8ArtifactDieSuccessTable.concat(2, 3);
exports.D12ArtifactDieSuccessTable = this.D10ArtifactDieSuccessTable.concat(3, 4);

exports.D6LockedValues = [1, 6];
exports.D8LockedValues = [1, 6, 7, 8];
exports.D10LockedValues = [1, 6, 7, 8, 9, 10];
exports.D12LockedValues = [1, 6, 7, 8, 9, 10, 11, 12];
