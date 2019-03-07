const YZGenerator = require('./YZGenerator');
const DemonData = require('../data/demon-generator.json');
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
		const formObj = super.getElemFromParam('form');

		/**
		 * The Demon's form.
		 * @type {string}
		 */
		this.form = formObj.form.toString();

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
		this.armor = eval(Util.parseRoll(formObj.armor));

		// ======================== DEMON'S ABILITIES =========================

		/**
		 * Demon's abilities.
		 * @type {Map} Ability => Description
		 */
		this.abilities = new Map(super.getMultipleElemFromParam('abilities'));

		/**
		 * Demon's strengths.
		 * @type {Map} Strength => Description
		 */
		this.strengths = new Map(super.getMultipleElemFromParam('strengths'));

		/**
		 * Demon's weaknesses.
		 * @type {Map} Weakness => Description
		 */
		this.weaknesses = new Map(super.getMultipleElemFromParam('weaknesses'));

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
			attr.push(eval(Util.parseRoll(attribut)));
		}
		return attr;
	}

	/**
	 * Creates an array with one or more attack object.
	 * @returns {Object[]}
	 */
	createAttacks() {
		const attacks = super.getMultipleElemFromParam('attacks', this.source, 5, 5);

		// Processes the damage and any dice roll.
		for (const attack of attacks) {

			if (attack.hasOwnProperty('base')) attack.base = eval(Util.parseRoll(attack.base));

			if (attack.hasOwnProperty('damage')) {

				if (attack.damage instanceof Array) {
					if (attack.damage.length === 6) attack.damage = attack.damage[Util.rand(1, 6) - 1];
				}
			}

			if (attack.hasOwnProperty('special')) attack.special = Util.parseRoll(attack.special);
		}

		return attacks;
	}

	/**
	 * Creates an object with "skillName: level".
	 * @returns {Object} Returns null if empty
	 * @property {number} skillName
	 */
	createSkills() {
		const skillsObj = {};
		const skills = super.getElemFromParam('skills');

		for (const name in skills) {
			skillsObj[name] = eval(Util.parseRoll(skills[name]));
		}

		return skillsObj;
	}
}

module.exports = FBLDemonGenerator;