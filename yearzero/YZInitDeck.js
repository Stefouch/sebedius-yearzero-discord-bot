const Deck = require('card-deck');

/**
 * A Year Zero deck of cards.
 * Useful for initiative cards.
 * @extends Deck from module `card-deck`
 */
class YZInitDeck extends Deck {
	/**
	 * Defines a deck.
	 * @param {?Array<*>} [data=YZInitDeck.INITIATIVE_CARDS] An array of objects, default are initiative cards
	 */
	constructor(data) {
		if (data) super(data);
		else super(YZInitDeck.INITIATIVE_CARDS);
		super.shuffle();
	}

	/**
	 * The size of the deck.
	 * @type {number}
	 * @readonly
	 */
	get size() {
		return this._stack.length;
	}

	/**
	 * The default list of the initiative cards' values.
	 * @type {number[]}
	 * @readonly
	 * @constant
	 */
	static get INITIATIVE_CARDS() {
		return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	}
}

module.exports = YZInitDeck;