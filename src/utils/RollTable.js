const { rand, hasSameDigits, convertToBijective } = require('./number-utils');
const Logger = require('./logger');

/**
 * @callback RandFunction
 * @return {number}
 */

/**
 * A rollable table.
 * @extends {Map}
 */
class RollTable extends Map {
  /**
   * @param {string} name The name of the table
   * @param {string|RandFunction} roller The method used to generate a random number for the table 
   * @param {Iterable} [entries] An Array or another iterable object whose elements are key-value pairs
   */
  constructor(name, roller, entries) {
    super(entries);

    /**
     * The name of the table.
     * @type {string}
     */
    this.name = name;

    /**
     * The method used to generate a random number for the table.
     * @type {RandFunction}
     */
    this.rollFn;

    /**
     * @type {string}
     */
    this.roller;

    if (typeof roller === 'function') this.rollFn = roller;
    else if (typeof roller === 'string') {
      this.roller = roller;
      // @ts-ignore
      this.rollFn = this.constructor.createRandFn(roller);
    }

    this.sort();
  }

  /* ------------------------------------------ */
  /*  Properties                                */
  /* ------------------------------------------ */

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

  /* ------------------------------------------ */
  /*  Map Methods                               */
  /* ------------------------------------------ */

  /**
   * Sets an entry in the table at a defined index.
   * @param {number}   key        The numbered index for the table value
   * @param {any}      value      The value to return at this index
   * @param {boolean} [sort=true] Whether to sort the table after setting this entry
   * @returns {this}
   */
  set(key, value, sort = true) {
    if (typeof key === 'string') key = +key;
    if (typeof key === 'number' && !isNaN(key)) {
      super.set(key, value);
      if (sort) this.sort();
    }
    else {
      throw new TypeError(`RollTableError[${this.name}]: Key "${key}" Not A Number!`);
    }
    return this;
  }

  /* ------------------------------------------ */

  /**
   * Returns a specified entry from a RollTable object.
   * If the entry is an object, then you will get a reference to that object
   *   and any change made to that object will effectively modify it inside the table.
   *
   * @param {number} reference The reference (roll value) of the entry to return from the table
   * @param {boolean} log Whether to log the roll result
   *
   * @returns {*} The entry associated with the specified roll value,
   *   or undefined if the value can't be found in the table
   *
   * @throws {TypeError} When the reference is not a number
   */
  get(reference, log = false) {
    if (typeof reference !== 'number') {
      throw new TypeError(`RollTableError[${this.name}]: Reference "${reference}" Not A Number!`);
    }
    for (const [key] of this) {
      if (reference <= key) {
        const value = super.get(key);
        if (log) Logger.roll(`table:${this.name} → ${reference} → ${JSON.stringify(value)}`);
        return value;
      }
    }
    return undefined;
  }

  /* ------------------------------------------ */

  /**
   * Returns a boolean indicating whether an entry with the specified reference exists or not.
   * @param {number} reference The reference (roll value) of the entry to test for presence in the table
   * @returns {boolean} `true` if an entry with the specified reference exists in the table; otherwise `false`
   */
  has(reference) {
    return !!this.get(reference);
  }

  /* ------------------------------------------ */

  sort() {
    const entries = [...this.entries()];
    entries.sort((a, b) => a[1] - b[1]);

    // Perform clean-up
    super.clear();

    // Set the new entries
    for (const [k, v] of entries) {
      super.set(k, v);
    }
    return this;
  }

  /* ------------------------------------------ */

  /**
   * Returns a random entry from the RollTable.
   * @param {RandFunction} [rollFn] Override the default roll method
   * @returns {*}
   * @throws {EvalError} When the table is corrupted (no value found)
   */
  roll(rollFn) {
    const fn = rollFn || this.rollFn;
    if (typeof rollFn === 'undefined' || typeof rollFn !== 'function') {
      throw new TypeError('RollTableError[${this.name}]: rollFn Is Not A Function!');
    }
    const seed = fn();
    const value = this.get(seed);
    if (typeof value === 'undefined') {
      throw new EvalError(`RollTableError[${this.name}]: Found Nothing At "${seed}"`);
    }
    return value;
  }

  /* ------------------------------------------ */
  /*  Static Methods                            */
  /* ------------------------------------------ */

  /**
   * Parses a roll string into a random number generation function
   * @param {string} roller Roll string to parse
   * @returns {RandFunction}
   */
  static createRandFn(roller) {
    if (!roller) return null;
    const regex = /^(\d*)[dD](\d+)([+-]\d+)?$/g;
    const exec = regex.exec(roller);
    const qty = +exec[1] || 1;
    const max = +exec[2];
    const mod = +exec[3] || 0;

    /** @type {RandFunction} */
    let fn;

    if (hasSameDigits(max)) {
      // Gets the actual Base. D66 = 6; D88 = 8;
      const digit = max % 10;
      // Creates sequence for the Base <digit>
      const seq = Array(digit).fill().map((x, n) => n + 1).join('');

      fn = () => {
        let result = 0;
        for (let i = 0; i < qty; i++) {
          let seed = rand(1, max);
          // Adjusts the seed.
          let log = Math.floor(Math.log10(max));
          for (; log > 0; log--) seed += digit ** log;
          // Converts the seed into a valid reference.
          result += +convertToBijective(seed, seq);
        }
        return result + mod;
      };
    }
    else if (max > 0) {
      fn = () => {
        let result = 0;
        for (let i = 0; i < qty; i++) result += rand(1, max);
        return result + mod;
      };
    }
    else {
      throw new EvalError(`RollTableError[${this.name}]: Impossible To Eval "${roller}"`);
    }
    return fn;
  }
}

module.exports = RollTable;
