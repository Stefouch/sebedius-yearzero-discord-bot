const BaseSheet = require('./BaseSheet');

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
		 * The weapons of the character.
		 * @type {YZWeapon[]}
		 */
		this.weapons = [];

		if (data.weapons) this._setupWeapons(data.weapons);
	}

	_setupWeapons(weapons) {
		for (const w of weapons) this.weapons.push(w);
	}

	toRaw() {
		return Object.assign(super.toRaw(), {
			url: this.url,
			ttl: this.ttl,
		});
	}
}

module.exports = Character;