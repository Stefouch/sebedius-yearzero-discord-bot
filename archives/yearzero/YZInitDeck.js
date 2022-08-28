const Deck = require('card-deck');

/**
 * A Year Zero deck of cards.
 * Useful for initiative cards.
 * @extends {Deck} from module `card-deck`
 */
class YZInitDeck extends Deck {
	/**
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

	/**
	 * Loot cards: draw then discard.
	 * @param {number} numDraw Number of cards to draw
	 * @param {number} [numKeep=1] Number of cards to keep
	 * @param {?Function} fn Callback function to sort the best cards to keep
	 * @param {boolean} [shuffle=false] Wheter the discarded cards should be shuffled back into the deck
	 * @returns {number[]}
	 */
	loot(numDraw, numKeep = 1, fn = null, shuffle = false) {
		// Draws the cards.
		let cards = super.draw(numDraw);
		if (!Array.isArray(cards)) cards = [cards];

		// Sorts the cards.
		cards.sort(fn);

		// Keeps the cards.
		const keptCards = cards.splice(0, numKeep);

		// Shuffle the cards back if required.
		if (shuffle && cards.length > 0) {
			super.addToBottom(cards);
			super.shuffle();
		}
		// Returns the kept cards.
		return [keptCards, cards];
	}
}

module.exports = YZInitDeck;