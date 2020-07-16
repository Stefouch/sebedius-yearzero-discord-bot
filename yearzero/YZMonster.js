const fs = require('fs');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const { __ } = require('../utils/locales');
const { ATTRIBUTES, SUPPORTED_GAMES, SOURCE_MAP, MONSTERS_CATALOGS } = require('../utils/constants');

class YZMonster {

	/**
	 * Year Zero Monster.
	 * @param {*} data
	 * @param {*} attacks
	 */
	constructor(data, attacks) {
		for (const key in data) {
			this[key] = data[key];
		}
		this._createAttributes();
		this._createArmor();
		this._createSkills();
		this._createAttacks(attacks);
	}

	/**
	 * The translated name of the monster.
	 * @type {string}
	 * @readonly
	 */
	get name() {
		return __(this.id, this.lang);
	}

	_createAttributes() {
		this.attributes = {
			speed: +this.speed || 1,
			health: +this.hp || +this.health || +this.life || 0,
		};
		for (const validAttribute of ATTRIBUTES) {
			if (this.hasOwnProperty(validAttribute)) {
				this.attributes[validAttribute] = +this[validAttribute];
				delete this[validAttribute];
			}
		}
	}

	_createArmor() {
		if (Util.isNumber(this.armor)) {
			const ar = +this.armor;
			this.armor = { default: ar };
		}
		else if (typeof this.armor === 'string' && this.armor.includes('|')) {
			const armorRatings = this.armor.split('|');
			this.armor = { default: +armorRatings.shift() };
			for (const ar of armorRatings) {
				const ars = ar.split(':');
				this.armor[ars[0]] = +ars[1];
			}
		}
		else {
			this.armor = { default: 0 };
		}
	}

	_createSkills() {
		if (typeof this.skills === 'string') {
			const skills = this.skills.split(/\|/g);
			this.skills = {};
			for (const sk of skills) {
				const s = sk.trim().split(' ');
				const skillRating = s.pop();
				const skillName = s.join('-').toLowerCase();
				this.skills[skillName] = +skillRating;
			}
		}
	}

	_createAttacks(attacks) {
		if (typeof this.attacks === 'string') {
			// Form: "atk-<name>" (.csv)
			if (this.attacks.startsWith('atk-') && this.game) {
				this.attacks = Sebedius.getTable(
					'MONSTER_SIGNATURE_ATTACKS',
					`./gamedata/${this.game}/`,
					this.attacks,
					this.lang,
					'csv',
				);
			}
			// Form: "{<name>:<dice>:<damage>}|{...}"
			else if (this.attacks.includes('|') || this.attacks.startsWith('{')) {
				const out = [];
				const attaques = this.attacks.split('|');
				for (const atq of attaques) {
					if (atq.startsWith('{') && atq.endsWith('}')) {
						const str = atq.replace(/{(.*):(.*):(.*)}/gi, (match, n, d, dmg) => {
							return `**${n.toUpperCase()}:** ${d} ${__('base-dice', this.lang)}`
								+ `, ${Util.capitalize(__('damage', this.lang))} ${dmg}.`;
						});
						out.push(str);
					}
					else {
						out.push(atq + '.');
					}
				}
				this.attacks = out.join('\n');
			}
			// Otherwise, let it like this.
		}
		else if (attacks) {
			this.attacks = attacks;
		}
		else {
			this.attacks = `${Util.capitalize(__('none', this.lang))}.`;
		}
	}

	/**
	 * Returns a string for the attributes.
	 * @returns {string}
	 */
	attributesToString() {
		const out = [];
		for (const key in this.attributes) {
			if (this.attributes[key] > 0) {
				out.push(`${Util.capitalize(__(key, this.lang))}: **${this.attributes[key]}**`);
			}
		}
		return out.join('\n');
	}

	/**
	 * Returns a string for the skills.
	 * @returns {string}
	 */
	skillsToString() {
		const out = [];
		for (const key in this.skills) {
			if (this.skills[key] > 0) {
				out.push(`${Util.capitalize(__(key, this.lang))}: **${this.skills[key]}**`);
			}
		}
		if (out.length === 0) return `*${Util.capitalize(__('none', this.lang))}*`;
		return out.join('\n');
	}

	/**
	 * Returns a string for the armor.
	 * @returns {string}
	 */
	armorToString() {
		const armorTypes = Object.keys(this.armor);
		let str = '' + this.armor.default;
		if (armorTypes.length > 1) {
			str += ' (';
			const out = [];
			for (const type of armorTypes) {
				if (type === 'default') {
					continue;
				}
				else if (type === 'belly') {
					out.push(`${this.armor[type]} under the belly`);
				}
				else {
					out.push(`${this.armor[type]} vs. ${__(type, this.lang)}`);
				}
			}
			str += out.join(', ') + ')';
		}
		return str;
	}

	/**
	 * @typedef {Object} YZAttack
	 * A Year Zero Attack.
	 * @property {string} ref The roll reference of the attack
	 * @property {string} name The name of the attack
	 * @property {string} effect The effect of the attack
	 */

	/**
	 * Gets a random monster attack from the available signature attacks.
	 * @param {?number} reference Specific attack, if any.
	 * @returns {YZAttack}
	 */
	attack(reference) {
		if (typeof this.attacks === 'string') {
			return { effect: this.attacks };
		}
		if (this.attacks instanceof RollTable) {
			let ref;
			if (reference) ref = reference;
			else if (this.attacks.length <= 6) ref = Util.rand(1, 6);
			else if (this.attacks.length <= 36) ref = Util.rollD66();
			else if (this.attacks.length <= 216) ref = Util.rollD666();
			else throw new Error('[YZMonster.Attack] - No reference');

			return this.attacks.get(ref);
		}
		return undefined;
	}

	/**
	 * Gets all the monsters listed in the master file.
	 * @param {string} game Which game to fetch the monsters.
	 * @returns {Object[]}
	 */
	static monstersRaw(game) {
		let monsters;
		try {
			const fileContent = fs.readFileSync(MONSTERS_CATALOGS[game], 'utf8');
			monsters = Util.csvToJSON(fileContent);
		}
		catch(error) {
			console.error('[YZMonster.fromRaw] - Monster Catalog File Error');
			const err = new Error('Monster Catalog Not Found');
			err.name = 'CatalogNotFound';
			err.stack = error.stack;
			throw err;
		}
		return monsters;
	}

	/**
	 * Gets all the monsters.
	 * @param {string} game Which game to fetch the monsters.
	 * @returns {YZMonster[]}
	 */
	static monsters(game) {
		const monstersRaw = YZMonster.monstersRaw(game);
		const monsters = [];
		for (const m of monstersRaw) {
			monsters.push(new YZMonster(m));
		}
		return monsters;
	}

	/**
	 * Fetches a Year Zero monster from the catalogs (databases).
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {string} monsterName Monster name search
	 * @param {string} gameName Code for the source game
	 * @returns {YZMonster}
	 */
	static async fetch(ctx, monsterName = null, gameName = null) {
		let game;
		if (SUPPORTED_GAMES.includes(gameName)) {
			game = gameName;
		}
		else {
			const gameChoices = SUPPORTED_GAMES.map(g => [SOURCE_MAP[g], g]);
			game = await Sebedius.getSelection(ctx, gameChoices);
		}

		if (monsterName) {
			const monster = YZMonster.monsters(game)
				.find(m => m.name.toLowerCase() == monsterName.toLowerCase());
			if (monster) return monster;
		}
		const monsterChoices = YZMonster.monsters(game)
			.filter(m => m.game === game && m.name.toLowerCase().includes(monsterName.toLowerCase()))
			.map(m => [m.name, m]);
		return await Sebedius.getSelection(ctx, monsterChoices);
	}

	toString() {
		return `[YZMonster: ${this.id}]`;
	}
}

module.exports = YZMonster;