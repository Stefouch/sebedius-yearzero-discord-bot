/**
 * Base model for online Sheet parsers.
 */
class SheetLoader {
	/**
	 * @param {string} url The url to fetch for the character.
	 */
	constructor(url) {
		/**
		 * The url to fetch for the character.
		 * @type {string}
		 */
		this.url = url;

		/**
		 * Character's raw data.
		 * @type {Object}
		 */
		this.characterData = null;
	}

	/**
	 * @namespace
	 * @async
	 */
	async loadCharacter() {
		throw new SyntaxError('Not Implemented');
	}
}

module.exports = SheetLoader;