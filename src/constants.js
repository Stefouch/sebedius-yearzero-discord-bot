/** @enum {string} */
const YearZeroGames = {
  BLANK: 'generic',
  ALIEN_RPG: 'alien',
  BLADE_RUNNER: 'bladerunner',
  CORIOLIS: 'coriolis',
  FORBIDDEN_LANDS: 'fbl',
  MUTANT_YEAR_ZERO: 'myz',
  TALES_FROM_THE_LOOP: 'tales',
  TWILIGHT_2K: 'twilight2k',
  VAESEN: 'vaesen',
};

/** @enum {string} */
const YearZeroGameNames = {
  [YearZeroGames.BLANK]: 'Generic',
  [YearZeroGames.ALIEN_RPG]: 'Alien RPG',
  [YearZeroGames.BLADE_RUNNER]: 'Blade Runner RPG',
  [YearZeroGames.CORIOLIS]: 'Coriolis: The Third Horizon',
  [YearZeroGames.FORBIDDEN_LANDS]: 'Forbidden Lands',
  [YearZeroGames.MUTANT_YEAR_ZERO]: 'Mutant: Year Zero',
  [YearZeroGames.TALES_FROM_THE_LOOP]: 'Tales From the Loop',
  [YearZeroGames.TWILIGHT_2K]: 'Twilight 2000 4E',
  [YearZeroGames.VAESEN]: 'Vaesen',
};

const YearZeroGameChoices = Object.entries(YearZeroGameNames)
  .map(([code, name]) => ({ name, value: code }));

/** @enum {string} */
const YearZeroRollTables = {
  ALIEN_CRIT_DAMAGE: 'table-alien-crit-damage',
  ALIEN_CRIT_MENTAL: 'table-alien-crit-mental',
  ALIEN_CRIT_SYNTHETIC: 'table-alien-crit-synthetic',
  ALIEN_CRIT_XENO: 'table-alien-crit-xeno',
  ALIEN_PANIC: 'table-alien-panic',
  BLADERUNNER_CRIT_PIERCING: 'table-bladerunner-crit-piercing',
  BLADERUNNER_CRIT_CRUSHING: 'table-bladerunner-crit-crushing',
  BLADERUNNER_CRIT_MENTAL: 'table-bladerunner-crit-mental',
  CORIOLIS_CRIT_DAMAGE: 'table-coriolis-crit-damage',
  FBL_CRIT_SLASH: 'table-fbl-crit-slash',
  FBL_CRIT_BLUNT: 'table-fbl-crit-blunt',
  FBL_CRIT_STAB: 'table-fbl-crit-stab',
  FBL_CRIT_HORROR: 'table-fbl-crit-horror',
  MYZ_CRIT_DAMAGE: 'table-myz-crit-damage',
  T2K_CRIT_HEAD: 'table-t2k-crit-head',
  T2K_CRIT_ARMS: 'table-t2k-crit-arms',
  T2K_CRIT_TORSO: 'table-t2k-crit-torso',
  T2K_CRIT_LEGS: 'table-t2k-crit-legs',
  T2K_CRIT_MENTAL: 'table-t2k-crit-mental',
  VAESEN_CRIT_DAMAGE: 'table-vaesen-crit-damage',
  VAESEN_CRIT_MENTAL: 'table-vaesen-crit-mental',
};

module.exports = {
  YearZeroGames,
  YearZeroGameNames,
  YearZeroGameChoices,
  YearZeroRollTables,
};
