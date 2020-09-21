/**
 * Base model for online Sheet parsers.
 */
class SheetLoader {
	/**
	 * @param {string} url The URL where to fetch the character.
	 */
	constructor(url) {
		/**
		 * The URL where to fetch the character.
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