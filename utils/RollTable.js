const { rand, hasSameDigits, convertToBijective } = require('./Util');

/**
 * A rollable table.
 * @extends {Map}
 */
class RollTable extends Map {
	/**
	 * @param {string} name The name of the table
	 * @param {?string} roll The die (or dice) required to roll the table
	 * @param {?*} iterable An Array or another iterable object whose elements are key-value pairs
	 */
	constructor(name = '<Unnamed>', roll = null, iterable) {
		super(iterable);

		/**
		 * The name of the table.
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The die (or dice) required to roll the table.
		 * @type {string}
		 */
		this.roll = /^d\d+$/i.test(roll) ? roll.toUpperCase() : null;
	}

	/**
	 * The lowest reference.
	 * @type {number}
	 * @readonly
	 */
	get min() {
		let n = Number.MAX_VALUE;

		for (const key of this.keys()) {
			if (typeof key === 'string') {
				if (/-/.test(key)) {
					const boundaries = key.split('-');
					const min = +boundaries[0];
					// const max = +boundaries[1];
					n = Math.min(n, min);
				}
				else if (/^[-+]?\d+$/.test(key)) {
					n = Math.min(n, +key);
				}
			}
			else if (typeof key === 'number') {
				n = Math.min(n, key);
			}
		}
		if (n === Number.MAX_VALUE) return undefined;
		return n;
	}

	/**
	 * The highest reference.
	 * @type {number}
	 * @readonly
	 */
	get max() {
		let n = 0;

		for (const key of this.keys()) {
			if (typeof key === 'string') {
				if (/-/.test(key)) {
					const boundaries = key.split('-');
					// const min = +boundaries[0];
					const max = +boundaries[1];
					n = Math.max(n, max);
				}
				else if (/^[-+]?\d+$/.test(key)) {
					n = Math.max(n, +key);
				}
			}
			else if (typeof key === 'number') {
				n = Math.max(n, key);
			}
		}
		if (n <= 0) return undefined;
		return n;
	}

	/**
	 * The total length of the entries.
	 * Not the same as Size.
	 * @type {number}
	 * @readonly
	 */
	get length() {
		if (this.min <= 1) return this.max;
		if (this.min === 11 || this.min === 111) {
			if (hasSameDigits(this.max)) {
				return (+`${this.max}`.charAt(0)) ** Math.ceil(Math.log10(this.max));
			}
		}
		return Math.round(this.max / this.min);

		//let len = 0;

		// for (const key of this.keys()) {
		// 	if (typeof key === 'string') {
		// 		if (/-/.test(key)) {
		// 			const boundaries = key.split('-');
		// 			const min = +boundaries[0];
		// 			const max = +boundaries[1];
		// 			len += (max - min + 1);
		// 		}
		// 		else { len++; }
		// 	}
		// 	else { len++; }
		// }
		// return len;
	}

	/**
	 * The die used to get a random element from this table.
	 * @type {string}
	 * @readonly
	 */
	get d() {
		if (this.roll) return this.roll;
		if (this.length === 6) return 'D6';
		if (this.length === 36) return 'D66';
		if (this.length === 216) return 'D666';
		return `D${this.length}`;
	}

	/**
	 * Returns a specified entry from a RollTable object.
	 * If the entry is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the table.
	 * @param {number} reference The reference (roll value) of the entry to return from the table
	 * @returns {*} The entry associated with the specified roll value, or undefined if the value can't be found in the table
	 */
	get(reference) {
		const regexKey = new RegExp(reference, 'i');

		for (const [key, val] of this.entries()) {
			if (typeof key === 'string') {
				if (regexKey.test(key)) {
					return val;
				}
				else if (/-/.test(key)) {
					const boundaries = key.split('-');
					const min = +boundaries[0];
					const max = +boundaries[1];
					if (reference >= min && reference <= max) return val;
				}
			}
		}
		return super.get(reference);
	}

	/**
	 * Returns a boolean indicating whether an entry with the specified reference exists or not.
	 * @param {number} reference The reference (roll value) of the entry to test for presence in the table
	 * @returns {boolean} `true` if an entry with the specified reference exists in the table; otherwise `false`
	 */
	has(reference) {
		const regexKey = new RegExp(reference, 'i');

		for (const key of this.keys()) {
			if (typeof key === 'string') {
				if (regexKey.test(key)) {
					return true;
				}
				else if (/-/.test(key)) {
					const boundaries = key.split('-');
					const min = +boundaries[0];
					const max = +boundaries[1];
					if (reference >= min && reference <= max) return true;
				}
			}
		}
		return super.has(reference);
	}

	/**
	 * Returns a random entry from a RollTable object.
	 * @returns {*} or `undefined` if not found
	 * @throws {ReferenceError} if the table is corrupted
	 */
	random() {
		// Generates a random seed based on the quantity of entries (length).
		let seed = rand(1, this.length);

		// Praises the RNG Jesus.
		let rngesus = seed;

		// If the roll uses a D66 or D66 (or something similar)
		// `rngesus` must be adapted.
		if (this.min === 11 || this.min === 111) {
			if (hasSameDigits(this.max)) {
				// Gets the actual Base. D66 = 6; D88 = 8;
				const digit = +`${this.max}`.charAt(0);

				// Adjusts the seed.
				let log = Math.floor(Math.log10(this.max));
				for (; log > 0; log--) seed += digit ** log;

				// Creates sequence for the Base <digit>
				const seq = Array(digit)
					.fill()
					.map((x, i) => i + 1)
					.join('');

				// Converts the seed into a valid reference.
				rngesus = convertToBijective(seed, seq);
			}
		}
		// Gets the value of the random reference.
		const item = this.get(rngesus);

		// If not found, throws an error
		// as that would mean the table is corrupted.
		// Useful for debugging.
		if (item == undefined) {
			throw new ReferenceError(
				`RollTable "${this.name}" - Random Value Not Found`
				+ `\nMin: ${this.min}, Max: ${this.max}, Length: ${this.length}, Size: ${this.size}`
				+ `\nRoll: ${this.roll} → Seed: ${seed} → Rngesus: ${rngesus}`
				+ `\nValue: ${item}`,
			);
		}

		// Logs.
		console.log(`:>> 🎲[${this.name}]: '${rngesus}' → ${item}`);

		// Returns the random value.
		return item;
	}
}

module.exports = RollTable;