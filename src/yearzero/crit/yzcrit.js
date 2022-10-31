const { getBoolean } = require('../../utils/number-utils');

/**
 * A Year Zero Critical Injury object.
 */
class YearZeroCrit {
  /**
   * @param {Object}        data Critical injury's data
   * @param {number}        data.ref
   * @param {string}        data.name
   * @param {boolean}       data.lethal
   * @param {number}        data.healMalus
   * @param {number|string} data.timeLimit
   * @param {string}        data.timeLimitUnit
   * @param {string}        data.effect
   * @param {number|string} data.healingTime
   * @param {string}        data.healingTimeBeforePermanent
   * @param {?string}       data.game
   * @param {?number[]}     data.rolledResults
   * @throws {SyntaxError} When no data was given
   */
  constructor(data) {
    if (!data) throw new SyntaxError('[YearZeroCrit] No data given to create this Crit!');

    /**
     * The reference in the Criticals table (D66).
     * @type {number}
     */
    this.ref = data.ref;

    /**
     * The name of the Critical Injury.
     * @type {string}
     */
    this.name = data.name || '[❌ERROR:Crit_Name_Not_Found]\nPlease report the error!';

    /**
     * Tells if the injury is lethal.
     * @type {boolean}
     */
    this.lethal = getBoolean(data.lethal);

    /**
     * The malus to `HEAL` skill rolls.
     * @type {number}
     */
    this.healMalus = +data.healMalus;

    /**
     * The duration before you die from the injury.
     * @see {@link YearZeroCrit.timeLimitUnit}
     * @type {number|string}
     */
    this.timeLimit = data.timeLimit;

    /**
     * The units for the timeLimit duration.
     * @see {@link YearZeroCrit.timeLimit}
     * @type {string}
     */
    this.timeLimitUnit = data.timeLimitUnit;

    /**
     * The effects of the injury.
     * @type {string}
     */
    this.effect = data.effect || '[❌ERROR:Crit_Effect_Not_Found]\nPlease report the error!';

    /**
     * Healing time for the injury.
     * @type {number|string}
     */
    this.healingTime = data.healingTime;

    /**
     * Healing time before the injury becomes permanent.
     * See in the following games:
     * - Blade Runner
     * @type {string}
     */
    this.healingTimeBeforePermanent = data.healingTimeBeforePermanent;

    /* ------------------------------------------ */

    /**
     * The game used for the Critical Injury.
     * @type {string}
     */
    this.game = data.game;

    /**
     * The rolled results for drawing the Critical Injury.
     * @type {number[]}
     */
    this.rolledResults = data.rolledResults || [];
  }

  /* ------------------------------------------ */

  /**
   * Whether the Critical Injury is fatal (instant death).
   * @type {boolean}
   * @readonly
   */
  get fatal() {
    return this.lethal && this.timeLimit === 0;
  }
}

module.exports = YearZeroCrit;
