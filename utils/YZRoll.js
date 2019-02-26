const { rand } = require('./utils.js');

class YZRoll {
	/**
	 * A Year Zero Roll object.
	 * @param {string} author The author of the roll
	 * @param {DicePool} diceData Dice data (see DicePool)
	 * @param {string} [title=null] The title/name of the roll
	 */
	constructor(author, diceData, title = null) {
		/**
		 * The author of the roll.
		 * @name YZRoll#author
		 * @type {string}
		 * @readonly
		 */
		Object.defineProperty(this, 'author', { value: author });

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

		if (diceData) this.setup(diceData);
	}

	setup(diceData) {
		/**
		 * The dice of the roll.
		 * @type {Object<number[]>}
		 */
		this.dice = { base: [], skill: [], neg: [], gear: [] };
		for (const type in this.dice) {
			const qty = +diceData[type] || 0;
			for (let d = 0; d < qty; d++) this.dice[type].push(rand(1, 6));
		}

		/**
		 * The artifact die of the roll.
		 * @type {Object}
		 */
		this.artifactDie = {
			size: Number(diceData.artifactDie),
			result: 0,
			get success() { return ARTIFACT_STUNTS[this.result]; },
		};
		this.rollArtifactDie();

		/**
		 * The quantity of dice keeped between pushes.
		 * @type {Object<number>}
		 */
		this.keeped = { base: 0, skill: 0, neg: 0, gear: 0 };
	}

	/**
	 * The quantity of sixes (successes).
	 * *(Don't forget to roll the Artifact Die before counting successes.)*
	 * @type {number}
	 * @readonly
	 */
	get sixes() {
		return YZRoll.count(6, this.dice.base)
			+ YZRoll.count(6, this.dice.skill)
			+ YZRoll.count(6, this.dice.gear)
			- YZRoll.count(6, this.dice.neg)
			+ this.artifactDie.success;
	}

	/**
	 * The quantity of traumas ("1" on skill dice).
	 * @type {number}
	 * @readonly
	 */
	get attributeTrauma() {
		return (this.pushed > 0) ? YZRoll.count(1, this.dice.base) : 0;
	}

	/**
	 * The quantity of gear damage ("1" on gear dice).
	 * @type {number}
	 * @readonly
	 */
	get gearDamage() {
		return (this.pushed > 0) ? YZRoll.count(1, this.dice.gear) : 0;
	}

	/**
	 * Tells if there are negative dice.
	 * @type {boolean}
	 * @readonly
	 */
	get hasNegative() {
		return this.dice.neg.length > 0;
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
		}
	}

	/**
	 * Gets the total number of dice in the roll.
	 * @returns {number}
	 * @readonly
	 */
	get size() {
		return this.dice.base.length
			+ this.dice.skill.length
			+ this.dice.gear.length
			+ this.dice.neg.length;
	}

	/**
	 * Pushes the roll, following the MYZ rules.
	 * @returns {YZRoll} The pushed roll.
	 */
	push() {
		// Indications before pushing.
		this.keeped = {
			base: YZRoll.count(6, this.dice.base) + YZRoll.count(1, this.dice.base),
			skill: YZRoll.count(6, this.dice.skill),
			neg: YZRoll.count(6, this.dice.neg),
			gear: YZRoll.count(6, this.dice.gear) + YZRoll.count(1, this.dice.gear),
		};

		this.pushed++;

		// Pushing.
		for (const type in this.dice) {
			const rolledDice = this.dice[type];
			const diceQty = rolledDice.length;

			if (diceQty) {
				const filteredDice = rolledDice.filter(value => {
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
		this.updateTimestamp();

		return this;
	}

	/**
	 * Gets the sum of the dice of a certain type.
	 * @param {string} [type='BASE'] "base", "skill", "gear" or "neg/negative" (default is "base")
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
	 * @param {string} [type='BASE'] "base", "skill", "gear" or "neg/negative" (default is "base")
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
	 * @param {?number} [result=null] The result to evaluate (default is ArtifactDie.result)
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

	/**
	 * Counts the values in a roll.
	 * @param {number} face The value to count
	 * @param {Array<number>} rolledDice The rolled results
	 * @returns {number} The quantity of <face>
	 */
	static count(face, rolledDice) {
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
}

module.exports = YZRoll;

/**
 * Number of stunts according to the artifact die's face.
 * @type {Array<number>}
 */
const ARTIFACT_STUNTS = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4];

/**
 * Resolves a StringResolvable to a string.
 * @param {StringResolvable} data The string resolvable to resolve
 * @returns {string}
 */
function resolveString(data) {
	if (typeof data === 'string') return data;
	if (data instanceof Array) return data.join(', ');
	return String(data);
}

/**
 * @typedef {string|Array|*} StringResolvable
 * Data that can be resolved to give a string. This can be:
 * * A string
 * * An array (joined with a new line delimiter to give a string)
 * * Any value
 */

/**
 * @typedef {Object} DicePool
 * An object where you specify dice quantities.
 * * `base:` The quantity of base dice (yellow color)
 * * `skill:` The quantity of skill dice (green color)
 * * `gear:` The quantity of gear dice (black color)
 * * `neg:` The quantity of negative dice (red color)
 * * `artifactDie:` The size of an artifact die
 */