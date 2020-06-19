const Util = require('./Util');

const ROLLREGEX = /(\d*)(?:[dD])(\d+)([+-]\d+)*/;

class RollParser {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * The Regular Expression used to identify a roll resolvable string.
	 * @type {RegExp}
	 * @readonly
	 */
	static get ROLLREGEX() { return ROLLREGEX; }

	/**
	 * Parses a roll resolvable string into a Roll object.
	 * @param {RollString} rollString A roll resolvable string
	 * @returns {Roll}
	 * @typedef {string} RollString A roll resolvable string
	 */
	static parse(rollString) {
		if (Util.isNumber(rollString)) return new Roll(0, 0, rollString);
		if (!ROLLREGEX.test(rollString)) return null;

		const roll = new Roll();
		rollString = '' + rollString;
		rollString.replace(ROLLREGEX, (match, p1, p2, p3) => {
			roll.count = +p1 || 1;
			roll.base = +p2 || 0;
			roll.modifier = (p3) ? eval(p3) : 0;
		});
		return roll;
	}

	/**
	 * Parses and rolls a roll resolvable string.
	 * @param {RollString} rollString A roll resolvable string
	 * @returns {number}
	 */
	static parseAndRoll(rollString) {
		const roll = RollParser.parse(rollString);
		if (roll instanceof Roll) return roll.roll();
		return null;
	}

	/**
	 * Finds, parses and rolls all roll elements in a string.
	 * @param {string} str String to parse
	 * @returns {string} Replacements processed
	 */
	static supersede(str) {
		const regex = new RegExp(ROLLREGEX, 'g');
		return str.replace(regex, match => {
			return RollParser.parseAndRoll(match);
		});
	}
}

class Roll {
	/**
	 * Creates a Roll object.
	 * @param {?number} [count=1] Number of dice
	 * @param {?number} [base=6] Number of faces (base) on the dice
	 * @param {?number} [modifier=0] Additional modifier to the roll result
	 */
	constructor(count = 1, base = 6, modifier = 0) {
		/**
		 * Number of dice.
		 * @type {number}
		 */
		this.count = count;

		/**
		 * Number of faces (base) on the dice.
		 * @type {number}
		 */
		this.base = base;

		/**
		 * Additional modifier to the roll result.
		 * @type {number}
		 */
		this.modifier = modifier;

		/**
		 * Records the roll's last result.
		 * @type {number[]}
		 */
		this.lastResults = null;

		/* Object.defineProperty(this, 'timestamp', {
			value: Date.now(),
		}); */
		Object.defineProperty(this, 'id', {
			value: Math.random().toString(36).substr(2, 6),
		});
	}

	/**
	 * Rolls the dice.
	 * @param {?boolean} [array=false] Forces the results to be returned individually in an array (default is *false*)
	 * @throws {TypeError} If "repeat" or "roll.count" not a number
	 * @returns {number|number[]} If an array, the modifier is not included
	 */
	roll(array = false) {
		if (typeof this.count !== 'number') throw new TypeError(`Roll.count (${this.count}) not a number!`);

		const results = [];
		let count = this.count;

		while (count > 0) {
			if (this.glued) results.push(Roll.glueRoll(this.base));
			else results.push(Util.rand(1, Math.min(this.base, 1000000)));
			count--;
		}
		this.lastResults = results;

		if (array) return results;
		else return results.reduce((pv, cv) => pv + cv, 0) + this.modifier;
	}

	rollAndKeep(keep = this.count, array = false) {
		this.roll();
	}

	/**
	 * Rolls and explodes the dice.
	 * @param {?number} [depth=0] Maximum number of rerolls, 0 means no maximum
	 * @param {?number|number[]} [tn=this.base] Value or an array of values that trigger the reroll
	 * @param {?boolean} [array=false] Forces the results to be returned individually in an array (default is *false*)
	 */
	explode(depth = 0, tns = this.base, array = false) {
		this.roll();
		let count = 0;
		let nb = countExploding(tns, this);

		while (nb > 0) {
			const explodingRoll = new Roll(nb, this.base);
			explodingRoll.roll();
			this.lastResults = this.lastResults.concat(explodingRoll.lastResults);

			// Resets the nb of rerolls.
			nb = countExploding(tns, explodingRoll);

			count++;
			if (depth !== 0 && count >= depth) break;
		}

		if (array) return this.lastResults;
		else return this.lastResults.reduce((pv, cv) => pv + cv, 0) + this.modifier;

		// Internal function.
		function countExploding(targetNumbers, roll) {
			let qty = 0;
			if (targetNumbers instanceof Array) {
				targetNumbers.forEach(tn => {
					qty += roll.lastResults.filter(d => d === tn).length;
				});
			}
			else {
				qty = roll.countValues(targetNumbers);
			}
			return qty;
		}
	}

	/**
	 * Counts the number of values in a roll.
	 * Ignores the modifier.
	 * @param {number|string} value The value to count
	 * @returns {number} Returns *null* if the dice weren't rolled previously.
	 */
	countValues(value) {
		const val = +value || 0;
		if (this.lastResults) return this.lastResults.filter(d => d === val).length;
		return null;
	}

	/**
	 * Rolls glued dice.
	 * @param {number|string} value Numeric value to roll.
	 * @returns {number}
	 * @example
	 * let n = glueRoll(88); // returns D8 * 10 + D8.
	 * let n = glueRoll(666); // returns D6 * 100 + D6 * 10 + D6.
	 * let n = glueRoll(42); // returns 42.
	 */
	static glueRoll(value) {
		// Exits early if not valid.
		if (!Roll.isGlue(value)) return value;

		// Rolls the dice.
		const str = '' + value;
		const units = [...str];

		let result = 0;
		for (let i = 0; i < units.length; i++) {
			result += Util.rand(1, units[0]) * (10 ** i);
		}

		return result;
	}

	/**
	 * Tells if the value is glue-like.
	 * @param {string|number} value Numeric value to test
	 * @returns {boolean}
	 */
	static isGlue(value) {
		const str = '' + value;
		const units = [...str];
		if (units.length > 1) return units.every((val, i, arr) => val === arr[0]);
		else return false;
	}

	/**
	 * Tells if the base of the roll is glued.
	 * @type {boolean}
	 * @readonly
	 */
	get glued() { return Roll.isGlue(this.base); }
}

Roll.prototype.toString = function() {
	return `${this.count}d${this.base}` + (this.modifier !== 0 ? (this.modifier > 0 ? '+' : '–') + this.modifier : '');
};

module.exports = { Roll, RollParser };