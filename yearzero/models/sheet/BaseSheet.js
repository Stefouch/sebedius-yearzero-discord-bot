const YZRoll = require('../../YZRoll');
const { SnowflakeUtil } = require('discord.js');
const { PRIMITIVE_ATTRIBUTE_MAP, SKILL_MAP } = require('../../../utils/constants');
const SEBEDIUS_VERSION = require('../../../package.json').version;

/**
 * The base model for Year Zero sheets.
 */
class BaseSheet {
	/**
	 * @param {import('discord.js').Snowflake} owner Owner's ID
	 * @param {Object} data Sheet's data
	 * @param {import('discord.js').Snowflake} [data.id] Sheet's ID
	 * @param {string} [data.name] Name
	 * @param {string} [data.game='myz'] Game code
	 * @param {string} [data.type='base'] Sheet's type
	 * @param {AttributesData} [data.attributes] Attributes
	 * @param {SkillsData} [data.skills] Skills
	 * @param {number} [data.armor] Armor Rating
	 *
	 * @typedef {Object[]|Object<string, number>} AttributesData
	 * Attributes' Data. Either:
	 * * `[ { attribute1_raw }, { attribute2_raw }]`
	 * * `{ attribute1: value1, attribute2: value2 }`
	 *
	 * @typedef {Object[]|Object<string, number>} SkillsData
	 * Skills' Data. Either:
	 * * `[ { skill1_raw }, { skill2_raw }]`
	 * * `{ skill1: value1, skill2: value2 }`
	 */
	constructor(owner, data) {
		/**
		 * The ID of the character.
		 * @type {import('discord.js').Snowflake}
		 */
		this.id = data.id || SnowflakeUtil.generate();

		/**
		 * The ID of the character's owner.
		 * @type {import('discord.js').Snowflake}
		 */
		this.owner = owner;

		/**
		 * The current version of the sheet.
		 * @type {string}
		 */
		this.version = data.version || SEBEDIUS_VERSION;

		/**
		 * The name of the character.
		 * @type {string}
		 */
		this.name = data.name || '???';

		/**
		 * The code for the game of the character
		 * @type {string}
		 */
		this.game = data.game || 'myz';

		/**
		 * The type of the sheet.
		 * @type {string}
		 */
		this.type = data.type || 'base';

		/**
		 * The Armor Rating for the character.
		 * @type {number}
		 */
		this.armor = data.armor || 0;

		/**
		 * The attributes of the character.
		 * @type {Attribute[]}
		 */
		this.attributes = [];

		/**
		 * The skills of the character.
		 * @type {Skill[]}
		 */
		this.skills = [];

		if (data.attributes) this._setupAttributes(data.attributes);
		if (data.skills) this._setupSkills(data.skills);
	}

	_setupAttributes(attributes) {
		if (Array.isArray(attributes)) {
			for (const attr of attributes) {
				this.attributes.push(Attribute.fromRaw(attr));
			}
		}
		else {
			for (const attr in attributes) {
				this.attributes.push(new Attribute(attr, attributes[attr]));
			}
		}
	}

	_setupSkills(skills) {
		if (Array.isArray(skills)) {
			for (const skill of skills) {
				this.skills.push(Skill.fromRaw(skill));
			}
		}
		else {
			for (const skill in skills) {
				this.skills.push(new Skill(skill, skills[skill]));
			}
		}
	}

	/**
	 * The time the sheet was created at.
	 * @type {Date}
	 * @readonly
	 */
	get createdAt() {
		return SnowflakeUtil.deconstruct(this.id).date;
	}

	/**
	 * The Strength's value for the character.
	 * Used for close-combat.
	 * @type {number}
	 * @readonly
	 */
	get str() {
		const attr = this.attributes.find(a => a.primitive === 'str');
		if (attr) return attr.total;
		return undefined;
	}

	/**
	 * The Agility's value for the character.
	 * Used for ranged-combat.
	 * @type {number}
	 * @readonly
	 */
	get agi() {
		const attr = this.attributes.find(a => a.primitive === 'agi');
		if (attr) return attr.total;
		return undefined;
	}

	/**
	 * The Wits's value for the character.
	 * @type {number}
	 * @readonly
	 */
	get int() {
		const attr = this.attributes.find(a => a.primitive === 'int');
		if (attr) return attr.total;
		return undefined;
	}

	/**
	 * The Empathy's value for the character.
	 * @type {number}
	 * @readonly
	 */
	get emp() {
		const attr = this.attributes.find(a => a.primitive === 'emp');
		if (attr) return attr.total;
		return undefined;
	}

	/**
	 * Gets an attribute.
	 * @param {string|PrimitiveAttribute} attributeName Attribute's name or primitive
	 * @returns {Attribute}
	 */
	getAttribute(attributeName) {
		let attr = this.attributes.find(a => a.name === attributeName || a.primitive === attributeName);
		if (!attr) attr = this.attributes.find(a => a.name.includes(attributeName));
		return attr;
	}

	/**
	 * Gets a skill.
	 * @param {string} skillName Skill's name
	 * @returns {Skill}
	 */
	getSkill(skillName) {
		let skill = this.skills.find(s => s.name === skillName);
		if (!skill) skill = this.skills.find(s => s.name.includes(skillName));
		return skill;
	}

	/**
	 * Gets the dice for a skill test.
	 * @param {string} name Skill- or attribute's name.
	 * @returns {YZRoll}
	 */
	getDice(name) {
		const skill = this.getSkill(name);
		const attribute = skill ? this.getAttribute(skill.attribute) : this.getAttribute(name);

		if (!attribute) throw new TypeError('UNKNOWN ATTRIBUTE - Cannot get attribute value');

		return new YZRoll(this.game, this.name, name)
			.addBaseDice(attribute.total)
			.addSkillDice(skill ? skill.value : 0);
	}

	toRaw() {
		return {
			id: this.id,
			owner: this.owner,
			version: this.version,
			name: this.name,
			game: this.game,
			type: this.type,
			attributes: this.attributes.map(a => a.toRaw()),
			skills: this.skills.map(s => s.toRaw()),
			armor: this.armor,
		};
	}

	static fromRaw(raw) {
		return new this(raw.owner, raw);
	}

	toString() {
		return `Sheet { ${this.id} => ${this.name} }`;
	}
}

module.exports = BaseSheet;

/**
 * A Year Zero Attribute.
 */
class Attribute {
	/**
	 * @param {string} name The name of the attribute
	 * @param {number} [value=0] The level of the attribute
	 * @param {number} [trauma=0] The quantity of trauma on the attribute
	 */
	constructor(name, value = 0, trauma = 0) {
		/**
		 * The attribute's name.
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The level of the attribute.
		 * @type {number}
		 */
		this.value = value;

		/**
		 * The quantity of trauma on the attribute.
		 * @type {number}
		 */
		this.trauma = trauma;
	}

	/**
	 * The total value of the attribute.
	 * @type {number}
	 * @readonly
	 */
	get total() {
		return this.value - this.trauma;
	}

	/**
	 * The primitive of the attribute.
	 * @type {PrimitiveAttribute}
	 * @readonly
	 */
	get primitive() {
		return PRIMITIVE_ATTRIBUTE_MAP[this.name];
	}

	toRaw() {
		return {
			name: this.name,
			value: this.value,
			trauma: this.trauma,
		};
	}

	static fromRaw(raw) {
		return new this(raw.name, raw.value, raw.trauma);
	}

	toString() {
		return `Attribute { ${this.name}: ${this.total}/${this.value} }`;
	}

	valueOf() {
		return this.total;
	}
}

/**
 * A Year Zero Skill.
 */
class Skill {
	/**
	 * @param {string} name The name of the skill
	 * @param {number} [value=0] The level of the skill
	 * @param {?PrimitiveAttribute} [attribute] The primitive attribute related to the skill
	 */
	constructor(name, value = 0, attribute = null) {
		/**
		 * The name of the skill.
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The level of the skill.
		 * @type {number}
		 */
		this.value = value;

		/**
		 * The primitive attribute related to the skill.
		 * @type {PrimitiveAttribute}
		 */
		this.attribute = attribute || SKILL_MAP[name];
	}

	toRaw() {
		return {
			name: this.name,
			value: this.value,
			attribute: this.attribute,
		};
	}

	static fromRaw(raw) {
		return new this(raw.name, raw.value, raw.attribute);
	}


	toString() {
		return `Skill { ${this.name}: ${this.value} }`;
	}

	valueOf() {
		return this.value;
	}
}

/**
 * @typedef {string} PrimitiveAttribute
 * * `str` – Strength
 * * `agi` – Agility
 * * `int` – Wits
 * * `emp` – Empathy
 */