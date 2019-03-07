const Util = require('./Util');

class YZGenerator {
	/**
	 * Generates a Year Zero Object at random.
	 * @param {Object} source Generator Data
	 */
	constructor(source) {
		const dataToResolve = JSON.parse(JSON.stringify(source));

		/**
		 * Resolved data.
		 * @type {Object}
		 */
		this.data = this.setup(dataToResolve);

		console.log(this);
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
				/* let multiple = false;
				if (source.hasOwnProperty('count')) multiple = true;
				else if (source.hasOwnProperty('multiple')) multiple = source.multiple; */

				// Stores the fetched elements.
				const elems = new Set();

				// Performs cycles.
				while (count > 0) {
					const roll = eval(Util.parseRoll(source.roll));
					const data = source.data;
					const elem = this.rollData(roll, data);

					// Rerolls if the elem is an Object with { REROLL: number }.
					if (elem.hasOwnProperty('REROLL')) count += elem.REROLL;
					else if (elems.has(elem)) count++;
					else elems.add(elem);
					count--;

					// Breaks the cycle if we get too many elements.
					if (elems.size >= 6) break;

					// Throws an error if infinite loop.
					if (count > 100) throw new RangeError('Infinite counts (>100)!');
				}
				source = [];
				elems.forEach(elem => {
					elem = this.setup(elem);
					source.push(elem);
				});
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
	rollData(roll, data) {
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
	 * @returns {*[]}
	 */
	getMultipleElemFromParam(param) {
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
	getElemFromParam(param) {
		const elems = this.getMultipleElemFromParam(param);

		if (elems instanceof Array) {
			if (elems.length === 1) return elems[0];
		}

		return elems;
	}

	/**
	 * Gets at random one or more elements from a specified parameter of the source file.
	 * If the element is a number, as many extra elements will be fetched.
	 * @param {string} param The parameter to search
	 * @param {Object} [source=this.source] The Object to search. Default is the source file
	 * @param {number} [count=1] Minimum number elements to fetch.
	 * @param {number} [max=3] Maximum number of elements to fetch.
	 * @returns {Array<*>} An array of elements
	 * @throws {RangeError} If "count" becomes > 100 (suspicious infinite loop)
	 * @throws {RangeError} If "count" > "param" entries
	 *
	getMultipleElemFromParam(param, source = this.source, count = 1, max = 3) {
		// Exits early and throws an error if the count is too high.
		// It can't be higher than the number of entries, because we use a Set Object,
		// which refuses duplicates.
		if (source[param].hasOwnProperty('data')) {
			const paramCount = Object.keys(source[param].data).length;
			if (count > paramCount) {
				throw new RangeError(`Count (${count}) > source.${param} entries (${paramCount})!`);
			}
		}

		// Stores the fetched elements.
		const elems = new Set();

		// Performs cycles.
		while (count > 0) {
			const elem = this.getElemFromParam(param, source);

			if (typeof elem === 'number') count += elem;
			else if (elems.has(elem)) count++;
			else elems.add(elem);
			count--;

			// Breaks the cycle if we get too many elements.
			if (elems.size >= max) break;

			// Throws an error if infinite loop.
			if (count > 100) throw new RangeError('Infinite counts!');
		}

		return Array.from(elems);
	}

	/**
	 * Gets at random an element from a specified parameter of the source file.
	 * @param {string} param The parameter to search
	 * @param {Object} [source=this.source] The Object to search. Default is the source file
	 * @returns {*} Can be anything
	 * @throws {TypeError} If the parameter wasn't found in the source file
	 *
	getElemFromParam(param, source = this.source) {
		// Exits early and throws an error if the parameter doesn't exist.
		if (!source.hasOwnProperty(param)) throw new TypeError(`Parameter "${param}" not found!`);

		// Returns early if it's not an Object.
		if (!Util.isObject(source[param])) return source[param];

		// Returns early if it's an Object without the "roll-data" couple.
		if (!source[param].hasOwnProperty('roll') || !source[param].hasOwnProperty('data')) return source[param];

		// Otherwise, process the "roll-data" couple.
		const roll = eval(Util.parseRoll(source[param].roll));
		const data = source[param].data;

		// "data" format is: "ref" => "elem"
		let elemRef;
		let elem;

		// Finds the correct reference with the roll,
		// and gets the corresponding element.
		for (let i = roll; i > 0; i--) {
			elemRef = `${i}`;
			if (elemRef in data && roll >= i) {
				elem = data[elemRef];
				break;
			}
		}

		// ===============================================================================
		// The element may be an Object, and one of its key may have a "roll-data" couple.
		// If so, processes the "roll-data" couple for each of these keys.

		// Returns the element if it's not an Object.
		if (!Util.isObject(elem)) return elem;

		// Otherwise, checks each of its key.
		for (const key in elem) {

			// Continues deeper if a "roll-data" couple is found.
			if (elem[key].hasOwnProperty('roll') && elem[key].hasOwnProperty('data')) {

				// The "roll-data" couple could have a "reroll" option,
				// So we must use the "get-multiple" function.
				const tempElem = this.getMultipleElemFromParam(key, elem);

				// The "get-multiple" always returns an Array.
				// If the array has only 1 element, we'll return only that element.
				if (tempElem instanceof Array) {
					if (tempElem.length === 1) elem[key] = tempElem[0];
					else elem[key] = tempElem;
				}
				// Otherwise, returns everything.
				else {
					elem[key] = tempElem;
				}
			}
		}

		return elem;
	}//*/
}

module.exports = YZGenerator;