/**
 * Data structure that makes it easy to interact with an emblem.
 */
class Emblem {
	/**
	 * @param {EmblemResolvable} [bits=0] Bit(s) to read from
	 */
	constructor(bits) {
		/**
		 * Bitfield of the packed bits
		 * @type {number}
		 */
		this.emblem = this.constructor.resolve(bits);
	}

	/**
	 * Checks whether the emblem has a bit, or any of multiple bits.
	 * @param {EmblemResolvable} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	any(bit) {
		return (this.emblem & this.constructor.resolve(bit)) !== 0;
	}

	/**
	 * Checks if this emblem equals another
	 * @param {EmblemResolvable} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	equals(bit) {
		return this.emblem === this.constructor.resolve(bit);
	}

	/**
	 * Checks whether the emblem has a bit, or multiple bits.
	 * @param {EmblemResolvable} bit Bit(s) to check for
	 * @returns {boolean}
	 */
	has(bit) {
		if (Array.isArray(bit)) return bit.every(p => this.has(p));
		bit = this.constructor.resolve(bit);
		return (this.emblem & bit) === bit;
	}

	/**
	 * Gets all given bits that are missing from the emblem.
	 * @param {EmblemResolvable} bits Bit(s) to check for
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	missing(bits, ...hasParams) {
		if (!Array.isArray(bits)) bits = new this.constructor(bits).toArray(false);
		return bits.filter(p => !this.has(p, ...hasParams));
	}

	/**
	 * Freezes these bits, making them immutable.
	 * @returns {Readonly<Emblem>} These bits
	 */
	freeze() {
		return Object.freeze(this);
	}

	/**
	 * Adds bits to these ones.
	 * @param {...EmblemResolvable} [bits] Bits to add
	 * @returns {Emblem} These bits or new Emblem if the instance is frozen.
	 */
	add(...bits) {
		let total = 0;
		for (const bit of bits) {
			total |= this.constructor.resolve(bit);
		}
		if (Object.isFrozen(this)) return new this.constructor(this.emblem | total);
		this.emblem |= total;
		return this;
	}

	/**
	 * Removes bits from these.
	 * @param {...EmblemResolvable} [bits] Bits to remove
	 * @returns {Emblem} These bits or new Emblem if the instance is frozen.
	 */
	remove(...bits) {
		let total = 0;
		for (const bit of bits) {
			total |= this.constructor.resolve(bit);
		}
		if (Object.isFrozen(this)) return new this.constructor(this.emblem & ~total);
		this.emblem &= ~total;
		return this;
	}

	/**
	 * Gets an object mapping field names to a {@link boolean} indicating whether the
	 * bit is available.
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {Object}
	 */
	serialize(...hasParams) {
		const serialized = {};
		for (const [flag, bit] of Object.entries(this.constructor.RANKS)) serialized[flag] = this.has(bit, ...hasParams);
		return serialized;
	}

	/**
	 * Gets an {@link Array} of emblem names based on the bits available.
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	toArray(...hasParams) {
		return Object.keys(this.constructor.RANKS).filter(bit => this.has(bit, ...hasParams));
	}

	toString() {
		return `Emblem [ ${this.toArray().join(' | ')} ]`;
	}

	toJSON() {
		return this.emblem;
	}

	valueOf() {
		return this.emblem;
	}

	*[Symbol.iterator]() {
		yield* this.toArray();
	}

	/**
	 * Data that can be resolved to give an emblem. This can be:
	 * * A string (see {@link Emblem.RANKS})
	 * * A bit number
	 * * An instance of Emblem
	 * * An Array of EmblemResolvable
	 * @typedef {string|number|Emblem|EmblemResolvable[]} EmblemResolvable
	 */

	/**
	 * Resolves emblems to their numeric form.
	 * @param {EmblemResolvable} [bit=0] - bit(s) to resolve
	 * @returns {number}
	 */
	static resolve(bit = 0) {
		if (typeof bit === 'number' && bit >= 0) return bit;
		if (bit instanceof Emblem) return bit.emblem;
		if (Array.isArray(bit)) return bit.map(p => this.resolve(p)).reduce((prev, p) => prev | p, 0);
		if (typeof bit === 'string' && typeof this.RANKS[bit] !== 'undefined') return this.RANKS[bit];
		const error = new RangeError('EMBLEM_INVALID');
		error.bit = bit;
		throw error;
	}
}

/**
 * Numeric emblem RANKS.
 * <info>Defined in extension classes</info>
 * @type {Object}
 * @abstract
 */
Emblem.RANKS = {};

module.exports = Emblem;