const Dice = require('./dice');
const { randomID } = require('../../utils/number-utils');

/** @typedef {import('./dice/die')} YearZeroDie */
/** @typedef {import('./dice/dice-constants').YearZeroDieTypes} YearZeroDieTypes */

/**
 * @typedef {Object} YearZeroRollOptions
 * @property {string} name The name of the roll
 * @property {string} game The game used
 */

class YearZeroRoll {

  /* ------------------------------------------ */
  /*  Constructor                               */
  /* ------------------------------------------ */

  /**
   * @param {YearZeroRollOptions} [options] Options for building a Year Zero roll
   */
  constructor(options) {

    /**
     * The ID of the roll.
     * @type {string}
     * @readonly
     */
    Object.defineProperty(this, 'id', {
      value: randomID(6),
      enumerable: true,
    });

    /**
     * The title of the roll.
     * @type {string}
     */
    this.name = options.name;

    /**
     * The game used.
     * @type {string}
     */
    this.game = options.game;

    /**
     * Whether the roll can be pushed at will (full auto).
     * @type {boolean}
     */
    this.fullAuto = false;

    /**
     * The dice pool of the roll.
     * @type {YearZeroDie[]}
     */
    this.dice = [];
  }

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

  /**
   * The quantity of dice in the roll (the size of the dice pool).
   * @type {number}
   * @readonly
   */
  get size() {
    return this.dice.length;
  }

  // get results() {
  //   return this.dice.map(d => d.result);
  // }

  /**
   * Whether the roll is can be pushed.
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    return this.dice.reduce((b, d) => b || d.pushable, false);
  }

  /**
   * Whether the roll has been pushed.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    for (const d of this.dice) {
      if (d.pushCount > 0) return true;
    }
    return false;
  }

  /**
   * The number of times the roll was pushed.
   * @type {number}
   * @readonly
   */
  get pushCount() {
    return Math.max(...this.dice.map(d => d.pushCount));
  }

  /**
   * The maximum number of times the roll can be pushed.
   * @type {number}
   */
  get maxPush() {
    return Math.max(...this.dice.map(d => d.maxPush));
  }
  set maxPush(n) {
    this.dice.forEach(d => d.maxPush = n);
  }

  /* ------------------------------------------ */
  /*  Methods                                   */
  /* ------------------------------------------ */

  /**
   * Sets the Full Automatic Fire mode.
   * `maxPush = 10` to avoid abuses.
   * @param {boolean} [bool=true] Full Auto yes or no
   * @returns {this} This roll, with unlimited pushes
  */
  setFullAuto(bool = true) {
    this.fullAuto = bool;
    this.maxPush = bool ? 10 : 1;
    return this;
  }

  /* ------------------------------------------ */

  /**
   * Gets all the dice that have the corresponding type.
   * @param {YearZeroDieTypes} type Die type to search
   * @returns {YearZeroDie[]}
   */
  getDice(type) {
    return this.dice.filter(d => d.hasType(type));
  }

  /* ------------------------------------------ */

  /**
   * Counts how many dice have the corresponding type and value.
   * If `result` is omitted, counts all the dice of a certain type.
   * @param {YearZeroDieTypes} type The type of the die
   * @param {number} [result] The number to search
   * @returns {number} Total count
   */
  count(type, result) {
    if (typeof result !== 'undefined') {
      return this.getDice(type).filter(d => d.result === result).length;
    }
    return this.getDice(type).length;
  }

  /* ------------------------------------------ */
  /*  Dice Pool Manipulation                    */
  /* ------------------------------------------ */

  /**
   * Adds a number of dice to the roll.
   * @param {typeof import('./dice/die')} cls  The class of dice to add
   * @param {number}                   [qty=1] The quantity to add
   * @param {string}            [operator='+'] The operator of the die
   * @returns {this} This roll
   */
  addDice(cls, qty, operator = '+') {
    if (qty < 0) return this.removeDice(cls.Type, Math.abs(qty));
    for (; qty > 0; qty--) {
      const die = new cls({ operator, maxPush: this.maxPush });
      this.dice.push(die);
    }
    return this;
  }

  /* ------------------------------------------ */

  /**
   * Removes a number of dice from the roll.
   * @param {YearZeroDieTypes} type   The type of dice to remove
   * @param {number}          [qty=1] The quantity to remove
   * @returns {this} This roll
   */
  removeDice(type, qty = 1) {
    for (; qty > 0; qty--) {
      // Checks each dice and finds the last one with the specified type.
      let index = this.dice.length - 1;
      for (; index >= 0; index--) {
        if (this.dice[index].hasType(type)) break;
      }
      // If found one, removes it.
      // Index = -1 if nothing was found.
      if (index >= 0) {
        this.dice.splice(index, 1);
      }
    }
    return this;
  }
}

module.exports = YearZeroRoll;
