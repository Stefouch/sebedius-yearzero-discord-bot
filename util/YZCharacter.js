/**
 * A Year Zero Character.
 * Can be a PC, a PNJ or a monster.
 */
class YZCharacter {
	/**
	 * Defines a character.
	 * @param {*} data The raw data of the character
	 */
	constructor(data) {
		/**
		 * The ID of the character.
		 * @type {number}
		 * @readonly
		 * @private
		 */
		Object.defineProperty(this, Symbol('id'), {
			value: Math.floor(Math.random() * Date.now()),
		});

		if (!data) throw new Error('No data entered for character!');

		/**
		 * The name of the character.
		 * @type {?string}
		 */
		this.name = data.name || null;

		/**
		 * The gender of the character.
		 * @type {?string}
		 */
		this.gender = data.gender || null;

		/**
		 * The kin/race/species of the character.
		 */
		this.kin = data.kin || null;

		/**
		 * The description of the character.
		 * @type {?string}
		 */
		this.description = data.description || null;

		/**
		 * The attributes of the character.
		 * @type {Object}
		 * @property {number} strength
		 * @property {number} agility
		 * @property {number} wits
		 * @property {number} empathy
		 */
		this.attributes = this.parseAttributes(data.attributes);

		/**
		 * The traumas of the character.
		 * @type {Object}
		 * @property {number} strength
		 * @property {number} agility
		 * @property {number} wits
		 * @property {number} empathy
		 */
		this.traumas = this.parseAttributes(0);

		/**
		 * The health's conditions of the character.
		 */
		this.conditions = {
			broken: false,
			starving: false,
			dehydrated: false,
			sleepless: false,
			hypothermic: false,
		};
		if (data.conditions) {
			for (const cond in data.conditions) {
				if (cond in this.conditions) {
					this.conditions[cond] = data.conditions[cond];
				}
			}
		}
		/**
		 * The critical injuries of the character.
		 * @type {string[]}
		 */
		this.crits = [];

		/**
		 * The skills of the character.
		 * @type {Object}
		 * @property {number} "skillName"
		 */
		this.skills = data.skills || {};

		/**
		 * The talents of the character.
		 * @type {string[]}
		 */
		this.talents = data.talents || [];

		/**
		 * The mutations of the character.
		 * @type {string[]}
		 */
		this.mutations = data.mutations || [];

		/**
		 * The mana points of the character
		 * @type {object}
		 * @property {number} mp Mutation
		 * @property {number} fp Feral
		 * @property {number} ep Energy
		 * @property {number} rp Reputation
		 */
		this.mana = {
			mp: data.mana.mp || 0,
			fp: data.mana.fp || 0,
			ep: data.mana.ep || 0,
			rp: data.mana.rp || 0,
		};

		/**
		 * The rot gauge of the character
		 * @type {number}
		 */
		this.rot = data.rot || 0;

		/**
		 * The number of permanent points.
		 * @type {number}
		 */
		this.permanentRot = data.permanentRot || 0;

		/**
		 * The gear of the character, listed in a Map object.
		 * * Key: item's name
		 * * Value: item's weight
		 *  * 0 = tiny item
		 *  * 0.1–1.9 = standard item
		 *  * 2+ = heavy item
		 * @type {Map}
		 */
		this.gear = new Map(data.gear);
	}

	parseAttributes(data) {
		let str = 0, agi = 0, wit = 0, emp = 0;
		if (typeof data === 'number') {
			str = agi = wit = emp = data;
		}
		else if (data instanceof Array) {
			if (data.length === 4) [str, agi, wit, emp] = data;
			else throw new RangeError('Attributes array\'s length must be 4!');
		}
		else if (typeof data === 'object' && data !== null) {
			str = data.strength || 0;
			agi = data.agility || 0;
			wit = data.wits || 0;
			emp = data.empathy || 0;
		}
		return {
			strength: Math.max(str, 0),
			agility: Math.max(agi, 0),
			wits: Math.max(wit, 0),
			empathy: Math.max(emp, 0),
		};
	}

	// Attributes shortcuts
	/* get str() { return this.attributes.strength; }
	set str(val) { if(typeof val === 'number') this.attributes.strength = val; }
	get agi() { return this.attributes.agility; }
	set agi(val) { if(typeof val === 'number') this.attributes.agility = val; }
	get wit() { return this.attributes.wits; }
	set wit(val) { if(typeof val === 'number') this.attributes.wits = val; }
	get emp() { return this.attributes.empathy; }
	set emp(val) { if(typeof val === 'number') this.attributes.empathy = val; } */
}

module.exports = YZCharacter;