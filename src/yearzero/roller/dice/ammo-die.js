const BaseDie = require('./base-die');
const { YearZeroDieTypes } = require('./dice-constants');

module.exports = class AmmoDie extends BaseDie {
  static Type = YearZeroDieTypes.AMMO;
};
