// @ts-nocheck
const MersenneTwister = require('mersenne-twister');
const { SuccessTableMap, LockedValuesMap } = require('./dice-constants');
const { randomID } = require('../../../utils/number-utils');

/**
 * @typedef {Object} YearZeroDieOptions
 * @property {number} [faces]    The number of faces of the roll
 * @property {number} [maxPush]  Maximum number of times the die can be pushed
 * @property {string} [operator] Arithmetic operator applied by the die
 */

/**
 * Generic Year Zero Die
 */
class YearZeroDie {

  /* ------------------------------------------ */
  /*  Abstract Properties                       */
  /* ------------------------------------------ */

  /**
   * List of values that can't be pushed.
   * @type {number[]}
   * @memberof YearZeroDie
   * @abstract
   */
  static LockedValues = LockedValuesMap.Default;

  /**
   * Table of successes.
   * @type {number[]}
   * @memberof YearZeroDie
   * @abstract
   */
  static SuccessTable = SuccessTableMap.Default;

  /**
   * The type of this die.
   * @type {YearZeroDieTypes}
   * @memberof YearZeroDie
   * @abstract
   */
  static Type = 0;

  /* ------------------------------------------ */
  /*  Constructor                               */
  /* ------------------------------------------ */

  /**
   * @param {YearZeroDieOptions} [options] Options for constructing a Year Zero die
   */
  constructor(options) {

    /**
     * ID of the die.
     * @type {string}
     * @readonly
     */
    Object.defineProperty(this, 'id', {
      value: randomID(),
      enumerable: true,
    });

    /**
     * Number of faces.
     * @type {number}
     */
    this.faces = options.faces || 6;

    /**
     * Maximum number of times the die can be pushed.
     * @type {number}
     */
    this.maxPush = options.maxPush ?? 1;

    /**
     * Arithmetic operator applied by the die.
     * @type {string}
     */
    this.operator = options.operator ?? '+';

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
   * The type of the die.
   * @type {YearZeroDieTypes}
   * @readonly
   */
  get type() {
    return this.constructor.Type;
  }

  /**
   * The current result of the die.
   * @type {number}
   * @readonly
   */
  get result() {
    return this.results.at(-1);
  }

  /**
   * The quantity of successes of the die.
   * @type {number}
   * @readonly
   */
  get value() {
    const n = this.constructor.SuccessTable[this.result];
    if (typeof n === 'undefined') return this.constructor.SuccessTable.at(-1);
    return n;
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

  /**
   * Checks if the die has the corresponding type.
   * @param {YearZeroDieTypes} type 
   * @returns {boolean}
   */
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
   * Generates a random number between two values (inclusive)
   * with {@link MersenneTwister} algorithm.
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
