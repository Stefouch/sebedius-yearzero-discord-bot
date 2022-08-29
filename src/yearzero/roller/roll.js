const Dice = require('./dice');
const { YearZeroGames } = require('../../constants/constants');
const { YearZeroDieTypes, BanableTypesBitField } = require('./dice/dice-constants');
const { randomID } = require('../../utils/number-utils');

/** @typedef {import('./dice/die')} YearZeroDie */

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
   * The ID of the roll.
   * @type {string}
   * @readonly
   */
  id;

  /**
   * Whether the roll can be pushed at will (full auto).
   * To modify this property, you should use {@link setFullAuto()}.
   * @type {boolean}
   */
  #fullAuto = false;

  /**
   * @param {YearZeroRollOptions} [options] Options for building a Year Zero roll
   */
  constructor(options) {

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

  /* ------------------------------------------ */

  /**
   * An array with all the rolled results.
   * @type {number[]}
   * @readonly
   */
  get results() {
    return this.dice.map(d => {
      if (d.evaluated) return d.result;
    });
  }

  /**
   * The quantity of successes.
   * @type {number}
   * @readonly
   */
  get successCount() {
    return this.dice.reduce((s, d) => {
      if (!d.hasType(YearZeroDieTypes.AMMO)) s += d.value;
      return s;
    }, 0);
  }

  /**
	 * The quantity of ones (banes).
	 * @type {number}
	 * @readonly
	 */
  get baneCount() {
    let count = 0;
    for (const d of this.dice) {
      if (d.result === 1) {
        const isBanable = (BanableTypesBitField & d.type) === d.type;
        if (isBanable) count++;
      }
    }
    return count;
  }

  /**
   * The quantity of traumas ("1" on base dice).
   * @type {number}
   * @readonly
   */
  get attributeTrauma() {
    return this.pushed ? this.countDice(YearZeroDieTypes.BASE, 1) : 0;
  }

  /**
   * The quantity of gear damage ("1" on gear dice).
   * @type {number}
   * @readonly
   */
  get gearDamage() {
    return this.pushed ? this.countDice(YearZeroDieTypes.GEAR, 1) : 0;
  }

  /**
   * The quantity of stress dice.
   * @type {number}
   * @readonly
   */
  get stress() {
    return this.countDice(YearZeroDieTypes.STRESS);
  }

  /**
   * The quantity of panics ("1" on stress dice).
   * @type {number}
   * @readonly
   */
  get panic() {
    return this.countDice(YearZeroDieTypes.STRESS, 1);
  }

  /**
   * The Rate of Fire (number of Ammo dice - *Twilight 2000*).
   * @type {number}
   * @readonly
   */
  get rof() {
    return this.countDice(YearZeroDieTypes.AMMO);
  }


  /**
   * The quantity of ones (banes) on base dice and ammo dice.
   * @type {number}
   * @readonly
   */
  get jamCount() {
    return this.attributeTrauma + this.countDice(YearZeroDieTypes.AMMO, 1);
  }

  /**
   * Whether the roll caused a weapon jam.
   * @type {boolean}
   * @readonly
   */
  get jammed() {
    if (!this.pushed) return false;
    return this.jamCount >= 2;
  }

  /**
   * Whether the roll is a mishap (double 1's).
   * @type {boolean}
   * @readonly
   */
  get mishap() {
    if (this.game !== 't2k') return false;
    return this.baneCount >= 2 || this.baneCount >= this.dice.length;
  }

  /**
   * Whether the roll has negative dice.
   * @type {boolean}
   * @readonly
   */
  get hasNegative() {
    return this.hasDice(YearZeroDieTypes.NEG);
  }

  /* ------------------------------------------ */

  /**
   * Whether the roll is can be pushed.
   * @type {boolean}
   * @readonly
   */
  get pushable() {
    return this.dice.some(d => d.pushable);
  }

  /**
   * Whether the roll has been pushed.
   * @type {boolean}
   * @readonly
   */
  get pushed() {
    return this.dice.some(d => d.pushCount > 0);
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
    if (this.dice.length === 0) return 1;
    return Math.max(...this.dice.map(d => d.maxPush));
  }
  set maxPush(n) {
    this.dice.forEach(d => d.maxPush = n);
  }

  /* ------------------------------------------ */

  /**
   * Whether all the dice in the roll were evaluated/rolled.
   * @type {boolean}
   * @readonly
   */
  get rolled() {
    return this.dice.some(d => d.evaluated);
  }

  /* ------------------------------------------ */
  /*  Filter Methods                            */
  /* ------------------------------------------ */

  /**
   * Retrieves a die by its ID.
   * @param {string} id
   * @returns {YearZeroDie|undefined}
   */
  getDie(id) {
    return this.dice.find(d => d.id === id);
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
   * Tells if the roll contains some dice with the corresponding type.
   * @param {YearZeroDieTypes} type Die type to search
   * @returns {boolean}
   */
  hasDice(type) {
    return this.getDice(type).length > 0;
  }

  /* ------------------------------------------ */

  /**
   * Counts how many dice have the corresponding type and value.
   * If `result` is omitted, counts all the dice of a certain type.
   * @param {YearZeroDieTypes} type    The type of the die
   * @param {number}          [result] The number to search
   * @returns {number} Total count
   */
  countDice(type, result) {
    if (typeof result === 'undefined') {
      return this.getDice(type).length;
    }
    return this.getDice(type).filter(d => d.result === result).length;
  }

  /* ------------------------------------------ */
  /*  Dice Pool Manipulation Methods            */
  /* ------------------------------------------ */

  /**
   * Adds a number of dice to the roll.
   * @param {typeof import('./dice/die')} cls  The class of dice to add
   * @param {number}                   [qty=1] The quantity to add
   * @param {import('./dice/die').YearZeroDieOptions} options Additional options
   *   for constructing the die.
   * @returns {this} This roll
   */
  addDice(cls, qty = 1, options = {}) {
    if (qty < 0) return this.removeDice(cls.Type, Math.abs(qty));
    for (; qty > 0; qty--) {
      if (typeof options.maxPush === 'undefined') options.maxPush = this.maxPush;
      const die = new cls(options);
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

  /* ------------------------------------------ */

  /**
   * Adds a number of base dice to the roll.
   * @param {number} [qty=1] The quantity to add
   * @returns {this} This roll
   */
  addBaseDice(qty = 1) {
    return this.addDice(Dice.BaseDie, qty);
  }

  /* ------------------------------------------ */

  /**
   * Adds a number of skill dice to the roll.
   * @param {number} [qty=1] The quantity to add
   * @returns {this} This roll
   */
  addSkillDice(qty = 1) {
    return this.addDice(Dice.SkillDie, qty);
  }

  /* ------------------------------------------ */

  /**
   * Adds a number of gear dice to the roll.
   * @param {number} [qty=1] The quantity to add
   * @returns {this} This roll
   */
  addGearDice(qty = 1) {
    return this.addDice(Dice.GearDie, qty);
  }

  /* ------------------------------------------ */

  /**
   * Adds a number of negative dice to the roll.
   * @param {number} [qty=1] The quantity to add
   * @returns {this} This roll
   */
  addNegDice(qty = 1) {
    return this.addDice(Dice.NegDie, qty);
  }

  /* ------------------------------------------ */

  /**
   * Adds a number of stress dice to the roll.
   * @param {number} [qty=1] The quantity to add
   * @returns {this} This roll
   */
  addStressDice(qty = 1) {
    return this.addDice(Dice.StressDie, qty);
  }

  /* ------------------------------------------ */

  /**
   * Applies a difficulty modifier to the roll.
   * @param {number} mod Difficulty modifier (bonus or malus)
   * @returns {this} This roll, modified
   */
  modify(mod) {
    if (!mod) return this;

    // === TWILIGHT 2000
    if (this.game === YearZeroGames.TWILIGHT_2K) {
      // complicated
    }
    // === BLADE RUNNER
    else if (this.game === YearZeroGames.BLADE_RUNNER) {
      const lowestDie = this.dice.reduce((acc, d) => acc?.faces < d.faces ? acc : d, { id: 0, faces: 6 });
      // Advantage: adds a new die.
      if (mod > 0) {
        this.addDice(Dice.BladeRunnerDie, 1, { faces: lowestDie.faces });
      }
      // Disadvantage: removes the lowest die.
      else {
        this.dice = this.dice.filter(d => d.id !== lowestDie.id);
      }
    }
    // === MUTANT YEAR ZERO & FORBIDDEN LANDS
    else if ([YearZeroGames.MUTANT_YEAR_ZERO, YearZeroGames.FORBIDDEN_LANDS].includes(this.game)) {
      const skillDiceQty = this.countDice(YearZeroDieTypes.SKILL);
      const negDiceQty = Math.max(-mod - skillDiceQty);
      // Note: A negative modifier actually removes that many dice from the roll with this function.
      this.addSkillDice(mod);
      if (negDiceQty > 0) this.addNegDice(negDiceQty);
    }
    // === ALL OTHER GAMES
    else {
      // Note: A negative modifier actually removes that many dice from the roll with this function.
      this.addSkillDice(mod);
    }
    return this;
  }

  /* ------------------------------------------ */
  /*  Roll Methods                              */
  /* ------------------------------------------ */

  async roll() {
    if (this.rolled) throw new Error('Roll Is Already Evaluated!');
    for (const d of this.dice) d.roll();
    return this;
  }

  async push() {
    if (!this.pushable) return this;
    for (const d of this.dice) d.push();
    return this;
  }

  /* ------------------------------------------ */
  /*  Other Methods                             */
  /* ------------------------------------------ */

  /**
   * Sets the Full Automatic Fire mode.
   * `maxPush = 10` to avoid abuses.
   * @param {boolean} [bool=true] Full Auto yes or no
   * @returns {this} This roll, with unlimited pushes
  */
  setFullAuto(bool = true) {
    this.#fullAuto = bool;
    this.maxPush = bool ? 10 : 1;
    return this;
  }

  /* ------------------------------------------ */
}

module.exports = YearZeroRoll;
