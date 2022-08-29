const BaseSheet = require('./BaseSheet');
const Weapon = require('../Weapon');
const { __ } = require('../../../lang/locales');

/**
 * A Year Zero Character Sheet.
 */
class Character extends BaseSheet {
	constructor(owner, data) {
		super(owner, data);
		this.type = 'character';

		/**
		 * The URL where this character was imported.
		 * @type {string}
		 */
		this.url = data.url;

		/**
		 * The time in milliseconds at which the character was used for the last time.
		 * Used for the database storage.
		 * @type {number}
		 */
		this.ttl = Date.now();

		/**
		 * Whether this character is still active.
		 * @type {boolean}
		 */
		this.active = data.active ? true : false;

		/**
		 * The kin or race of the character.
		 * @type {string}
		 */
		this.kin = data.kin || data.race || __('human', this.lang);

		/**
		 * The weapons of the character.
		 * @type {Weapon[]}
		 */
		this.weapons = [];

		if (data.weapons) this._setupWeapons(data.weapons);
	}

	_setupWeapons(weapons) {
		for (const w of weapons) this.weapons.push(new Weapon(w));
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			url: this.url,
			ttl: this.ttl,
			active: this.active,
			kin: this.kin,
			weapons: this.weapons.map(w => w.toRaw()),
		});
	}
}

module.exports = Character;