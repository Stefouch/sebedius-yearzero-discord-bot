const { rand } = require('./utils.js');

class YZRoll {
	constructor(author, baseDiceQty, skillDiceQty = 0, gearDiceQty = 0, negDiceQty = 0, artifactDieSize = 0, title = '') {
		/**
		 * The author of the roll.
		 * @type {string}
		 */
		this.author = author;

		/**
		 * The title/name of the roll.
		 * @type {StringResolvable}
		 */
		this.title = resolveString(title);

		/**
		 * The timestamp of the roll.
		 * @type {number}
		 */
		this.timestamp = 0;
		this.updateTimestamp();

		/**
		 * The number of times the roll was pushed.
		 * @type {number}
		 */
		this.pushed = 0;

		/**
		 * Tells if the roll can be pushed at will.
		 * @type {boolean}
		 */
		this.isFullAuto = false;

		/**
		 * The dice of the roll.
		 * @type {Object<(Array<number>, Array<number>, Array<number>, Array<number>)>}
		 */
		this.dice = { base: [], skill: [], neg: [], gear: [] };
		for (let b = 0; b < baseDiceQty; b++) { this.dice.base.push(rand(1, 6)); }
		for (let s = 0; s < skillDiceQty; s++) { this.dice.skill.push(rand(1, 6)); }
		for (let n = 0; n < negDiceQty; n++) { this.dice.neg.push(rand(1, 6)); }
		for (let g = 0; g < gearDiceQty; g++) { this.dice.gear.push(rand(1, 6)); }

		/**
		 * Tells if there are negative dice.
		 * @type {boolean}
		 */
		this.hasNegative = this.dice.neg.length > 0;

		/**
		 * The artifact die of the roll.
		 * @type {Object}
		 */
		this.artifactDie = {
			size: Number(artifactDieSize),
			result: 0,
			success: 0,
		};
		this.rollArtifactDie();

		/**
		 * The quantity of sixes.
		 * @type {number}
		 */
		this.sixes = this.getSixes();

		/**
		 * The quantity of traumas ("1").
		 * @type {number}
		 */
		this.attributeTrauma = 0;

		/**
		 * The quantity of gear damage ("1").
		 * @type {number}
		 */
		this.gearDamage = 0;

		/**
		 * The quantity of dice keeped between pushes.
		 * @type {Object<(number, number, number, number)>}
		 */
		this.keeped = { base: 0, skill: 0, neg: 0, gear: 0 };
	}

	/**
	 * Sets the Full Automatic Fire mode.
	 * @param {boolean} bool Full Auto yes or no
	 */
	setFullAuto(bool) {
		this.isFullAuto = bool;
	}

	/**
	 * Updates the timestamp of the roll.
	 */
	updateTimestamp() {
		this.timestamp = Date.now();
	}

	/**
	 * Rolls or rerolls the Artifact Die.
	 */
	rollArtifactDie() {
		if (this.artifactDie.size) {

			if (this.artifactDie.result < 6) {
				this.artifactDie.result = rand(1, this.artifactDie.size);
			}
			this.artifactDie.success = ARTIFACT_STUNTS[this.artifactDie.result];
		}
	}

	/**
	 * Gets the total number of dice in the roll.
	 * @returns {number} The total number of dice
	 */
	getDicePoolSize() {
		return this.dice.base.length
			+ this.dice.skill.length
			+ this.dice.gear.length
			+ this.dice.neg.length;
	}

	/**
	 * Gets the total number of successes.
	 * Don't forget to roll the Artifact Die before counting successes.
	 * @returns {number} The number of successes
	 */
	getSixes() {
		return myzCountResults(6, this.dice.base)
			+ myzCountResults(6, this.dice.skill)
			+ myzCountResults(6, this.dice.gear)
			- myzCountResults(6, this.dice.neg)
			+ this.artifactDie.success;
	}

	/**
	 * Pushes the roll, following the MYZ rules.
	 * @returns {YZRoll} The pushed roll.
	 */
	push() {
		// Indications before pushing.
		this.keeped = {
			base: myzCountResults(6, this.dice.base) + myzCountResults(1, this.dice.base),
			skill: myzCountResults(6, this.dice.skill),
			neg: myzCountResults(6, this.dice.neg),
			gear: myzCountResults(6, this.dice.gear) + myzCountResults(1, this.dice.gear),
		};

		this.pushed++;

		// Pushing.
		for (const type in this.dice) {
			const rolledDice = this.dice[type];
			const diceQty = rolledDice.length;

			if (diceQty) {
				const filteredDice = rolledDice.filter((value, index, arr) => {
					if (type === 'skill' || type === 'neg') {
						return value === 6;
					}
					else {
						return (value === 6 || value === 1);
					}
				});
				const newQty = diceQty - filteredDice.length;

				for (let i = 0; i < newQty; i++) {
					filteredDice.push(rand(1, 6));
				}

				this.dice[type] = filteredDice;
			}
		}
		this.rollArtifactDie();
		this.sixes = this.getSixes();
		this.attributeTrauma = myzCountResults(1, this.dice.base);
		this.gearDamage = myzCountResults(1, this.dice.gear);
		this.updateTimestamp();

		return this;
	}

	/**
	 * Gets the sum of the dice of a certain type.
	 * @param {string} type "base", "skill", "gear" or "neg/negative" (default is "base")
	 * @returns {number} The summed result
	 */
	sum(type = 'BASE') {
		type = type.toLowerCase();
		let result = 0;

		if (type === 'base' || type === 'skill' || type === 'gear'
			|| type === 'neg' || type === 'negative') {

			for (const value of this.dice[type]) {
				result += value;
			}
		}
		return result;
	}

	/**
	 * Gets the base-six sticky-result of the dice of a certain type.
	 * @param {string} type "base", "skill", "gear" or "neg/negative" (default is "base")
	 * @returns {number} The sticked result
	 */
	baseSix(type = 'BASE') {
		type = type.toLowerCase();
		let result = '';

		if (type === 'base' || type === 'skill' || type === 'gear'
			|| type === 'neg' || type === 'negative') {

			for (const value of this.dice[type]) {
				result += value;
			}
		}
		return Number(result);
	}

	/**
	 * Tells if the Resource Die lost one step.
	 * @param {number} result The result to evaluate (default is ArtifactDie.result)
	 * @returns {boolean} True if the Resource Die value <= 2 (lost a step)
	 */
	hasLostResourceStep(result = null) {
		if (result === null) return this.artifactDie.result <= 2;
		else return result <= 2;
	}

	/**
	 * Returns the description of the roll.
	 * @returns {string} The roll described in one sentence
	 */
	toString() {
		let str = `${(this.title) ? `${this.title} ` : ''}Roll${(this.pushed) ? ' (pushed)' : ''}:`;
		str += ` base[${this.dice.base.toString()}], skill[${this.dice.skill.toString()}], gear[${this.dice.gear.toString()}]`;
		if (this.hasNegative) str += `, neg[${this.dice.neg.toString()}]`;
		if (this.artifactDie.size) str += `, D${this.artifactDie.size} (${this.artifactDie.result})`;

		return str;
	}
}

module.exports = YZRoll;

/**
 * Number of stunts according to the artifact die's face.
 * @type {Array<number>}
 */
const ARTIFACT_STUNTS = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];

/**
 * Counts the values in a roll.
 * @param {number} face The value to count
 * @param {Array<number>} rolledDice The rolled results
 * @returns {number} The quantity of <face>
 */
function myzCountResults(face, rolledDice) {
	let count = 0;

	// Counts only if there is something to count.
	if (rolledDice.length) {

		for (const dieValue of rolledDice) {

			if (dieValue === face) {
				count++;
			}
		}
	}
	return count;
}

/**
 * Resolves a string.
 * @param {StringResolvable} data The data to resolve into a string
 * @returns {string} The string resolved
 */
function resolveString(data) {
	if (typeof data === 'string') return data;
	if (data instanceof Array) return data.join(', ');
	return String(data);
}