class Util {
	constructor() {
		throw new Error(`The ${this.constructor.name} class may not be instantiated.`);
	}

	/**
	 * Generates a random integer between <min> and <max>.
	 * @param {number} min Minimum threshold
	 * @param {number} max Maximum threshold
	 * @returns {number} The randomized integer
	 */
	static rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	/**
	 * Gets a random element from an iterable object, which can be:
	 * * A string
	 * * An Array
	 * * A Set or Map object
	 *
	 * The object can also be non-iterable:
	 * * A boolean: in this case, if it's true, it returns 0 or 1. If it's false, it always returns 0.
	 * * A number: in this case, it returns a random integer between 0 and the given number non-included.
	 * @param {boolean|number|string|Array|Set|Map} data The iterable to randomize
	 * @returns {*} An element chosen at random *(returns 'null' if found nothing)*
	 */
	static random(data) {
		if (typeof data === 'boolean') {
			if (data) return Util.rand(0, 1);
			else return 0;
		}
		else if (typeof data === 'number') {
			return Math.floor(Math.random() * data);
		}
		else if (typeof data === 'string') {
			return data[Math.floor(Math.random() * data.length)];
		}
		else if (data instanceof Array) {
			return data[Math.floor(Math.random() * data.length)];
		}
		else if (data instanceof Set) {
			return [...data][Math.floor(Math.random() * data.size)];
		}
		else if (data instanceof Map) {
			const index = Math.floor(Math.random() * data.size);
			let cntr = 0;
			for (const key of data.keys()) {
				if (cntr++ === index) return data.get(key);
			}
		}
		return null;
	}

	/**
	 * Calculates the modulus, the remainder of an integer division.
	 * @deprecated Use operator '%' instead.
	 * @param {number} dividend Dividend
	 * @param {number} divisor Divisor
	 * @returns {number}
	 */
	static mod(dividend, divisor) {
		return dividend - divisor * Math.floor(dividend / divisor);
	}

	/**
	 * Capitalizes the first letter of a string.
	 * @param {string} str The string to process
	 * @returns {string} The processed string
	 */
	static capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Lowers the first character of a string.
	 * @param {string} str The string to process
	 * @returns {string} The processed string
	 */
	static strLcFirst(str) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	/**
	 * Rolls and sums the results of several D6.
	 * @param {number} nb How many D6 to roll
	 * @returns {number} Added results
	 */
	static sumD6(nb) {
		let result = 0;
		for (let i = 0; i < nb; i++) {
			result += Util.rand(1, 6);
		}
		return result;
	}

	/**
	 * Rolls a D666.
	 * @returns {number}
	 */
	static rollD666() {
		return Util.rand(1, 6) * 100 + Util.rand(1, 6) * 10 + Util.rand(1, 6);
	}

	/**
	 * Rolls a D66.
	 * @returns {number}
	 */
	static rollD66() {
		return Util.rand(1, 6) * 10 + Util.rand(1, 6);
	}

	/**
	 * Parses a roll string into a random number. Supported formats:
	 * * D6, D66, D666
	 * * XD6
	 * @param {string} rollStr The string to parse
	 * @returns {number}
	 */
	static parseRoll(rollStr) {
		let roll = rollStr.replace(/D666/gmi, Util.rollD666());
		roll = roll.replace(/D66/gmi, Util.rollD66());
		roll = roll.replace(/(\d)D6/gmi, (match, p1) => Util.sumD6(p1));
		roll = roll.replace(/D6/gmi, Util.rand(1, 6));
		return roll;
	}

	static mapToJson(map) {
		return JSON.stringify([...map]);
	}
	static jsonToMap(jsonStr) {
		return new Map(JSON.parse(jsonStr));
	}

	/**
	* Shallow-copies an object with its class/prototype intact.
	* @param {Object} obj Object to clone
	* @returns {Object}
	*/
	static cloneObject(obj) {
		return Object.assign(Object.create(obj), obj);
	}
}

module.exports = Util;

/**
 * Regular Expression IndexOf for Arrays
 * This little addition to the Array prototype will iterate over array
 * and return the index of the first element which matches the provided
 * regular expression.
 * Note: This will not match on objects.
 * @param {RegExp} rx The regular expression to test with. E.g. /-ba/gim
 * @returns {number} -1 means not found
 */
if (typeof Array.prototype.regIndexOf === 'undefined') {
	Array.prototype.regIndexOf = function(rx) {
		for (const i in this) {
			if (this[i].toString().match(rx)) {
				return Number(i);
			}
		}
		return -1;
	};
}

/**
 * Regular Expression includes for Arrays.
 * @param {RegExp} rx The regular expression to test with.
 * @returns {boolean}
 */
if (typeof Array.prototype.regIncludes === 'undefined') {
	Array.prototype.regIncludes = function(rx) {
		return this.regIndexOf(rx) >= 0;
	};
}