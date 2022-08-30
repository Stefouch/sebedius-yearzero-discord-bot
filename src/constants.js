/** @enum {string} */
const YearZeroGames = {
  BLANK: 'generic',
  ALIEN_RPG: 'alien',
  BLADE_RUNNER: 'bladerunner',
  CORIOLIS: 'coriolis',
  FORBIDDEN_LANDS: 'fbl',
  MUTANT_YEAR_ZERO: 'myz',
  TALES_FROM_THE_LOOP: 'tftl',
  TWILIGHT_2K: 't2k',
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

module.exports = {
  YearZeroGames,
  YearZeroGameNames,
};
