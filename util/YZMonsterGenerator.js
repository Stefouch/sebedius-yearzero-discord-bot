const YZGenerator = require('./YZGenerator');
const GeneratorData = require('../data/monster-generator.json');
const Muts = require('../data/mutations.list.json');
const Util = require('./Util');

class YZMonsterGenerator extends YZGenerator {
	constructor() {
		super(GeneratorData);
		/**
		 * The name of the creature.
		 * @type {string}
		 */
		this.name = super.getElemFromParam('namePrefix')
			+ super.getElemFromParam('nameSuffix');

		/**
		 * The gender of the creature.
		 * @type {string}
		 */
		this.gender = super.getElemFromParam('gender');

		/**
		 * Holds verbose descriptions for the creature.
		 * @type {Object}
		 * @property {string} personality
		 */
		this.descriptions = {};

		/**
		 * The creature's personality trait(s) in an Array.
		 * @type {string[]}
		 */
		this.descriptions.traits = super.getMultipleElemFromParam('traits');

		/**
		 * The creature's favorite place of wandering.
		 * @type {string}
		 */
		this.descriptions.location = super.getElemFromParam('location');

		// Number of creatures.
		const numbersElem = super.getElemFromParam('numbers');
		/**
		 * The creature's quantity verbose description.
		 * @type {string}
		 */
		this.descriptions.number = numbersElem[0];
		/**
		 * How many creatures are spawning.
		 * * Swarms have qty `-1`
		 * @type {number}
		 */
		this.qty = +Util.parseRoll(numbersElem[1]);

		/**
		 * List of mutations the creature have.
		 */
		this.mutations = this.createMutations(super.getElemFromParam('mutations'));

		// The size of the creature.
		const sizeElem = super.getElemFromParam('size');
		/**
		 * The creature's size verbose description.
		 * @type {string}
		 */
		this.descriptions.size = sizeElem[0];
		/**
		 * The creature's Strength.
		 * @type {number}
		 */
		this.str = +sizeElem[1];

		// The type of the creature.
		const typeElem = super.getElemFromParam('type');
		/**
		 * The creature's type verbose description.
		 * @type {string}
		 */
		this.descriptions.type = typeElem[0];
		/**
		 * The creature's Agility.
		 * @type {number}
		 */
		this.agi = +typeElem[1];

		// The body and shape of the creature.
		const bodyElem = super.getElemFromParam('body');
		/**
		 * The creature's body/shape verbose description.
		 * @type {string}
		 */
		this.descriptions.body = bodyElem[0];
		/**
		 * The creature's Armor Rating.
		 * @type {number}
		 */
		this.armor = +bodyElem[1];

		/**
		 * Number of legs for the creature.
		 * @type {string}
		 */
		this.descriptions.limbs = super.getElemFromParam('limbs');

		/**
		 * The skills of the creature.
		 * @type {object}
		 */
		this.skills = this.createSkills();

		/**
		 * The creature's attacks.
		 * @type {Object[]}
		 */
		this.attacks = this.createAttacks();
	}

	/**
	 * Tells if the creature is a swarm.
	 * @type {boolean}
	 * @readonly
	 */
	get swarm() { return (this.qty < 0); }

	/**
	 * Tells if the creature is a alone.
	 * @type {boolean}
	 * @readonly
	 */
	get loner() { return (this.qty === 1); }

	/**
	 * Creates an array with one or more attack object.
	 * @returns {Object[]}
	 */
	createAttacks() {
		const attacks = [];
		const fetchedAttacks = super.getMultipleElemFromParam('weapons');

		// Processes the damage.
		for (const attack of fetchedAttacks) {
			if (attack.damage instanceof Array) {
				if (this.str > attack.damage.length) attack.damage = attack.damage.pop();
				else attack.damage = attack.damage[this.str];
			}
			else if (typeof attack.damage === 'object' && attack.damage !== null) {
				const roll = Util.parseRoll(attack.damage.roll);
				const data = attack.damage.data;
				attack.damage = super.getElemFromData(roll, data);
			}
			attacks.push(attack);
		}

		return attacks;
	}

	/**
	 * Creates an object with "skillName: level".
	 * @returns {Object} Returns null if empty
	 * @property {number} skillName
	 */
	createSkills() {
		const skills = {};
		const fetchedSkills = super.getElemFromParam('skills');

		for (const skill of fetchedSkills) {
			skills[skill] = super.getElemFromParam('skillLevels');
		}

		return (Object.entries(skills).length) ? skills : null;
	}

	/**
	 * Gets one or more mutations in an array.
	 * @param {number} [qty=1] Quantity of mutations to return
	 * @returns {string[]} Returns null if empty
	 */
	createMutations(qty = 1) {
		// Loads the list of mutations.
		// Uses a Set object to avoid duplicates.
		const mutations = new Set();
		for (const category in Muts) for (const m of Muts[category]) mutations.add(m);

		const fetchedMutations = [];
		for (let i = 0; i < qty; i++) fetchedMutations.push(Util.random(mutations));

		return (fetchedMutations.length) ? fetchedMutations : null;
	}
}

module.exports = YZMonsterGenerator;