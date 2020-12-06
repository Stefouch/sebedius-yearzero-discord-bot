const { COMPENDIA } = require('../../utils/constants');

class BaseGear {
	constructor(data) {
		/**
		 * The name of the item.
		 * @type {string}
		 */
		this.name = data.name || '???';

		/**
		 * The source material of the item.
		 * @type {string}
		 */
		this.source = data.source || 'myz';

		/**
		 * Weight in inventory slot(s) for the item.
		 * @type {number}
		 */
		this.weight = data.weight;

		/**
		 * Additional comments.
		 * @type {string}
		 */
		this.comment = data.comment;

		/**
		 * List of bonuses confered by the gear.
		 * @type {Object<string, number>} { skillName1: bonus1, skillName2: bonus2 }
		 */
		this.bonuses = data.bonuses || {};
	}

	/**
	 * The code for the game of the object.
	 * @type {string}
	 * @readonly
	 */
	get game() {
		if (COMPENDIA[this.source]) return this.source;
		for (const game in COMPENDIA) {
			if (COMPENDIA[game].includes(this.source)) return game;
		}
		return undefined;
	}

	toRaw() {
		return {
			name: this.name,
			source: this.source,
			weight: this.weight,
			comment: this.comment,
			bonuses: this.bonuses,
		};
	}

	static fromRaw(raw) {
		return new this(raw);
	}

	toString() {
		return `${this.constructor.name} { ${this.name} }`;
	}
}

module.exports = BaseGear;