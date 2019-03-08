const Util = require('./Util');

const ROLLREGEX = /(\d*)(?:[dD])(\d+)([+-]\d+)?/g;

class RollParser {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	static parse(rollString) {
		const roll = new Roll();
		rollString.replace(ROLLREGEX, (match, p1, p2, p3, offset, string) => {
			// COUNT
			roll.count = +p1 || 1;
			// TYPE
			roll.base = +p2 || 6;
			// MODIFIER
			roll.modifier = +p3 || 0;
		});
		return roll;
	}

	static parseString(str) {
		return str.replace(ROLLREGEX, match => {
			const roll = RollParser.parse(match);
			return roll.roll();
		});
	}
}

class Roll {
	constructor(count = 1, base = 6, modifier = 0) {
		this.count = count;
		this.bas = base;
		this.modifier = modifier;

		Object.defineProperty(this, 'timestamp', {
			value: Date.now(),
		});
		Object.defineProperty(this, 'id', {
			value: Math.random().toString(36).substr(2, 6),
		});
	}

	roll(repeat = 1) {
		let result = 0;
		let count = this.count || 1;

		while (repeat > 0) {

			while (count > 0) {
				if (this.glued) result += Roll.glueRoll(this.base);
				else result += Util.rand(1, this.base);
				count--;
			}
			repeat--;
		}

		return result;
	}

	/**
	 * Rolls centil dice.
	 * @param {number|string} value Numeric value to roll.
	 * @returns {number} Returns *false* if not a valid roll
	 * @example
	 * let n = glueRoll(88); // returns D8 * 10 + D8.
	 * let n = glueRoll(666); // returns D6 * 100 + D6 * 10 + D6.
	 * let n = glueRoll(42); // returns *false*.
	 */
	static glueRoll(value) {
		// Exits early if not valid.
		if (!Roll.isGlue(value)) return false;

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
	return `${this.count}d${this.base}` + (this.modifier !== 0 ? (this.modifier > 0 ? '+' : '–') : '');
};

module.exports = { Roll, RollParser };