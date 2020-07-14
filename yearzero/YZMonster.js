const fs = require('fs');
const Sebedius = require('../Sebedius');
const Util = require('../utils/Util');
const RollTable = require('../utils/RollTable');
const __ = require('../utils/locales');

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
		this._forgeSkills();
		this._forgeAttacks(attacksTable);
	}

	get name() {
		return __(this.id, this.lang);
	}

	_forgeSkills() {
		if (typeof this.skills === 'string') {
			const skills = this.skills.trim().split(/\|/g);
			this.skills = {};
			for (const s of skills) {
				const sk = s.trim().split(' ');
				const skillRating = sk.pop();
				const skillName = sk.join(' ');
				this.skills[skillName] = skillRating;
			}
		}
	}

	_forgeAttacks(attacksTable) {
		if (this.attacks && this.game) {
			this.attacks = Sebedius.getTable(
				'MONSTER_SIGNATURE_ATTACKS',
				`./gamedata/${this.game}/`,
				this.attacks,
				this.lang || 'en',
				'csv',
			);
		}
		else {
			this.attacks = attacksTable;
		}
	}

	/**
	 * Gets a random monster attack from the available signature attacks.
	 * @param {?number} reference Specific attack, if any.
	 * @returns {string}
	 */
	attack(reference) {
		if (!this.attacks || !this.attacks.length) {
			return undefined;
		}
		let ref;
		if (reference) ref = reference;
		else if (this.attacks.length <= 6) ref = Util.rand(1, 6);
		else if (this.attacks.length <= 36) ref = Util.rollD66();
		else if (this.attacks.length <= 216) ref = Util.rollD666();
		else throw new Error('[YZMonster.Attack] - No reference');

		return this.attacks.get(ref);
	}

	/**
	 * Gets all the monsters listed in the master file.
	 * @returns {Object[]}
	 * @property {string} name Name of the monster
	 */
	static monstersRaw() {
		const monstersMasterFile = './gamedata/yz-monsters.csv';
		let monsters;
		try {
			const fileContent = fs.readFileSync(monstersMasterFile, 'utf8');
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
}

module.exports = YZMonster;