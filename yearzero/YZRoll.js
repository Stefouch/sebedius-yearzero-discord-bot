const { rand, isNumber, resolveString } = require('../utils/Util');
const DIE_TYPES = ['base', 'skill', 'gear', 'neg', 'arto', 'stress', 'ammo', 'modifier'];
const STUNTS = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];
const STUNTS_T2K = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2];
const ROLLREGEX = /([*/+-]?)(\d*)[dD]?(\d*)((?:\[.*\])?)/;

class YZRoll {
	/**
	 * A Year Zero Roll object.
	 * @param {?string} game The game of the roll
	 * @param {string} author The author of the roll
	 * @param {string} name The name of the roll
	 */
	constructor(game, author, name) {
		/**
		 * The author of the roll.
		 * @name YZRoll#author
		 * @type {string}
		 * @readonly
		 */
		Object.defineProperty(this, 'author', {
			value: author,
			enumerable: true,
		});

		/**
		 * The name of the roll.
		 * @type {StringResolvable}
		 */
		this.name = name ? resolveString(name) : null;

		/**
		 * The game used.
		 * @type {string}
		 */
		this.game = game || 'generic';

		/**
		 * The number of times the roll was pushed.
		 * @type {number}
		 */
		this.pushCount = 0;

		/**
		 * The maximum number of times the roll can be pushed.
		 */
		this.maxPush = 1;

		/**
		 * Tells if the roll can be pushed at will.
		 * @type {boolean}
		 */
		this.isFullAuto = false;

		/**
		 * The dice pool of the roll.
		 * @type {YZDie[]}
		 */
		this.dice = [];
	}

	/**
	 * The total number of dice in the roll.
	 * @type {number}
	 * @readonly
	 */
	get size() {
		return this.dice.length;
	}

	/**
	 * Wether the roll was pushed or not.
	 * @type {boolean}
	 * @readonly
	 */
	get pushed() {
		return this.pushCount > 0;
	}

	/**
	 * The quantity of successes.
	 * @type {number}
	 * @readonly
	 */
	get successCount() {
		let count = 0;
		const stuntTable = this.game === 't2k' ? STUNTS_T2K : STUNTS;
		for (const die of this.dice) {
			if (die.type === 'neg') {
				count -= stuntTable[die.result];
			}
			else {
				count += stuntTable[die.result];
			}
		}
		return count;
	}

	/**
	 * The quantity of ones (banes).
	 * @type {number}
	 * @readonly
	 */
	get baneCount() {
		const banableTypes = ['base', 'gear', 'stress', 'ammo'];
		return this.dice
			.filter(d => banableTypes.includes(d.type) && d.result === 1)
			.length;
	}

	/**
	 * The quantity of traumas ("1" on base dice).
	 * @type {number}
	 * @readonly
	 */
	get attributeTrauma() {
		return this.pushed ? this.count('base', 1) : 0;
	}

	/**
	 * The quantity of gear damage ("1" on gear dice).
	 * @type {number}
	 * @readonly
	 */
	get gearDamage() {
		return this.pushed ? this.count('gear', 1) : 0;
	}

	/**
	 * The quantity of stress dice.
	 * @type {number}
	 * @readonly
	 */
	get stress() {
		return this.count('stress');
	}

	/**
	 * The quantity of panic ("1" on stress dice).
	 * @type {number}
	 * @readonly
	 */
	get panic() {
		return this.count('stress', 1);
	}

	/**
	 * The Rate of Fire (number of Ammor dice - *Twilight 2000*).
	 * @type {number}
	 * @readonly
	 */
	get rof() {
		return this.count('ammo');
	}

	/**
	 * Tells if there are negative dice.
	 * @type {boolean}
	 * @readonly
	 */
	get hasNegative() {
		return this.count('neg').length > 0;
	}

	/**
	 * Tells if the roll is pushable.
	 * @type {boolean}
	 * @readonly
	 */
	get pushable() {
		return (
			this.pushCount < this.maxPush &&
			this.dice.some(d => d.pushable)
		);
	}

	/**
	 * Allowed die types.
	 * @type {string[]}
	 * @constant
	 * @readonly
	 * @static
	 */
	static get DIE_TYPES() {
		return DIE_TYPES;
	}

	/**
	 * Regex used to parse rolls.
	 * @type {RegExp}
	 * @constant
	 * @readonly
	 * @static
	 */
	static get ROLLREGEX() {
		return ROLLREGEX;
	}

	/**
	 * Sets the Full Automatic Fire mode.
	 * `maxPush = 10`.
	 * @param {?boolean} [bool=true] Full Auto yes or no
	 * @returns {YZRoll} This roll, with unlimited pushes
	 */
	setFullAuto(bool = true) {
		this.isFullAuto = bool;
		this.maxPush = 10;
		return this;
	}

	/**
	 * Sets the game played.
	 * @param {string} game The game
	 * @returns {YZRoll} This roll, with a new game parameter
	 */
	setGame(game) {
		this.game = game;
		return this;
	}

	/**
	 * Sets the name of the roll.
	 * @param {string} name The new name of the roll
	 * @returns {YZRoll} This roll, renamed
	 */
	setName(name) {
		this.name = name;
		return this;
	}

	/**
	 * Pushes the roll, following the YZ rules.
	 * @returns {YZRoll} This roll, pushed
	 */
	push() {
		if (!this.pushable) return this;
		this.dice.forEach(d => d.push());
		this.pushCount++;
		return this;
	}

	/**
	 * Adds a number of base dice to the roll.
	 * @param {number} qty The quantity to add
	 * @returns {YZRoll} This roll
	 */
	addBaseDice(qty) {
		return this.addDice('base', qty);
	}

	/**
	 * Adds a number of skill dice to the roll.
	 * @param {number} qty The quantity to add
	 * @returns {YZRoll} This roll
	 */
	addSkillDice(qty) {
		return this.addDice('skill', qty);
	}

	/**
	 * Adds a number of gear dice to the roll.
	 * @param {number} qty The quantity to add
	 * @returns {YZRoll} This roll
	 */
	addGearDice(qty) {
		return this.addDice('gear', qty);
	}

	/**
	 * Adds a number of negative dice to the roll.
	 * @param {number} qty The quantity to add
	 * @returns {YZRoll} This roll
	 */
	addNegDice(qty) {
		return this.addDice('neg', qty);
	}

	/**
	 * Adds a number of stress dice to the roll.
	 * @param {number} qty The quantity to add
	 * @returns {YZRoll} This roll
	 */
	addStressDice(qty) {
		return this.addDice('stress', qty);
	}

	/**
	 * Adds a number of dice to the roll.
	 * @param {string} type The type of dice to add ("base", "skill", "gear" or "neg")
	 * @param {number} qty The quantity to add
	 * @param {?number} [range=6] The number of faces of the die
	 * @param {?number} value The predefined value for the die
	 * @param {?string} operator The operator of the die
	 * @returns {YZRoll} This roll
	 */
	addDice(type, qty, range = 6, value = null, operator = '+') {
		if (!qty) return this;
		for (let i = 0; i < qty; i++) {
			this.dice.push(new YZDie(range, type, value, operator));
		}
		return this;
	}

	/**
	 * Gets all the dice of a certain type.
	 * @param {string} type Dice type to search
	 * @returns {YZDie[]}
	 */
	getDice(type) {
		return this.dice.filter(d => d.type === type);
	}

	/**
	 * Reduces the Roll to a dice pool.
	 * @returns {Object}
	 */
	pool() {
		return this.dice
			.map(d => d.type)
			.reduce((obj, t) => {
				if (!obj[t]) obj[t] = 1;
				else obj[t]++;
				return obj;
			}, {});
	}

	/**
	 * Gets the sum of the dice of a certain type.
	 * @param {?string} type "base", "skill", "gear", "neg", etc...
	 * @returns {number} The summed result
	 */
	sum(type = null) {
		const dice = type ? this.getDice(type) : this.dice;
		const expression = dice.reduce((acc, d) => acc + d.operator + d.result, '');
		return eval(expression);
	}

	/**
	 * Gets the base-six sticky-result of the dice of a certain type.
	 * @param {?string} type "base", "skill", "gear", "neg", etc...
	 * @returns {number} The sticked result
	 */
	baseSix(type = null) {
		const dice = type ? this.getDice(type) : this.dice;
		const expression = dice.reduce((acc, die) => acc + die.result, '');
		return Number(expression);
	}

	/**
	 * Counts the values of a certain type in the roll.
	 * If `seed` is omitted, counts all the dice of a certain type.
	 * @param {string} type The type of the die
	 * @param {number} seed The number to search.
	 * @returns {number} Total count
	 */
	count(type, seed = null) {
		if (seed) {
			return this.getDice(type).filter(d => d.result === seed).length;
		}
		else {
			return this.getDice(type).length;
		}
	}

	/**
	 * Applies a difficulty modifier to the Year Zero Roll.
	 * @param {number} modifier Difficulty modifier (bonus or malus)
	 * @returns {YZRoll} This roll, modified
	 */
	modify(modifier) {
		const isBonus = modifier > 0;
		const mod = Math.abs(modifier);
		let type;
		if (this.game === 't2k') {
		}
		else if (this.game === 'myz' || this.game === 'fbl') {
		}
		else if (this.game === 'generic') {
		}
		else {
		}
		return this;
	}

	/**
	 * Turns the YZRoll into a roll phrase.
	 * @returns {string}
	 *
	toPhrase() {
		const out = [];
		const dicepool = this.pool();
		const dice = Object.keys(dicepool).map(t => `${dicepool[t]}d6[${t}]`);
		out.push(dice.join('+'));
	}//*/

	/**
	 * Parses a roll resolvable string into a Year Zero Roll object.
	 * @param {string} rollString A roll resolvable string
	 * @param {?string} game The game of the roll
	 * @param {?string} author The author of the roll
	 * @param {?string} name The name of the roll
	 * @returns {YZRoll} Parsed roll
	 * @static
	 */
	static parse(rollString, game, author, name = null) {
		// Creates the roll that will be modified below.
		const roll = new YZRoll(game, author, name);

		// Exits early if it is only a modifier (faster).
		if (isNumber(rollString)) {
			roll.addDice('modifier', 1, 0, +rollString);
			return roll;
		}

		// Splits dice arguments.
		const args = rollString.split(/(?=[*/+-])/);

		// Exits early if no arg.
		if (!args.length) return roll;

		// Parses each arg.
		for (const arg of args) {
			arg.replace(ROLLREGEX, (match, operator, qty, range, type) => {
				if (!qty && range) {
					roll.addDice(type, 1, range, null, operator);
				}
				else if (qty && !range && !/d/i.test(match)) {
					// Modifier.
					roll.addDice('modifier', 1, 0, qty, operator);
				}
				else {
					roll.addDice(type, qty, range === '' ? 6 : range, null, operator);
				}
			});
		}
		// Returns the parsed roll.
		return roll;
	}

	/**
	 * Returns the description of the roll.
	 * @returns {string} The roll described in one sentence
	 */
	toString() {
		const out = [];
		if (this.game !== 'generic') {
			const dicepool = this.pool();
			const dice = Object.keys(dicepool)
				.map(t => `${dicepool[t]}d[${t}] `
					+ `(${this.dice
						.filter(d => d.type === t)
						.map(d => d.result)
						.join(',')
					})`,
				);
			out.push(dice.join(' + '));
		}
		else {
			out.push('=', this.sum());
		}
		if (this.pushed) out.unshift('(pushed)');
		if (this.name) out.unshift(`"${this.name}"`);
		out.unshift(`<${this.game}>`);
		return out.join(' ');
	}
}

module.exports = YZRoll;

class YZDie {

	/**
	 * Year Zero Die with type. The die is rolled if no value is predefined.
	 * @param {?number} range The number of faces of the die
	 * @param {?string} type The type of the die
	 * @param {?number} [value=0] Any predefined value for the die
	 * @param {?string} [operator='+'] The operator of the die
	 */
	constructor(range, type, value = 0, operator = '+') {
		/**
		 * The number of faces of the die.
		 * @type {number}
		 */
		this.range = +range;

		/**
		 * The type of the die.
		 * - `base`, `gear`, `stress`, `ammo`: 1 & 6+ not pushable
		 * - `skill`, `neg`, `arto`: 6+ not pushable
		 * - `modifier`: Cannot be rolled
		 * @type {string}
		 */
		this.type = DIE_TYPES.includes(type) ? type : null;
		if (!range) this.type = 'modifier';

		/**
		 * The result of the die.
		 * @type {number}
		 */
		this.result = +value;

		/**
		 * All previous results, in order of appearance.
		 * @type {number[]}
		 */
		this.previousResults = [];

		/**
		 * The operator of the die.
		 * - `+`: addition
		 * - `-`: substraction
		 * - `*`: multiplication
		 * - `/`: division
		 */
		this.operator = ['+', '-', '*', '/'].includes(operator)
			? operator
			: '+';

		if (!this.result) this.roll();
	}

	/**
	 * Number of times this die has been pushed.
	 * @type {number}
	 * @readonly
	 */
	get pushCount() {
		return this.previousResults.length;
	}

	/**
	 * Wether this die has been pushed.
	 * @type {boolean}
	 * @readonly
	 */
	get pushed() {
		return this.pushCount > 0;
	}

	/**
	 * Wether the die can be pushed (according to its type).
	 * @type {boolean}
	 * @readonly
	 */
	get pushable() {
		switch (this.type) {
			case 'base':
			case 'gear':
			case 'stress':
			case 'ammo':
				if (this.result !== 1 && this.result < 6) return true;
				else return false;
			case 'skill':
			case 'neg':
			case 'arto':
				if (this.result < 6) return true;
				else return false;
			case 'modifier':
				return false;
			default:
				return true;
		}
	}

	/**
	 * Rolls the die.
	 * @returns {number} The new result
	 */
	roll() {
		this.result = rand(1, this.range);
		return this.result;
	}

	/**
	 * Pushes the die, according to its type.
	 * @returns {number} The result, wether it has been pushed or not.
	 */
	push() {
		// Stores the previous result.
		this.previousResults.push(this.result);
		// Reroll the die according to its type.
		if (this.pushable) return this.roll();
		else return this.result;
	}

	toString() {
		if (this.type === 'modifier') return `${this.operator} ${this.result}`;
		else return `${this.operator} d${this.range}${this.type ? `[${this.type}]` : ''}`;
	}
}