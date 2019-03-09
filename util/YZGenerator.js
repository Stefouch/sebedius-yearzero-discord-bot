const { RollParser } = require('./RollParser');
const Util = require('./Util');

/**
 * RollData structure.
 * @typedef {RollData}
 * @property {RollString} roll Roll to perform in the table
 * @property {string} define Useless comment
 * @property {boolean} [array=false] If must returns an array (default is false)
 * @property {SeededData} data The seeded table
 */

/**
 * A roll string resolvable.
 * @typedef {RollString} {string}
 */

/**
 * Seeded Table.
 * @typedef {SeededData}
 * @property {number} xx => value
 */

/**
 * Generates a Year Zero Object from random tables.
 */
class YZGenerator {
	/**
	 * Generates a Year Zero Object from random tables.
	 * @param {Object} source Generator Data
	 */
	constructor(source) {
		const dataToResolve = JSON.parse(JSON.stringify(source));

		/**
		 * Resolved data.
		 * @type {Object}
		 */
		this.data = this.setup(dataToResolve);

		// console.log(this);
	}

	/**
	 * Resolves all "roll-data" couples.
	 * @param {Object} source The data to process
	 * @throws {RangeError} If suspicious infinite loop
	 * @returns {Object}
	 */
	setup(source) {
		// The "roll-data" are Objects.
		if (Util.isObject(source)) {
			// And must have both "roll" and "data" keys.
			if (source.hasOwnProperty('roll') && source.hasOwnProperty('data')) {
				// More than one element from "data" can be fetched.
				let count = 1;
				if (source.hasOwnProperty('count')) count = source.count;

				// Allows or not more than one element.
				// NOTE: on "true", data is always returned in an Array
				let multiple = false;
				if (source.hasOwnProperty('count')) multiple = true;
				else if (source.hasOwnProperty('array')) multiple = source.array;

				// Stores the fetched elements.
				const elems = new Set();

				// Performs cycles.
				while (count > 0) {
					const roll = RollParser.parseAndRoll(source.roll);
					const data = source.data;
					let elem = YZGenerator.rollData(roll, data);

					// Rerolls if the elem is an Object with { REROLL: number }.
					if (multiple && elem.hasOwnProperty('REROLL')) { count += elem.REROLL; }
					else if (elems.has(elem)) { count++; }
					else {
						elem = this.setup(elem);
						elems.add(elem);
					}
					count--;

					// Breaks the cycle if we get too many elements.
					if (elems.size >= 6) break;

					// Throws an error if infinite loop.
					if (count > 100) throw new RangeError('Infinite counts (>100)!');
				}
				source = Array.from(elems);

				if (!multiple && source.length === 1) source = source[0];
			}

			// Deeper check.
			if (Util.isObject(source)) {
				for (const key in source) {
					if (source.hasOwnProperty(key)) {
						source[key] = this.setup(source[key]);
					}
				}
			}
		}

		return source;
	}

	/**
	 * Gets a value from seeded data.
	 * @param {number} roll The seed value rolled
	 * @param {Object} data The seeded data: "seed" => "value"
	 * @throws {RangeError} If found nothing
	 * @returns {*}
	 */
	static rollData(roll, data) {
		for (let i = +roll; i > 0; i--) {
			const elemRef = `${i}`;
			if (elemRef in data && +roll >= i) {
				return data[elemRef];
			}
		}
		throw new RangeError(`Seed (${roll}) incorrect!`);
	}

	/**
	 * Fetches the values of a key in the generator data.
	 * @param {string} param Data's key to fetch
	 * @throws {TypeError} If incorrect key
	 * @returns {*} Values in an Array if [array=true]
	 */
	getAll(param) {
		if (this.data.hasOwnProperty(param)) return this.data[param];
		else throw new TypeError(`Incorrect parameter: ${param}!`);
	}

	/**
	 * Fetches the values of a key in the generator data.
	 * Returns a single element instead of an array if length = 1.
	 * @param {string} param Data's key to fetch
	 * @throws {TypeError} If incorrect key
	 * @returns {*}
	 */
	get(param) {
		const elems = this.getAll(param);

		if (elems instanceof Array) {
			if (elems.length === 1) return elems[0];
		}

		return elems;
	}
}

module.exports = YZGenerator;