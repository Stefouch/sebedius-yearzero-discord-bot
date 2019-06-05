const Deck = require('card-deck');

/**
 * A Year Zero deck of cards.
 * Useful for initiative cards.
 * @extends Deck from module `card-deck`
 */
class YZInitDeck extends Deck {
	/**
	 * Defines a deck.
	 * @param {?Array<*>} [data=YZDeck.INITIATIVE_CARDS] An array of objects, default are initiative cards
	 */
	constructor(data) {
		if (data) super(data);
		else super([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
		super.shuffle();
	}

	/**
	 * The size of the deck.
	 * @returns {number}
	 * @readonly
	 */
	get size() {
		return this._stack.length;
	}
}

module.exports = YZInitDeck;