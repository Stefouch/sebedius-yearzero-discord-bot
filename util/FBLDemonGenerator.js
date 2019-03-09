const YZGenerator = require('./YZGenerator');
const DemonData = require('../data/demon-generator.json');
const { RollParser } = require('./RollParser');
const Util = require('./Util');

class FBLDemonGenerator extends YZGenerator {
	constructor() {
		super(DemonData);
		/**
		 * The name of the creature.
		 * @type {string}
		 *
		this.name;//*/

		/**
		 * The gender of the creature.
		 * @type {string}
		 *
		this.gender;//*/

		// =========================== DEMON'S FORM ===========================
		const formObj = super.get('form');

		/**
		 * The Demon's form.
		 * @type {string}
		 */
		this.form = formObj.form;

		/**
		 * Form effect.
		 * @type {string}
		 */
		this.formEffect = formObj.effect || null;

		/**
		 * Demon's attributes.
		 * @type {Object}
		 * @property {number[]} attr [str, agi, wit, emp]
		 * @property {number} str Strength
		 * @property {number} agi Agility
		 * @property {number} wit Wits
		 * @property {number} emp Empathy
		 */
		this.attributes = {
			attr: this.parseAttributes(formObj.attributes),
			get str() { return this.attr[0]; },
			get agi() { return this.attr[1]; },
			get wit() { return this.attr[2]; },
			get emp() { return this.attr[3]; },
		};

		/**
		 * Demon's Armor Rating.
		 * @type {number}
		 */
		this.armor = RollParser.parseAndRoll(formObj.armor);

		/**
		 * Demon's icon.
		 * @type {string}
		 */
		this.icon = formObj.symbol;

		// ======================== DEMON'S ABILITIES =========================

		/**
		 * Demon's abilities.
		 * @type {Map} Ability => Description
		 */
		this.abilities = new Map(super.getAll('abilities'));

		/**
		 * Demon's strengths.
		 * @type {Map} Strength => Description
		 */
		this.strengths = new Map(super.getAll('strengths'));

		/**
		 * Demon's weaknesses.
		 * @type {Map} Weakness => Description
		 */
		this.weaknesses = new Map(super.getAll('weaknesses'));

		// ========================== DEMON'S SKILLS ==========================

		/**
		 * Demon's skills.
		 * @type {Object} skillName: value
		 */
		this.skills = this.createSkills();

		// ========================= DEMON'S ATTACKS ==========================

		/**
		 * Demon's attacks.
		 * @type {Object}
		 */
		this.attacks = this.createAttacks();
	}

	/**
	 * Iterates each value of the attributes array and parses any roll string.
	 * @param {Array<string|number>} attributes [str, agi, wit, emp]
	 * @returns {number[]}
	 */
	parseAttributes(attributes) {
		const attr = [];
		for (const attribut of attributes) {
			attr.push(RollParser.parseAndRoll(attribut));
		}
		return attr;
	}

	/**
	 * Creates an array with one or more attack object.
	 * @returns {Object[]}
	 */
	createAttacks() {
		const attacks = super.getAll('attacks');

		return attacks.map(atq => {
			const returnAtq = {};

			if (atq.hasOwnProperty('name')) returnAtq.name = atq.name;

			if (atq.hasOwnProperty('base')) returnAtq.base = RollParser.parseAndRoll(atq.base);

			if (atq.hasOwnProperty('damage')) {

				if (atq.damage instanceof Array) {
					const index = Util.rand(1, atq.damage.length) - 1;
					returnAtq.damage = atq.damage[index];
				}
				else {
					returnAtq.damage = RollParser.parseAndRoll(atq.damage);
				}
			}

			if (atq.hasOwnProperty('range')) returnAtq.range = atq.range;

			if (atq.hasOwnProperty('special')) returnAtq.special = RollParser.supersede(atq.special);

			return returnAtq;
		});
	}

	/**
	 * Creates an object with "skillName: level".
	 * @returns {Object} Returns null if empty
	 * @property {number} skillName
	 */
	createSkills() {
		const skillsObj = {};
		const skills = super.get('skills');

		for (const name in skills) {
			skillsObj[name] = RollParser.parseAndRoll(skills[name]);
		}

		return skillsObj;
	}
}

module.exports = FBLDemonGenerator;