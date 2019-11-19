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
class YZGenerator2 {
	/**
	 * Generates a Year Zero Object from random tables.
	 * @param {Object} source Generator Data
	 */
	constructor(source) {
		/**
		 * Resolved data.
		 * @type {Object}
		 */
		this.data = JSON.parse(JSON.stringify(source));

		console.log(this);
	}

	/**
	 * Resolves all "roll-data" couples.
	 * @param {Object} source The data to process
	 * @param {number} [mod=0] Seed modifier
	 * @throws {RangeError} If suspicious infinite loop
	 * @throws {TypeError} If incorrect key
	 * @returns {Object}
	 */
	setup(source, mod = 0) {
		if (typeof mod === 'string') mod = RollParser.parseAndRoll(mod);
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
					const roll = RollParser.parseAndRoll(source.roll) + +mod;
					const data = source.data;
					let elem = YZGenerator2.rollData(roll, data);

					// Rerolls if the elem is an Object with { REROLL: number }.
					if (multiple && elem.hasOwnProperty('REROLL')) { count += Util.parseAndRoll(elem.REROLL); }
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
	 * @param {number} seed The seed value rolled
	 * @param {Object} data The seeded data: "seed" => "value"
	 * @returns {*}
	 */
	static rollData(seed, data) {
		for (let i = +seed; i > 0; i--) {
			const elemRef = `${i}`;
			if (elemRef in data && +seed >= i) {
				return data[elemRef];
			}
		}
		// Returns the first element if found nothing.
		return Object.values(data)[0];
	}

	/**
	 * Fetches the values of a key in the generator data.
	 * @param {string} param Data's key to fetch
	 * @param {number} [mod=0] Seed modifier
	 * @throws {TypeError} If incorrect key
	 * @returns {*} Values in an Array if [array=true]
	 */
	getAll(param, mod = 0) {
		if (this.data.hasOwnProperty(param)) {
			// const source = JSON.parse(JSON.stringify(this.data[param]));
			const source = this.data[param];
			return this.setup(source, mod);
		}
		else {
			throw new TypeError(`Incorrect parameter: ${param}!`);
		}
	}

	/**
	 * Fetches the values of a key in the generator data.
	 * Returns a single element instead of an array if length = 1.
	 * @param {string} param Data's key to fetch
	 * @param {number} [mod=0] Seed modifier
	 * @throws {TypeError} If incorrect key
	 * @returns {*}
	 */
	get(param, mod = 0) {
		const elems = this.getAll(param, mod);

		if (elems instanceof Array) {
			if (elems.length === 1) return elems[0];
		}

		return elems;
	}
}

module.exports = YZGenerator2;