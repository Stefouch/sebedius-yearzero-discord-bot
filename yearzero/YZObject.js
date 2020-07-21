const fs = require('fs');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const { __ } = require('../utils/locales');
const { CatalogNotFoundError } = require('../utils/errors');
const { SOURCE_MAP, COMPENDIA, ATTRIBUTES } = require('../utils/constants');

const CATEGORIES = {
	MONSTERS: 'YZMonster',
	WEAPONS: 'YZWeapon',
};

class YZObject {
	/**
	 * A Year Zero Object.
	 * @param {*} data
	 */
	constructor(data) {
		for (const key in data) {
			this[key] = data[key];
		}
	}

	/**
	 * The translated name of the object.
	 * @type {string}
	 * @readonly
	 */
	get name() {
		return __(this.id, this.lang);
	}

	/**
	 * The game code of the object.
	 * @type {string}
	 * @readonly
	 */
	get game() {
		if (SOURCE_MAP[this.source]) return this.source;
		for (const game of Object.keys(COMPENDIA)) {
			if (COMPENDIA[game].includes(this.source)) return game;
		}
		return undefined;
	}

	static get AVAILABLE_CATEGORIES() {
		return Object.keys(CATEGORIES);
	}

	static getGames(category) {
		return Object.keys(CATALOGS[category]);
	}

	/**
	 * Gets all the Year Zero objects listed in the catalog file, in raw format.
	 * @param {string} cat Category of the objects to fetch
	 * @param {string} game Source game of the objects to fetch
	 * @returns {Object[]}
	 * @static
	 */
	static allRaw(cat, game) {
		let yzObjects;
		try {
			const fileContent = fs.readFileSync(CATALOGS[cat][game], 'utf8');
			yzObjects = Util.csvToJSON(fileContent);
		}
		catch(error) {
			throw new CatalogNotFoundError('YZObject.all - File Error');
		}
		return yzObjects;
	}

	/**
	 * Gets all the Year Zero objects listed in the catalog file.
	 * @param {string} cat Category of the objects to fetch
	 * @param {string} game Source game of the objects to fetch
	 * @returns {YZMonster|YZWeapon}
	 */
	static all(cat, game) {
		const raws = YZObject.allRaw(cat, game);
		const objs = [];
		const _class = CATEGORIES[cat] || 'YZObject';
		for (const raw of raws) {
			const obj = new (module.exports[_class])(raw);
			objs.push(obj);
		}
		return objs;
	}

	/**
	 * Fetches a Year Zero object from the catalogs.
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {string} cat Category of the object to fetch
	 * @param {string} game Code for the source game
	 * @param {?string} name String to search
	 * @returns {YZObject}
	 * @static
	 * @async
	 */
	static async fetch(ctx, cat, game, name = null) {
		const objs = YZObject.all(cat, game);
		if (!objs) throw new CatalogNotFoundError(`No **${cat}** Catalog for "**${game}**"`);

		if (name) {
			const obj = objs.find(m => m.id === name || m.name.toLowerCase() == name.toLowerCase());
			if (obj) return obj;
		}

		let choices = objs;
		const filteredChoices = choices.filter(
			o => o.game === game &&
			(
				o.id === name ||
				o.name.toLowerCase().includes(name.toLowerCase())
			),
		);
		if (filteredChoices.length) {
			choices = filteredChoices.map(m => [m.name, m]);
		}
		else {
			choices = choices.map(m => [m.name, m]);
		}
		return await Sebedius.getSelection(ctx, choices);
	}

	/**
	 * Fetches a catalog's source game.
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {string} cat Category of the objects to fetch
	 * @param {?string} game Code for the source game
	 * @returns {string}
	 * @throws {TypeError} If unknown category
	 * @static
	 * @async
	 */
	static async fetchGame(ctx, cat, game = null) {
		if (!CATEGORIES[cat]) throw new TypeError('Unknown Catalog\'s Category');
		if (game && CATALOGS[cat][game]) return game;

		const games = Object.keys(CATALOGS[cat]);
		const choices = games.map(g => [SOURCE_MAP[g], g]);

		return await Sebedius.getSelection(ctx, choices);
	}

	toString() {
		return `[${this.constructor.name}: ${this.id}]`;
	}
}

class YZMonster extends YZObject {

	/**
	 * Year Zero Monster.
	 * @param {*} data
	 * @param {*} attacks
	 */
	constructor(data, attacks) {
		super(data);
		this._createAttributes();
		this._createArmor();
		this._createSkills();
		this._createAttacks(attacks);
	}

	static getGames() { return super.getGames('MONSTERS'); }
	static async fetch(ctx, game, name = null) { return super.fetch(ctx, 'MONSTERS', game, name); }
	static async fetchGame(ctx, game = null) { return super.fetchGame(ctx, 'MONSTERS', game); }

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
					if (/{(.*):(.*):(.*):(.*)}/.test(atq)) {
						const atk = atq.replace(/{(.*):(.*):(.*):(.*)}/, (match, n, d, dmg, rng) => {
							return `{ "name": "${n.toUpperCase()}", "base": ${d}, "damage": ${dmg}, `
								+ `"range": ${rng}, "effect": "${d} ${__('base-dice', this.lang)}`
								+ `, ${Util.capitalize(__('damage', this.lang))} ${dmg}." }`;
						});
						out.push(JSON.parse(atk));
					}
					else if (atq.startsWith(`{w${this.game}-`) && atq.endsWith('}')) {
						//TODO
						const wid = atq.replace(/{(.*)}/, (match, p1) => p1);
						//const weapon = YZWeapon.fetch(null, this.game, wid);
						//out.push(weapon);
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
	 * @property {number} base The base dice bonus of the attack
	 * @property {number} damage The damage of the attack
	 * @property {number} range The range of the attack
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
}

class YZWeapon extends YZObject {
	constructor(data) {
		super(data);
	}

	get base() { return this.bonus; }
	get effect() {
		return `${this.bonus} ${__('base-dice', this.lang)}`
		+ `, ${Util.capitalize(__('damage', this.lang))} ${this.damage}." }`;
	}

	static getGames() { return super.getGames('WEAPONS'); }
	static async fetch(ctx, game, name = null) { return super.fetch(ctx, 'WEAPONS', game, name); }
	static async fetchGame(ctx, game = null) { return super.fetchGame(ctx, 'WEAPONS', game); }
}

module.exports = { YZObject, YZMonster, YZWeapon };

const CATALOGS = {
	MONSTERS: {
		myz: './gamedata/myz/myz-monsters-catalog.csv',
		alien: './gamedata/alien/alien-monsters-catalog.csv',
	},
	WEAPONS: {
		myz: './gamedata/myz/myz-weapons-catalog.csv',
	},
};

console.log('[+] - Catalogs');
console.log('      > Indexation...');
for (const cat in CATALOGS) {
	for (const game in CATALOGS[cat]) {
		if (cat === 'MONSTERS') {
			CATALOGS[cat][game] = YZMonster.all(cat, game);
		}
		else if (cat === 'WEAPONS') {
			CATALOGS[cat][game] = YZWeapon.all(cat, game);

		}
		console.log(`        > ${cat}: ${game}`);
	}
}
console.log('      > Loaded & Ready!');