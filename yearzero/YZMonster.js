const fs = require('fs');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const { __ } = require('../utils/locales');
const { ATTRIBUTES, MONSTERS_CATALOGS } = require('../utils/constants');

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

	/**
	 * All Year Zero Monsters sorted by game.
	 * @type {Object}
	 * @readonly
	 * @constant
	 */
	static get MONSTERS() {
		return _MONSTERS;
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
			// This acts like an attack parser from raw data.
			else if (this.attacks.startsWith('{') || this.attacks.includes('|')) {
				// Splits at `|` for support of multiple attacks.
				const atqs = this.attacks.split('|');

				// Parses all new attacks.
				const out = [];
				for (const atq of atqs) {
					if (atq.startsWith('{') && atq.endsWith('}')) {
						const atk = atq.replace(/{(.*):(.*):(.*):(.*)}/gi, (match, n, d, dmg, rng) => {
							return `{ "name": "${n.toUpperCase()}", "base": ${d}, "damage": ${dmg}, `
								+ `"range": ${rng}, "effect": "${d} ${__('base-dice', this.lang)}`
								+ `, ${Util.capitalize(__('damage', this.lang))} ${dmg}." }`;
						});
						out.push(JSON.parse(atk));
					}
					else {
						out.push({ name: 'Special', effect: atq + '.' });
					}
				}
				// Creates the roll intervals (the references).
				const intervals = Util.createIntervals(atqs.length, 6);
				const references = intervals.map(intvl => {
					intvl = intvl.map(x => Util.convertToBijective(x, '123456'));
					if (intvl[0] === intvl[1]) return '' + intvl[0];
					return `${intvl[0]}-${intvl[1]}`;
				});

				// Creates a new RollTable for the attacks.
				this.attacks = new RollTable(this.id);

				// Adds the attacks to the RollTable.
				out.forEach((atk, i) => {
					atk.ref = references[i];
					this.attacks.set(atk.ref, atk);
				});
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
				out.push(`${Util.capitalize(__(key, this.lang))} **${this.attributes[key]}**`);
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
				out.push(`${Util.capitalize(__(key, this.lang))} **${this.skills[key]}**`);
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
	 * Returns a string for the attacks.
	 * @returns {string}
	 */
	attacksToString() {
		if (!(this.attacks instanceof RollTable)) {
			return '```\n' + this.attacks + '\n```';
		}
		// const intvlColLen = 7, nameColLen = 18, diceColLen = 6, dmgColLen = 8;
		const intvlColLen = 5, nameColLen = 20, diceColLen = 6, dmgColLen = 8;
		let str = '```\n'
			+ Util.alignText(this.attacks.d, intvlColLen, 0)
			+ Util.alignText('Name', nameColLen, 0)
			+ Util.alignText('Base', diceColLen, 0)
			+ Util.alignText('Damage', dmgColLen, 0)
			+ 'Range\n' + '-'.repeat(intvlColLen + nameColLen + diceColLen + dmgColLen + 6);

		for (const [ref, attack] of this.attacks) {
			if (attack.name === '{REROLL}') continue;
			const n = attack.name || 'Unnamed';
			const d = attack.base ? attack.base + 'D' : '-';
			const dmg = attack.damage || '-';
			const r = attack.range || '-';
			str += '\n'
				+ Util.alignText(`${ref}`, intvlColLen, 0)
				+ Util.alignText(n, nameColLen, 0)
				+ Util.alignText(d, diceColLen, 0)
				+ Util.alignText(`${dmg}`, dmgColLen, 0)
				+ `${r}`;
		}
		if (str.length + 4 > 2000) {
			str = Util.trimString(str, 2000 - 4);
		}
		str += '\n```';
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
	attack(reference = null) {
		if (typeof this.attacks === 'string') {
			return { effect: this.attacks };
		}
		if (this.attacks instanceof RollTable) {
			let ref;
			if (this.attacks.length <= 6) ref = Util.rand(1, 6);
			else if (this.attacks.length <= 36) ref = Util.rollD66();
			else if (this.attacks.length <= 216) ref = Util.rollD666();
			else throw new RangeError('[YZMonster.Attack] - Reference Out of Range');

			if (reference && Util.isNumber(reference)) {
				ref = Util.modifOrSet(`${reference}`, ref);
				ref = Util.clamp(ref, 1, this.attacks.length);
			}

			const attack = this.attacks.get(ref);
			if (!attack) return undefined;
			if (attack.name === '{REROLL}' || !attack.effect) {
				return this.attack();
			}
			return attack;
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
	 * @param {string} game Code for the source game
	 * @param {string} monsterName Monster name to search
	 * @returns {YZMonster}
	 * @async
	 */
	static async fetch(ctx, game, monsterName = null) {
		if (monsterName) {
			const monster = YZMonster.MONSTERS[game]
				.find(m => m.name.toLowerCase() == monsterName.toLowerCase());
			if (monster) return monster;
		}
		let monsterChoices = YZMonster.MONSTERS[game];
		const filteredMonsterChoices = monsterChoices
			.filter(m => m.game === game && m.name.toLowerCase().includes(monsterName.toLowerCase()));
		if (filteredMonsterChoices.length) {
			monsterChoices = filteredMonsterChoices.map(m => [m.name, m]);
		}
		else {
			monsterChoices = monsterChoices.map(m => [m.name, m]);
		}
		return await Sebedius.getSelection2(ctx, monsterChoices);
	}

	toString() {
		return `[YZMonster: ${this.id}]`;
	}
}

console.log('[+] - Monsters Catalogs');
console.log('      > Indexation...');

const _MONSTERS = {
	alien: YZMonster.monsters('alien'),
};

console.log('      > Loaded & Ready!');

module.exports = YZMonster;