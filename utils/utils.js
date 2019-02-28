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

module.exports = {
	/**
	 * Generates a random integer between <min> and <max>.
	 * @param {number} min Minimum threshold
	 * @param {number} max Maximum threshold
	 * @returns {number} The randomized integer
	 */
	rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	/**
	 * Calculates the modulus, the remainder of an integer division.
	 * @deprecated Use operator '%' instead.
	 * @param {number} dividend Dividend
	 * @param {number} divisor Divisor
	 * @returns {number}
	 */
	mod(dividend, divisor) {
		return dividend - divisor * Math.floor(dividend / divisor);
	},

	/**
	 * Rolls and sums the results of several D6.
	 * @param {number} nb How many D6 to roll
	 * @returns {number} Added results
	 */
	rollD6(nb) {
		let result = 0;
		for (let i = 0; i < nb; i++) {
			result += module.exports.rand(1, 6);
		}
		return result;
	},

	/**
	 * Capitalizes the first letter of a string.
	 * @param {string} str The string to process
	 * @returns {string} The processed string
	 */
	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	/**
	 * Lowers the first character of a string.
	 * @param {string} str The string to process
	 * @returns {string} The processed string
	 */
	strLcFirst(str) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	},
};