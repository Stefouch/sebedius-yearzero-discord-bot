const { getBoolean } = require('../../utils/number-utils');

/**
 * A Year Zero Critical Injury object.
 */
class YearZeroCrit {
  /**
   * @param {Object}    data Critical data
   * @param {number}    data.ref
   * @param {string}    data.name
   * @param {boolean}   data.lethal
   * @param {number}    data.healMalus
   * @param {number}    data.timeLimit
   * @param {string}    data.timeLimitUnit
   * @param {string}    data.effect
   * @param {number}    data.healingTime
   * @param {?string}   data.game
   * @param {?number[]} data.rolledResults
   * @throws {SyntaxError} If no data was given
   */
  constructor(data) {
    if (!data) throw new SyntaxError('[YearZeroCrit] No data given to create this Crit!');

    /**
     * The reference in the Criticals table (D66).
     * @type {number}
     */
    this.ref = data.ref || 0;

    /**
     * The name of the Critical Injury.
     * @type {string}
     */
    this.name = data.name || '[❌ERROR:Crit_Name_Not_Found]';

    /**
     * Tells if the injury is lethal.
     * @type {boolean}
     */
    this.lethal = getBoolean(data.lethal);

    /**
     * The malus to `HEAL` skill rolls.
     * @type {number}
     */
    this.healMalus = +data.healMalus || 0;

    /**
     * The duration before you die from the injury.
     * @see {@link YearZeroCrit.timeLimitUnit}
     * @type {number}
     */
    this.timeLimit = +data.timeLimit || 0;

    /**
     * The units for the timeLimit duration.
     * @see {@link YearZeroCrit.timeLimit}
     * @type {string}
     */
    this.timeLimitUnit = data.timeLimitUnit || null;

    /**
     * The effects of the injury.
     * @type {string}
     */
    this.effect = data.effect || '[❌ERROR:Crit_Effect_Not_Found]';

    /**
     * Healing time for the injury.
     * @type {{ value: number, text: string }}
     */
    this.healingTime = this.#prepareHealingTime(data.healingTime);

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

  /* ------------------------------------------ */

  #prepareHealingTime(healingTime) {
    const out = {};
    if (typeof healingTime === 'string') {
      out.text = healingTime;
    }
    else {
      out.value = healingTime;
    }
    return out;
  }
}

module.exports = YearZeroCrit;
