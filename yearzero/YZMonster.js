const fs = require('fs');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const { __ } = require('../utils/locales');
const { SUPPORTED_GAMES, SOURCE_MAP } = require('../utils/constants');

class YZMonster {

	/**
	 * Year Zero Monster.
	 * @param {*} data
	 * @param {?RollTable} attacksTable
	 */
	constructor(data, attacksTable) {
		for (const key in data) {
			this[key] = data[key];
		}
		this._createSkills();
		this._createAttacks(attacksTable);
	}

	get name() {
		return __(this.id, this.lang);
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

	_createAttacks(attacksTable) {
		if (
			typeof this.attacks === 'string' &&
			this.attacks.startsWith('atk') &&
			this.game
		) {
			this.attacks = Sebedius.getTable(
				'MONSTER_SIGNATURE_ATTACKS',
				`./gamedata/${this.game}/`,
				this.attacks,
				this.lang || 'en',
				'csv',
			);
		}
		else if (attacksTable) {
			this.attacks = attacksTable;
		}
	}

	/**
	 * Gets a random monster attack from the available signature attacks.
	 * @param {?number} reference Specific attack, if any.
	 * @returns {string}
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
	 * @returns {Object[]}
	 * @property {string} name Name of the monster
	 */
	static monstersRaw() {
		const monstersCatalog = './gamedata/yz-monsters-catalog.csv';
		let monsters;
		try {
			const fileContent = fs.readFileSync(monstersCatalog, 'utf8');
			monsters = Util.csvToJSON(fileContent);
		}
		catch(error) {
			console.error('[YZMonster.fromRaw] - Monster Master File Error');
			return null;
		}
		return monsters;
	}

	/**
	 * Gets all the monsters.
	 * @returns {YZMonster[]}
	 */
	static monsters() {
		const monstersRaw = YZMonster.monstersRaw();
		const monsters = [];
		for (const m of monstersRaw) {
			monsters.push(new YZMonster(m));
		}
		return monsters;
	}

	static async search(ctx, monsterName = null, gameName = null) {
		let game;
		if (SUPPORTED_GAMES.includes(gameName)) {
			game = gameName;
		}
		else {
			const gameChoices = SUPPORTED_GAMES.map(g => [SOURCE_MAP[g], g]);
			game = await Sebedius.getSelection(ctx, gameChoices);
		}

		if (monsterName) {
			const monster = YZMonster.monsters()
				.find(m => m.name.toLowerCase() == monsterName.toLowerCase());
			if (monster) return monster;
		}
		const monsterChoices = YZMonster.monsters()
			.filter(m => m.game === game && m.name.toLowerCase().includes(monsterName.toLowerCase()))
			.map(m => [m.name, m]);
		return await Sebedius.getSelection(ctx, monsterChoices);
	}
}

module.exports = YZMonster;