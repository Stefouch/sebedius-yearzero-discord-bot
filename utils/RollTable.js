/**
 * A rollable table.
 * @extends {Map}
 */
class RollTable extends Map {
	/**
	 * @param {string} name The name of the table
	 * @param {*} iterable An Array or other iterable object whose elements are key-value pairs.
	 */
	constructor(name, iterable) {
		super(iterable);
		this.name = name;
	}

	/**
	 * The total length of the entries.
	 * Not the same as Size.
	 * @type {number}
	 * @readonly
	 */
	get length() {
		let len = 0;

		for (const key of this.keys()) {
			if (typeof key === 'string') {
				if (/-/.test(key)) {
					const boundaries = key.split('-');
					const min = +boundaries[0];
					const max = +boundaries[1];
					len += (max - min + 1);
				}
				else { len++; }
			}
			else { len++; }
		}
		return len;
	}

	/**
	 * The die used to get a random element from this table.
	 * @type {string}
	 * @readonly
	 */
	get d() {
		if (this.length === 6) return 'D6';
		else if (this.length === 36) return 'D66';
		else if (this.length === 216) return 'D666';
		else return `D${this.length}`;
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
}

module.exports = RollTable;