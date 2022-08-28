const BaseGear = require('./BaseGear');
const { __ } = require('../../lang/locales');

class Weapon extends BaseGear {
	constructor(data) {
		super(data);

		/**
		 * Quantity of damage dealt by the weapon.
		 * @type {number}
		 */
		this.damage = data.damage;

		/**
		 * The range of the weapon (verbose).
		 * @type {string}
		 */
		this.range = data.range;

		/**
		 * Whether this is a ranged weapon.
		 * @type {boolean}
		 */
		this.ranged = data.ranged ? true : false;

		// Shortcuts for lazy programmers.
		if (data.skill) this.bonuses[data.skill] = data.bonus || 0;
		else if (data.bonus) this.bonuses.attack = data.bonus;
	}

	/**
	 * The skill associated to this weapon.
	 * @type {string}
	 * @readonly
	 */
	get skill() {
		return Object.keys(this.bonuses)[0];
	}

	/**
	 * The bonus of the weapon.
	 * @type {number}
	 * @readonly
	 */
	get bonus() {
		return this.bonuses[this.skill];
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			damage: this.damage,
			range: this.range,
			ranged: this.ranged,
		});
	}

	toString(lang = 'en') {
		let str = `**${this.name}:** ${__('gear-bonus', lang)} **+${this.bonus}**, ${__('weapon-damage', lang)} **${this.damage}**`
		+ `, ${__('range', lang)} \`${__('range-' + this.source + '-' + this.range, lang).toUpperCase()}\`${this.comment ? `, *${this.comment}*` : ''}`;

		if (!str.endsWith('.')) str += '.';

		return str;
	}

	valueOf() {
		return this.bonus;
	}
}

module.exports = Weapon;