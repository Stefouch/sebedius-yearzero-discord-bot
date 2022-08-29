/**
 * Data structure that makes it easy to interact with an emblem.
 */
class Emblem {
	/**
	 * @param {EmblemResolvable} [ranks=0] Rank(s) to read from
	 */
	constructor(ranks) {
		/**
		 * Rankfield of the packed ranks
		 * @type {number}
		 */
		this.emblem = this.constructor.resolve(ranks);
	}

	/**
	 * Checks whether the emblem has a rank, or any of multiple ranks.
	 * @param {EmblemResolvable} rank Rank(s) to check for
	 * @returns {boolean}
	 */
	any(rank) {
		return (this.emblem & this.constructor.resolve(rank)) !== 0;
	}

	/**
	 * Checks if this emblem equals another
	 * @param {EmblemResolvable} rank Rank(s) to check for
	 * @returns {boolean}
	 */
	equals(rank) {
		return this.emblem === this.constructor.resolve(rank);
	}

	/**
	 * Checks whether the emblem has a rank, or multiple ranks.
	 * @param {EmblemResolvable} rank Rank(s) to check for
	 * @returns {boolean}
	 */
	has(rank) {
		if (Array.isArray(rank)) return rank.every(p => this.has(p));
		rank = this.constructor.resolve(rank);
		return (this.emblem & rank) === rank;
	}

	/**
	 * Gets all given ranks that are missing from the emblem.
	 * @param {EmblemResolvable} ranks Rank(s) to check for
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	missing(ranks, ...hasParams) {
		if (!Array.isArray(ranks)) ranks = new this.constructor(ranks).toArray(false);
		return ranks.filter(p => !this.has(p, ...hasParams));
	}

	/**
	 * Freezes these ranks, making them immutable.
	 * @returns {Readonly<Emblem>} These ranks
	 */
	freeze() {
		return Object.freeze(this);
	}

	/**
	 * Adds ranks to these ones.
	 * @param {...EmblemResolvable} [ranks] Ranks to add
	 * @returns {Emblem} These ranks or new Emblem if the instance is frozen.
	 */
	add(...ranks) {
		let total = 0;
		for (const rank of ranks) {
			total |= this.constructor.resolve(rank);
		}
		if (Object.isFrozen(this)) return new this.constructor(this.emblem | total);
		this.emblem |= total;
		return this;
	}

	/**
	 * Removes ranks from these.
	 * @param {...EmblemResolvable} [ranks] Ranks to remove
	 * @returns {Emblem} These ranks or new Emblem if the instance is frozen.
	 */
	remove(...ranks) {
		let total = 0;
		for (const rank of ranks) {
			total |= this.constructor.resolve(rank);
		}
		if (Object.isFrozen(this)) return new this.constructor(this.emblem & ~total);
		this.emblem &= ~total;
		return this;
	}

	/**
	 * Gets an object mapping field names to a {@link boolean} indicating whether the
	 * rank is available.
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {Object}
	 */
	serialize(...hasParams) {
		const serialized = {};
		for (const [flag, rank] of Object.entries(this.constructor.RANKS)) serialized[flag] = this.has(rank, ...hasParams);
		return serialized;
	}

	/**
	 * Gets an {@link Array} of emblem names based on the ranks available.
	 * @param {...*} hasParams Additional parameters for the has method, if any
	 * @returns {string[]}
	 */
	toArray(...hasParams) {
		return Object.keys(this.constructor.RANKS).filter(rank => this.has(rank, ...hasParams));
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
	 * * A rank number
	 * * An instance of Emblem
	 * * An Array of EmblemResolvable
	 * @typedef {string|number|Emblem|EmblemResolvable[]} EmblemResolvable
	 */

	/**
	 * Resolves emblems to their numeric form.
	 * @param {EmblemResolvable} [rank=0] - rank(s) to resolve
	 * @returns {number}
	 */
	static resolve(rank = 0) {
		if (typeof rank === 'number' && rank >= 0) return rank;
		if (rank instanceof Emblem) return rank.emblem;
		if (Array.isArray(rank)) return rank.map(p => this.resolve(p)).reduce((prev, p) => prev | p, 0);
		if (typeof rank === 'string' && typeof this.RANKS[rank] !== 'undefined') return this.RANKS[rank];
		const error = new RangeError('EMBLEM_INVALID');
		error.rank = rank;
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