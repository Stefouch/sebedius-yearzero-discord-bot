const MersenneTwister = require('mersenne-twister');
const { YearZeroDieTypes, DefaultSuccessTable, D6LockedValues } = require('./dice-constants');
const { randomID } = require('../../../utils/number-utils');

/**
 * Builder data for constructing a Year Zero die.
 * @typedef {Object} YearZeroDieData
 * @property {number} faces
 * @property {number} maxPush
 * @property {number} type
 */

/**
 * Generic Year Zero Die
 */
class YearZeroDie {

  /**
   * Table of successes.
   * @type {number[]}
   * @memberof YearZeroDie
   * @abstract
   */
  static SuccessTable = DefaultSuccessTable;

  /**
   * List of values that can't be pushed.
   * @type {number[]}
   * @memberof YearZeroDie
   * @abstract
   */
  static LockedValues = D6LockedValues;

  /**
   * @param {YearZeroDieData} data
   */
  constructor(data) {
    /**
     * ID of the die.
     * @type {string}
     */
    this.id = randomID();

    /**
     * Number of faces.
     * @type {number}
     */
    this.faces = data.faces || 6;

    /**
     * Maximum number of times the die can be pushed.
     * @type {number}
     */
    this.maxPush = data.maxPush || 0;

    /**
     * Type of the die.
     * @type {number}
     * @memberof YearZeroDieTypes
     */
    this.type = data.type ?? YearZeroDieTypes.NONE;

    /**
     * List of results rolled with this die.
     * @type {number[]}
     */
    this.results = [];

    /**
     * Whether the die has been rolled.
     * @type {boolean}
     */
    this.evaluated = false;

    /**
     * Number of times the die has been pushed.
     * @type {number}
     */
    this.pushCount = 0;
  }

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

  /**
   * The current result of the die.
   * @type {number}
   * @readonly
   */
  get result() {
    return this.results.at(-1);
  }

  /**
   * Whether the die can be pushed.
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    if (this.pushCount >= this.maxPush) return false;
    if (this.constructor.LockedValues.includes(this.result)) return false;
    return true;
  }

  /* ------------------------------------------ */
  /*  Methods                                   */
  /* ------------------------------------------ */

  hasType(type) {
    if (!type) return false;
    return (this.type & type) === type;
  }

  /* ------------------------------------------ */

  /**
   * Rolls the die and return its result.
   * @returns {number}
   */
  roll() {
    if (this.evaluated) throw new Error('Die Is Already Evaluated!');

    const result = this.constructor.rng(1, this.faces);

    this.results.push(result);
    this.evaluated = true;

    return result;
  }

  /* ------------------------------------------ */

  /**
   * Pushes the die (re-rolls it) and return its new result.
   * @returns {number}
   */
  push() {
    if (!this.pushable) return this.result;
    this.evaluated = false;
    this.pushCount++;
    return this.roll();
  }

  /* ------------------------------------------ */
  /*  Static Methods                            */
  /* ------------------------------------------ */

  /**
   * Generates a random number between two values (inclusive).
   * @see {@link MersenneTwister}
   * @param {number} min Minimum value (inclusive)
   * @param {number} max Maximum value (inclusive)
   * @returns {number}
   */
  static rng(min, max) {
    const generator = new MersenneTwister();
    const seed = generator.random();
    return Math.floor(seed * (max - min + 1) + min);
  }

  /* ------------------------------------------ */

  toString() { return `D${this.faces} ${this.evaluated ? `(${this.result})` : ''}`; }
  valueOf() { return this.result; }
}

module.exports = YearZeroDie;
