const Util = require('./Util');

class YZGenerator {
	constructor(source) {
		Object.defineProperty(this, 'source', {
			value: source,
		});
	}

	/**
	 * Gets at random an element from a specified parameter of the source file.
	 * @param {string} param The parameter to search
	 * @param {Object} [source=this.source] The Object to search. Default is the source file
	 * @returns {*} Can be anything
	 * @throws {RangeError} If the parameter wasn't found in the source file
	 */
	getElemFromParam(param, source = this.source) {
		// Exits early and throws an error if the parameter doesn't exist.
		if (!source.hasOwnProperty(param)) throw new RangeError(`Parameter "${param}" not found!`);

		// Trying another way.
		if (!Util.isObject(source[param])) return source[param];

		if (!source[param].hasOwnProperty('roll')
			|| !source[param].hasOwnProperty('data')) return source[param];

		const roll = Util.parseRoll(source[param].roll);
		const data = source[param].data;
		return this.getElemFromData(roll, data);
	}

	/**
	 * Gets at random one or more elements from a specified parameter of the source file.
	 * If the element is a number, more elements of that number will be fetched.
	 * @param {string} param The parameter to search
	 * @param {Object} [source=this.source] The Object to search. Default is the source file
	 * @param {number} [count=1] Minimum number elements to fetch.
	 * @param {number} [max=3] Maximum number of elements to fetch.
	 * @returns {Array<*>} An array of elements
	 * @throws {RangeError} If "count" becomes > 100.
	 */
	getMultipleElemFromParam(param, source = this.source, count = 1, max = 3) {
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
	 * Gets an element by seed from seeded data.
	 * @param {number} roll The roll's seed
	 * @param {Object} data The seeded data
	 * @returns {*} Can be anything
	 */
	getElemFromData(roll, data) {
		let elem;

		for (let i = roll; i > 0; i--) {
			if (i in data && roll >= i) {
				elem = data[i];
				break;
			}
		}

		// Returns early if it's not an object.
		if (!Util.isObject(elem)) return elem;

		// If it's an object, one of its key
		// could have a "roll-data" couple.
		// Let's check each key.
		for (const key in elem) {

			if (Util.isObject(elem[key])) {

				if (elem[key].hasOwnProperty('roll')
					&& elem[key].hasOwnProperty('data')) {

					// The "roll-data" couple could have a "reroll" option,
					// So we must use the "get-multiple" function.
					const tmp = this.getMultipleElemFromParam(key, elem);

					// The "get-multiple" always returns an Array.
					// If the array has only 1 element,
					// we'll return only it.
					if (tmp instanceof Array) {
						if (tmp.length === 1) elem[key] = tmp[0];
						else elem[key] = tmp;
					}
					// Otherwise, we return everything.
					else {
						elem[key] = tmp;
					}
				}
			}
		}
		return elem;
	}
}

module.exports = YZGenerator;