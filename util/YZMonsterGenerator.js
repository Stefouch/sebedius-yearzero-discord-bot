const Util = require('./Util');
const GeneratorData = require('../commands/data/monster-generator.json');
const Muts = require('../commands/data/mutations.list.json');

class YZMonsterGenerator {
	constructor() {
		/**
		 * The name of the creature.
		 * @type {string}
		 */
		this.name = this.getElemFromParam('namePrefix')
			+ this.getElemFromParam('nameSuffix');

		/**
		 * The gender of the creature.
		 * @type {string}
		 */
		this.gender = this.getElemFromParam('gender');

		/**
		 * The creature's personality trait.
		 * @type {string}
		 */
		this.personality = this.getMultipleElemFromParam('traits').join(', ');

		/**
		 * The creature's favorite place of wandering.
		 * @type {string}
		 */
		this.locationDescription = this.getElemFromParam('location');

		// Number of creatures.
		const numbersElem = this.getElemFromParam('numbers');
		/**
		 * The creature's quantity verbose description.
		 * @type {string}
		 */
		this.qtyDescription = numbersElem[0];
		/**
		 * How many creatures are spawning.
		 * * Swarms have qty `-1`
		 * @type {number}
		 */
		this.qty = +Util.parseRoll(numbersElem[1]);

		/**
		 * List of mutations the creature have.
		 */
		this.mutations = this.createMutations(this.getElemFromParam('mutations'));

		// The size of the creature.
		const sizeElem = this.getElemFromParam('size');
		/**
		 * The creature's size verbose description.
		 * @type {string[2]}
		 */
		this.sizeDescription = sizeElem[0];
		/**
		 * The creature's Strength.
		 * @type {number}
		 */
		this.str = +sizeElem[1];

		// The type of the creature.
		const typeElem = this.getElemFromParam('type');
		/**
		 * The creature's type verbose description.
		 * @type {string}
		 */
		this.typeDescription = typeElem[0];
		/**
		 * The creature's Agility.
		 * @type {number}
		 */
		this.agi = +typeElem[1];

		// The body and shape of the creature.
		const bodyElem = this.getElemFromParam('body');
		/**
		 * The creature's body/shape verbose description.
		 * @type {string}
		 */
		this.bodyDescription = bodyElem[0];
		/**
		 * The creature's Armor Rating.
		 * @type {number}
		 */
		this.armor = +bodyElem[1];

		/**
		 * Number of legs for the creature.
		 * @type {string}
		 */
		this.limbsDescription = this.getElemFromParam('limbs');

		/**
		 * The skills of the creature.
		 * @type {object}
		 */
		this.skills = this.createSkills();

		/**
		 * The creature's attacks.
		 * @type {Object}
		 */
		this.attacks = this.createAttacks();
	}

	/**
	 * Creates an array with one or more attack object.
	 * @returns {object[]}
	 */
	createAttacks() {
		const attacks = [];
		const fetchedAttacks = this.getMultipleElemFromParam('weapons');

		// Processes the damage.
		for (const attack of fetchedAttacks) {
			if (attack.damage instanceof Array) {
				if (this.str > attack.damage.length) attack.damage = attack.damage.pop();
				else attack.damage = attack.damage[this.str];
			}
			else if (typeof attack.damage === 'object' && attack.damage !== null) {
				const roll = Util.parseRoll(attack.damage.roll);
				const data = attack.damage.data;
				attack.damage = this.getElemFromData(roll, data);
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
		const fetchedSkills = this.getElemFromParam('skills');

		for (const skill of fetchedSkills) {
			skills[skill] = this.getElemFromParam('skillLevels');
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

	/**
	 * Gets at random an element from a specified parameter of the GeneratorData JSON file.
	 * @param {string} param The parameter to search
	 * @returns {*} Can be anything
	 * @throws {RangeError} If the parameter wasn't found in the GeneratorData JSON file
	 */
	getElemFromParam(param) {
		// Exits early and throws an error if the parameter doesn't exist.
		if (!GeneratorData.hasOwnProperty(param)) throw new RangeError(`Parameter "${param}" not found!`);

		// Rolls the parameter and finds the element.
		const roll = Util.parseRoll(GeneratorData[param].roll);
		const data = GeneratorData[param].data;
		const elem = this.getElemFromData(roll, data);

		return elem;
	}

	/**
	 * Gets at random one or more elements from a specified parameter of the GeneratorData JSON file.
	 * If the element is a number, more elements of that number will be fetched.
	 * @param {string} param The parameter to search
	 * @param {number} [count=1] How many elements to fetch.
	 * @returns {Array<*>} An array of elements
	 */
	getMultipleElemFromParam(param, count = 1) {
		const elems = new Set();

		// Performs cycles.
		while (count > 0) {
			const elem = this.getElemFromParam(param);

			if (typeof elem === 'number') count += elem;
			else if (elems.has(elem)) count++;
			else elems.add(elem);
			count--;
		}

		return Array.from(elems);
	}

	/**
	 * Gets an element by seed from seeded data.
	 * @param {number} roll The roll's seed
	 * @param {Object} data The seeded data
	 * @returns {*} Can be anything
	 */
	getElemFromData(roll, data) {
		let elem;

		for (let i = roll; i > 0; i--) {
			if (i in data && roll >= i) {
				elem = data[i];
				break;
			}
		}
		return elem;
	}
}

module.exports = YZMonsterGenerator;