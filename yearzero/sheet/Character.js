const BaseSheet = require('./BaseSheet');

/**
 * A Year Zero Character Sheet.
 */
class Character extends BaseSheet {
	constructor(owner, data, weapons) {
		super(owner, data);
		this.type = 'character';

		/**
		 * The weapons of the character.
		 * @type {YZWeapon[]}
		 */
		this.weapons = [];

		if (weapons) this._setupWeapons(weapons);
	}

	_setupWeapons(weapons) {
		for (const w of weapons) this.weapons.push(w);
	}

	// toRaw() {
	// 	return Object.assign(super.toRaw(), {
	// 		armor: this.armor,
	// 	});
	// }
}

module.exports = Character;