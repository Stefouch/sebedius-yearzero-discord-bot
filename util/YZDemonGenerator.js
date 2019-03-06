const YZGenerator = require('./YZGenerator');
const GeneratorData = require('../data/demon-generator.json');
const Util = require('./Util');

class YZDemonGenerator extends YZGenerator {
	constructor() {
		super(GeneratorData);
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

		// DEMON'S FORM
		const formObj = super.getElemFromParam('form');

		this.form = formObj.form;
		this.attributes = {
			attr: this.parseAttributes(formObj.attributes),
			get str() { return this.attr[0]; },
			get agi() { return this.attr[1]; },
			get wit() { return this.attr[2]; },
			get emp() { return this.attr[3]; },
		};
		this.armor = eval(Util.parseRoll(formObj.armor));

		// DEMON'S ABILITIES
		this.abilities = new Map(super.getMultipleElemFromParam('abilities'));
		this.strengths = new Map(super.getMultipleElemFromParam('strengths'));
		this.weaknesses = new Map(super.getMultipleElemFromParam('weaknesses'));

		// DEMON'S SKILLS
		this.skills = this.createSkills();


	}

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
		const skillsObj = {};
		const skills = super.getElemFromParam('skills');

		for (const name in skills) {
			skillsObj[name] = eval(Util.parseRoll(skills[name]));
		}

		return skillsObj;
	}
}

module.exports = YZDemonGenerator;