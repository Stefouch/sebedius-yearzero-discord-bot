const Util = require('../utils/Util');

class YZCombattant {

	constructor(data) {
		//if(!message) throw new Error('YZCombattant has no controller');
		/**
		 * The unique ID of this Combattant.
		 * @name YZCombattant#id
		 * @type {string}
		 * @readonly
		 */
		Object.defineProperty(this, 'id', {
			value: Symbol(Util.randomID()),
			enumerable: true,
		});

		/**
		 * Discord Message that asked for the creation of this Combattant.
		 * @type {Discord.Message}
		 */
		//this.message = message;
		//this.controller = message.author.id;

		this.name = data.name || 'Unnamed';
		this.hp = +data.hp || 2;
		this.armor = +data.armor || 0;
		this.speed = +data.speed || 1;
		this.hidden = data.hidden || false;
		this.status = YZCombattant.STATUSLIST[0];
		this.note = data.note || '';

		this._inits = data.inits;
		this._index = data.index;
		this._group = data.group;
	}

	/**
	 * @type {string[]}
	 * @readonly
	 */
	static get STATUSLIST() {
		return ['Healhty', 'Broken', 'Dead'];
	}
}

class YZCombattantGroup extends YZCombattant {

}

module.exports = YZCombattant; //{ YZCombattant, YZCombattantGroup };