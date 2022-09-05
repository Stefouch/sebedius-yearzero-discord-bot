const { Collection } = require('discord.js');

/**
 * @callback RollTableRandomFunction
 */

/**
 * A rollable table.
 * @extends {Collection}
 */
class RollTable extends Collection {
  /**
   * @param {RollTableRandomFunction} rollFn   The method used to generate a random number for the table 
   * @param {Iterable}               [entries] An Array or another iterable object whose elements are key-value pairs
   */
  constructor(rollFn, entries) {
    super(entries);

    /**
     * The method used to generate a random number for the table.
     * @type {RollTableRandomFunction}
     */
    this.rollFn = rollFn;

    this.sort();
  }

  /**
   * The lowest reference.
   * @type {number}
   * @readonly
   */
  get min() {
    return Math.min(...this.keys());
  }

  // /**
  //  * The highest reference.
  //  * @type {number}
  //  * @readonly
  //  */
  // get max() {
  //   return this.rollFn();
  // }

  set(key, value, sort = true) {
    if (typeof key === 'string') key = +key;
    if (typeof key === 'number' && !isNaN(key)) {
      super.set(key, value);
      if (sort) this.sort();
    }
    else {
      throw new TypeError(`RollTableError: Key "${key}" Not A Number!`);
    }
    return this;
  }

  /**
   * Returns a specified entry from a RollTable object.
   * If the entry is an object, then you will get a reference to that object
   *   and any change made to that object will effectively modify it inside the table.
   *
   * @param {number} reference The reference (roll value) of the entry to return from the table
   *
   * @returns {*} The entry associated with the specified roll value,
   *   or undefined if the value can't be found in the table
   *
   * @throws {TypeError} When the reference is not a number
   */
  get(reference) {
    if (typeof reference !== 'number') {
      throw new TypeError(`RollTableError: Reference "${reference}" Not A Number!`);
    }
    for (const [key] of this) {
      if (reference <= key) return super.get(key);
    }
    return undefined;
  }

  /**
   * Returns a boolean indicating whether an entry with the specified reference exists or not.
   * @param {number} reference The reference (roll value) of the entry to test for presence in the table
   * @returns {boolean} `true` if an entry with the specified reference exists in the table; otherwise `false`
   */
  has(reference) {
    return !!this.get(reference);
  }

  /**
   * Returns a random entry from the RollTable.
   * @param {RollTableRandomFunction} [rollFn] Override the default roll method
   * @returns {*}
   * @throws {EvalError} When the table is corrupted (no value found)
   */
  roll(rollFn) {
    const fn = rollFn || this.rollFn;
    if (typeof rollFn === 'undefined' || typeof rollFn !== 'function') {
      throw new TypeError('RollTableError: rollFn Is Not A Function!');
    }
    const seed = fn();
    const value = this.get(seed);
    if (typeof value === 'undefined') {
      throw new EvalError(`RollTableError: Found Nothing At "${seed}"`);
    }
    return value;
  }
}

module.exports = RollTable;
