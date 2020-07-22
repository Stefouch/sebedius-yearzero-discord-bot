const fs = require('fs');
const { Collection } = require('discord.js');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const { __ } = require('../utils/locales');
const { CatalogNotFoundError } = require('../utils/errors');
const { SOURCE_MAP, COMPENDIA, ATTRIBUTES, ATTRIBUTE_STR, ATTRIBUTE_AGI, RANGES } = require('../utils/constants');

const CATEGORIES = {
	WEAPONS: 'YZWeapon',
	MONSTERS: 'YZMonster',
};

const CATALOG_SOURCES = {
	WEAPONS: {
		myz: './gamedata/myz/myz-weapons-catalog.csv',
	},
	MONSTERS: {
		myz: './gamedata/myz/myz-monsters-catalog.csv',
		alien: './gamedata/alien/alien-monsters-catalog.csv',
	},
};

const CATALOGS = {};

class YZObject {
	/**
	 * A Year Zero Object.
	 * @param {*} data
	 */
	constructor(data) {
		for (const key in data) {
			if (Util.isNumber(data[key])) this[key] = +data[key];
			else this[key] = data[key];
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
		for (const game in COMPENDIA) {
			if (COMPENDIA[game].includes(this.source)) return game;
		}
		return undefined;
	}

	static get AVAILABLE_CATEGORIES() {
		return Object.keys(CATEGORIES);
	}

	static get CATALOGS() {
		return CATALOGS;
	}

	static getAvailableGames(category) {
		return Object.keys(CATALOGS[category]);
	}

	static get(cat, game, id) {
		return CATALOGS[cat][game].get(id);
	}

	/**
	 * Gets all the Year Zero objects listed in the catalog file, in raw format.
	 * @param {string} source Path of the source catalog file
	 * @returns {Object[]}
	 * @static
	 */
	static allRaw(source) {
		let raws;
		try {
			const fileContent = fs.readFileSync(source, 'utf8');
			raws = Util.csvToJSON(fileContent);
		}
		catch(error) {
			throw new CatalogNotFoundError(`File Read Error: "${source}"`);
		}
		return raws;
	}

	/**
	 * Gets all the Year Zero objects listed in the catalog file.
	 * @param {string} cat Category of the objects to fetch
	 * @param {string} source Path of the source catalog file
	 * @returns {Discord.Collection<string, YZObject>} Collection<K, V> with K: id, V: Year Zero object
	 */
	static all(cat, source) {
		const raws = YZObject.allRaw(source);
		const objs = [];
		const _class = CATEGORIES[cat] || 'YZObject';
		for (const raw of raws) {
			const obj = new (module.exports[_class])(raw);
			objs.push(obj);
		}
		return new Collection(
			objs.map(o => [o.id, o]),
		);
	}

	/**
	 * Fetches a Year Zero object from the catalogs.
	 * @param {Discord.Message} ctx Discord message with context
	 * @param {string} cat Category of the object to fetch
	 * @param {string} game Code for the source game
	 * @param {?string} str String to search for
	 * @returns {YZObject}
	 * @throws {CatalogNotFoundError} If the catalog does not exist
	 * @static
	 * @async
	 */
	static async fetch(ctx, cat, game, str = null) {
		if (!CATALOGS[cat] || !CATALOGS[cat][game]) {
			throw new CatalogNotFoundError(
				`No **${Util.capitalize(cat.toLowerCase())}** Catalog `
				+ `for "**${SOURCE_MAP[game]}**"`,
			);
		}
		const catalog = CATALOGS[cat][game];

		if (catalog.has(str)) return catalog.get(str);

		str = str.toLowerCase();
		let matching = catalog.filter(o => o.name.toLowerCase() === str);
		if (matching.size === 0) {
			matching = catalog.filter(
				o => o.id.includes(str) ||
				o.name.toLowerCase().includes(str),
			);
		}
		if (matching.size === 0) {
			matching = catalog;
		}
		matching = matching.map(o => [o.name, o]);
		return await Sebedius.getSelection(ctx, matching);
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
		if (!CATEGORIES[cat]) throw new TypeError(`Unknown Catalog's Category "**${cat}**"`);
		if (game && CATALOGS[cat][game]) return game;

		const choices = Object
			.keys(CATALOGS[cat])
			.map(g => [SOURCE_MAP[g], g]);

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

	/**
	 * Raw Strength used for close combat.
	 * @type {number}
	 * @readonly
	 */
	get str() {
		for (const attr in this.attributes) {
			if (ATTRIBUTE_STR.includes(attr)) return this.attributes[attr];
		}
		return 0;
	}

	/**
	 * Raw Agility used for ranged combat.
	 * @type {number}
	 * @readonly
	 */
	get agi() {
		for (const attr in this.attributes) {
			if (ATTRIBUTE_AGI.includes(attr)) return this.attributes[attr];
		}
		return 0;
	}

	static getAvailableGames() { return super.getAvailableGames('MONSTERS'); }
	static async fetch(ctx, game, str = null) { return super.fetch(ctx, 'MONSTERS', game, str); }
	static async fetchGame(ctx, game = null) { return super.fetchGame(ctx, 'MONSTERS', game); }

	_createAttributes() {
		this.attributes = {};
		if (this.game === 'alien') {
			this.attributes.speed = +this.speed || 1;
			this.attributes.health = +this.hp || +this.health || +this.life || 0;
		}
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
					if (/{.+:\d+:\d+:\d+}/.test(atq)) {
						const atk = atq.replace(/{(.+):(\d+):(\d+):(\d+)}/, (match, n, d, dmg, rng) => {
							return `{ "id": "${n.toUpperCase()}", "bonus": ${d}, "damage": ${dmg}, `
								+ `"range": ${rng}, "ranged": ${rng > 0 ? 'true' : '""'} }`;
						});
						out.push(new YZWeapon(JSON.parse(atk)));
					}
					else if (atq.startsWith(`{w${this.game}-`) && atq.endsWith('}')) {
						const wid = atq.replace(/{(.*)}/, (match, p1) => p1);
						const weapon = YZWeapon.CATALOGS.WEAPONS[this.game].get(wid);
						out.push(weapon);
					}
					else if (atq.startsWith('{') && atq.endsWith('}')) {
						const wid = atq.replace(/{(.*)}/, (match, p1) => p1);
						const weapon = YZWeapon.getDefault(
							Util.capitalize(__(wid, this.lang)),
						);
						out.push(weapon);
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
					if (!atk) return;
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
			const dmg = attack.damage >= 0 ? attack.damage : '-';
			const r = attack.range >= 0 ? Util.capitalize(RANGES[this.game][attack.range]) : '-';
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
		this.ranged = this.ranged ? true : false;
	}

	get base() { return this.bonus; }
	get effect() {
		return `${this.bonus} ${__('base-dice', this.lang)}`
		+ `, ${Util.capitalize(__('damage', this.lang))} ${this.damage}.`
		+ (this.special ? ` *(${this.special.split('|').join(', ')}.)*` : '');
	}

	static getAvailableGames() { return super.getAvailableGames('WEAPONS'); }
	static async fetch(ctx, game, str = null) { return super.fetch(ctx, 'WEAPONS', game, str); }
	static async fetchGame(ctx, game = null) { return super.fetchGame(ctx, 'WEAPONS', game); }

	static getDefault(name) {
		return new YZWeapon({
			id: name,
			grip: 1,
			bonus: 0,
			damage: 1,
			range: 0,
			ranged: true,
			source: 'myz',
		});
	}
}

module.exports = { YZObject, YZMonster, YZWeapon };

console.log('[+] - Catalogs');
console.log('      > Indexation...');
for (const cat in CATALOG_SOURCES) {
	CATALOGS[cat] = {};
	for (const game in CATALOG_SOURCES[cat]) {
		CATALOGS[cat][game] = YZObject.all(cat, CATALOG_SOURCES[cat][game]);
		console.log(`        • ${cat}: ${game} (${CATALOGS[cat][game].size})`);
	}
}
console.log('      > Loaded & Ready!');