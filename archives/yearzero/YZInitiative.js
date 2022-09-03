const YZInitDeck = require('./YZInitDeck');
const { Collection } = require('discord.js');
const { closest, clamp } = require('../utils/Util');

/**
 * A Discord Collection (extends Map) with initiative slots.
 * K: {number} initiative value.
 * V: {string} Combatant's reference (ID).
 * @extends {Collection}
 */
module.exports = class YZInitiative extends Collection {
	/**
	 * @param {?Iterable} data Array of Key-Value pairs
	 * @param {?number[]} initiativeCards Specified initiative cards
	 */
	constructor(data, initiativeCards = YZInitDeck.INITIATIVE_CARDS) {
		super(data);
		this.initiativeDeck = new YZInitDeck(initiativeCards);
	}

	get min() { return this.size ? Math.min(...this.keys()) : null; }
	get max() { return this.size ? Math.max(...this.keys()) : null; }

	/**
	 * The values in the initiative list.
	 * @type {string[]}
	 */
	get slots() {
		return [...this.keys()].sort((a, b) => a - b);
	}

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
			const i = Number.isInteger(init) ? init + 0.5 : init + 0.01;
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
		if (!this.size) return null;

		let slotIndex;
		if (!current) { slotIndex = 0; }
		else {
			slotIndex = this.slots.indexOf(current);
			if (slotIndex < 0) {
				const slot = closest(current, this.slots);
				slotIndex = this.slots.indexOf(slot);
			}
			if (slotIndex + 1 >= this.size) slotIndex = 0;
			else slotIndex++;
		}
		return this.slots[slotIndex];
	}

	/**
	 * Returns the previous initiative value before the current one
	 * @param {number} current The current value
	 * @returns {number}
	 */
	previous(current) {
		if (!this.size) return null;

		let slotIndex;
		if (!current) { slotIndex = 0; }
		else {
			slotIndex = this.slots.indexOf(current);
			if (slotIndex < 0) {
				const slot = closest(current, this.slots);
				slotIndex = this.slots.indexOf(slot);
			}
			if (slotIndex - 1 < 0) slotIndex = this.size - 1;
			else slotIndex--;
		}
		return this.slots[slotIndex];
	}

	/**
	 * Draws initiative cards.
	 * @param {number} speed The quantity of initiative cards to draw
	 * @param {?number} loot The quantity of initiative cards drawn to keep 1
	 * @return {number[]}
	 */
	drawInit(speed = 1, loot = null) {
		// Min 1 card, Max 10 cards.
		const numKeep = clamp(speed, 1, 10);
		const numDraw = clamp(loot, 1, 10);

		// If more cards are drawn that the remaining number,
		// draws the remaining cards and shuffle a new deck for the lasts.
		const sortFn = (a, b) => a - b;
		const cards = [];

		for (let i = 0; i < numKeep; i++) {
			if (numDraw <= this.initiativeDeck.size) {
				if (loot > 1) {
					cards.push(...this.initiativeDeck.loot(numDraw, 1, sortFn, true));
				}
				else {
					cards.push(this.initiativeDeck.draw());
				}
			}
			else {
				let remainingCards = this.initiativeDeck.draw(this.initiativeDeck.size);
				if (!Array.isArray(remainingCards)) remainingCards = [remainingCards];

				this.initiativeDeck = new YZInitDeck();
				this.initiativeDeck.addToTop(remainingCards);

				if (loot > 1) {
					cards.push(...this.initiativeDeck.loot(numDraw, 1, sortFn, true));
				}
				else {
					cards.push(this.initiativeDeck.draw());
				}
			}
		}
		return cards;

		/* if (numDraw <= size && loot <= size) {
			if (!loot) cards = this.initiativeDeck.draw(drawQty);
			else cards = this.initiativeDeck.loot(drawQty, loot, (a, b) => b - a, true);
		}
		else {
			let remainingCards;
			if (!loot) remainingCards = this.initiativeDeck.draw(drawQty) || [];
			else cards = this.initiativeDeck.loot(drawQty, loot, (a, b) => b - a, true) || [];

			if (!Array.isArray(remainingCards)) remainingCards = [remainingCards];
			this.initiativeDeck = new YZInitDeck();
			const extraCards = this.drawInit(drawQty - size, loot);
			cards = extraCards.concat(remainingCards);
		}
		// Always returns an array.
		if (!cards) throw new InitError('Drew a null number of initiative cards!');
		if (!Array.isArray(cards)) return [cards];
		return cards;//*/
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
	}
};

class InitError extends Error {
	constructor(message) {
		super(message);
		this.name = 'InitError';
	}
}
