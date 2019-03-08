const YZGenerator = require('./YZGenerator');
const MonsterData = require('../data/monster-generator.json');
const Muts = require('../data/mutations.list.json');
const { RollParser } = require('./RollParser');
const Util = require('./Util');

class MYZMonsterGenerator extends YZGenerator {
	constructor() {
		super(MonsterData);
		/**
		 * The name of the creature.
		 * @type {string}
		 */
		this.name = super.get('namePrefix')
			+ super.get('nameSuffix');

		/**
		 * The gender of the creature.
		 * @type {string}
		 */
		this.gender = super.get('gender');

		// ===================== CREATURE'S DESCRIPTIONS ======================

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
		this.descriptions.traits = super.getAll('traits');

		/**
		 * The creature's favorite place of wandering.
		 * @type {string}
		 */
		this.descriptions.location = super.get('location');

		// ======================= NUMBER OF CREATURES ========================
		const numbersElem = super.get('numbers');

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
		this.qty = RollParser.parse(numbersElem[1]);

		/**
		 * List of mutations the creature have.
		 */
		this.mutations = this.getMutations(super.get('mutations'));

		// ========================= CREATURE'S SIZE ==========================
		const sizeElem = super.get('size');

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

		// ========================= CREATURE'S TYPE ==========================
		const typeElem = super.get('type');
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

		// =========================== BODY & SHAPE ===========================
		const bodyElem = super.get('body');

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
		this.descriptions.limbs = super.get('limbs');

		// ======================== CREATURE'S SKILLS =========================

		/**
		 * The skills of the creature.
		 * @type {object}
		 */
		this.skills = this.createSkills();

		// ======================== CREATURE'S ATTACKS ========================

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
	 * Tells if the creature is alone.
	 * @type {boolean}
	 * @readonly
	 */
	get loner() { return (this.qty === 1); }

	/**
	 * Tells if the creature has melee attacks.
	 * @type {boolean}
	 * @readonly
	 */
	get melee() {
		for (const atq of this.attacks) {
			if (atq.range === 'Arm') return true;
		}
		return false;
	}

	/**
	 * Tells if the creature has ranged attacks.
	 * @type {boolean}
	 * @readonly
	 */
	get ranged() {
		for (const atq of this.attacks) {
			if (atq.range !== 'Arm') return true;
		}
		return false;
	}

	/**
	 * Creates an array with one or more attack object.
	 * @returns {Object[]}
	 */
	createAttacks() {
		const attacks = [];
		const fetchedAttacks = super.getAll('weapons');

		// Processes the damage.
		for (const attack of fetchedAttacks) {
			if (attack.damage instanceof Array) {
				if (this.str > attack.damage.length) attack.damage = attack.damage.pop();
				else attack.damage = attack.damage[this.str];
			}
			attacks.push(attack);
		}

		return attacks;
	}

	/**
	 * Creates an object with "skillName: level".
	 * @returns {Object} Returns null if empty
	 */
	createSkills() {
		const skills = {};
		const fetchedSkills = super.getAll('skills');

		for (const name of fetchedSkills) {
			skills[name] = super.rollData(Util.rollD66(), super.get('skillLevels'));
		}

		return (Object.entries(skills).length) ? skills : null;
	}

	/**
	 * Gets one or more mutations in an array.
	 * @param {number} [qty=1] Quantity of mutations to return
	 * @returns {string[]} Returns null if empty
	 */
	getMutations(qty = 1) {
		// Loads the list of mutations.
		// Uses a Set object to avoid duplicates.
		const mutations = new Set();
		for (const category in Muts) for (const m of Muts[category]) mutations.add(m);

		const fetchedMutations = [];
		for (let i = 0; i < qty; i++) fetchedMutations.push(Util.random(mutations));

		return (fetchedMutations.length) ? fetchedMutations : null;
	}
}

module.exports = MYZMonsterGenerator;