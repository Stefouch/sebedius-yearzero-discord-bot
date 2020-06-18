class YZCrit {

	/**
	 * A Year Zero Critical Injury object.
	 * @param {Object} data Critical data
	 * @throws {Error} If no data was given
	 */
	constructor(data) {
		if (!data) throw new Error('No data given to create this Crit');

		/**
		 * The reference in the Criticals table (D66).
		 * @type {number}
		 */
		this.ref = +data.ref || 0;

		/**
		 * The Critical Injury (name).
		 * @type {string}
		 */
		this.injury = data.injury || '[ERR:No_Name_Found]';

		/**
		 * Tells if the injury is lethal.
		 * @type {boolean}
		 */
		this.lethal = Boolean(data.lethal) || false;

		/**
		 * The malus to `HEAL` skill rolls.
		 * @type {number}
		 */
		this.healMalus = +data.healMalus || 0;

		/**
		 * The duration before you die from the injury.
		 * @type {number}
		 * @see timeLimitUnit
		 */
		this.timeLimit = +data.timeLimit || 0;

		/**
		 * The units for the timeLimit duration.
		 * @type {string}
		 * @see timeLimit
		 */
		this.timeLimitUnit = data.timeLimitUnit || null;

		/**
		 * The effects of the injury.
		 * @type {string}
		 */
		this.effect = data.effect || '[ERR:No_Effect_Found]';

		/**
		 * Healing time for the injury.
		 * @type {number}
		 */
		this.healingTime = +data.healingTime || 0;
	}

	/**
	 * The name of the Critical Injury.
	 * @type {string}
	 * @readonly
	 */
	get name() {
		return this.injury;
	}

	/**
	 * Tells if the Critical Injury is fatal (instant death).
	 * @type {boolean}
	 * @readonly
	 */
	get fatal() {
		return this.lethal && this.healingTime <= 0;
	}
}

module.exports = YZCrit;