const Util = require('../utils/Util');
const YZInitDeck = require('./YZInitDeck');
const { Collection } = require('discord.js');

module.exports = class YZInitiative extends Collection {

	/**
	 * A Discord Collection (extends Map) with initiative slots.
	 * K: {number} initiative value.
	 * V: {string} Combatant's reference (ID).
	 * @type {Discord.Collection}
	 * @param {?Iterable} data Array of Key-Value pairs
	 * @param {?number[]} initiativeCards Specified initiative cards
	 */
	constructor(data, initiativeCards = YZInitDeck.INITIATIVE_CARDS) {
		super(data);
		this.initiativeDeck = new YZInitDeck(initiativeCards);
	}

	get min() { return Math.min(...this.keyArray()); }
	get max() { return Math.max(...this.keyArray()); }

	/**
	 * The values in the initiative list.
	 * @type {string[]}
	 *
	get initiativeValues() {
		return this.keyArray();
	}//*/

	// ---------- INITIATIVES -------------------------------------
	// ============================================================

	/**
	 * Adds one or more initiative slots for a Combatant.
	 * @param {string} ref The Combatant's ID
	 * @param {number[]} inits An array of initiative values
	 * @returns {string}
	 * @throws {InitError}
	 */
	addInitiative(ref, inits) {
		if (!this.isValidCombatantRef(ref)) throw new InitError(`Add-Initiative: "${ref.toString()}" is a bad ID!`);
		if (!Array.isArray(inits)) return this.addInitiative(ref, [inits]);

		// Iterates over all initiative values.
		for (const init of inits) {
			// Validates.
			if (typeof init !== 'number') throw new InitError(`Add-Initiative: "${init}" is not a valid initiative!`);
			// Creates the initiative slot if it doesn't exist.
			// Adds a float to avoid duplicates.
			const i = Number.isInteger(init) ? init + 0.05 : init + 0.001;
			if (this.has(i)) {
				// Run the function again if it already exists,
				// it will cause the addition of extra decimals.
				this.addInitiative(ref, [i]);
			}
			else {
				this.set(i, ref);
			}
		}
		return ref;
	}

	editInitiative(ref, oldInits, newInits) {
		this.removeInitiative(ref, oldInits);
		this.addInitiative(ref, newInits);
	}

	/**
	 * Removes one or more Combatant's initiative slots.
	 * @param {string} ref The Combatant's ID
	 * @param {?number[]} init An array with the initiative slot(s) to remove
	 * @returns {number} The number of times it has been removed (should be 1)
	 */
	removeInitiative(ref, inits) {
		if (!inits) return this.removeAllInitiatives(ref);
		if (!Array.isArray(inits)) return this.removeInitiative(ref, [inits]);
		let count = 0;
		for (const init of inits) {
			count += this.sweep((v, k) => {
				const i = Math.floor(k);
				return (i === init && v === ref);
			});
		}
		return count;
	}

	/**
	 * Removes all initiative slots for a Combatant.
	 * @param {string} ref The Combatant's ID
	 * @returns {number} The number of times it has been removed (should be 1)
	 */
	removeAllInitiatives(ref) {
		return this.sweep(v => v === ref);
	}

	/**
	 * Returns the next
	 * @param {number} current The current value
	 *
	nextInitiative(current) {
		return this.get(this.next(current));
	}//*/

	// ---------- OTHER -------------------------------------------
	// ============================================================

	/**
	 * Returns the next initiative value after the current one
	 * @param {number} current The current value
	 * @returns {number}
	 */
	next(current) {
		let index;
		const initValues = this.keyArray();
		if (initValues.length) {
			const init = Util.closest(current, initValues);
			index = initValues.indexOf(init);
			if (!index) index = 0;
			if (index + 1 >= initValues.length) index = 0;
			else index++;
			return initValues[index];
		}
		return null;
	}

	/**
	 * Returns the previous initiative value before the current one
	 * @param {number} current The current value
	 * @returns {number}
	 */
	previous(current) {
		let index;
		const initValues = this.keyArray();
		if (initValues.length) {
			const init = Util.closest(current, initValues);
			index = initValues.indexOf(init);
			if (!index) index = 0;
			if (index - 1 <= 0) index = initValues.length;
			else index--;
			return initValues[index];
		}
		return null;
	}

	/**
	 * Tells if this is a valid Combatant's ID.
	 * @param {string} ref The ID to check
	 * @returns {boolean}
	 */
	isValidCombatantRef(ref) {
		return (typeof ref === 'string' && ref.length === 6);
	}

	/**
	 * Draws initiative cards.
	 * @param {number} speed The quantity of initiative cards to draw
	 * @return {number[]}
	 */
	static drawInit(speed = 1) {
		// Min 1 card, Max 10 cards.
		const drawQty = Util.clamp(speed, 1, 10);

		// If more cards are drawn that the remaining number,
		// draws the remaining cards and shuffle a new deck for the lasts.
		const size = this.initiativeDeck.size;
		let cards;
		if (drawQty <= size) {
			cards = this.initiativeDeck.draw(drawQty);
		}
		else {
			const remainingCards = this.initiativeDeck.draw(size);
			this.initiativeDeck = new YZInitDeck();
			const extraCards = YZInitiative.drawInit(drawQty - size);
			cards = remainingCards.concat(extraCards);
		}
		// Always returns an array.
		if (!cards) throw new InitError('Drew a null number of initiative cards!');
		if (!Array.isArray(cards)) return [cards];
		return cards;
	}

	/**
	 * Strip initiative from its decimals.
	 * @param {number} init The initiative to round
	 * @returns {Object} { int, dec }
	 * @property {number} int Integer
	 * @property {number} dec Decimals
	 */
	static stripInitiative(init) {
		const rounded = Math.floor(init);
		const decimal = init - rounded;
		return { int: rounded, dec: decimal };
	}

	stringifyMapObject() {
		return JSON.stringify(Array.from(this.entries()));
		return new Map(JSON.parse('text'));
	}
};

class InitError extends Error {
	constructor(message) {
		super(message);
		this.name = 'InitError';
	}
}