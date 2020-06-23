class RollTable extends Map {

	/**
	 * The total length of the entries.
	 * Not the same as Size.
	 * @returns {number}
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