const Util = require('../utils/Util');

module.exports = class YZCombattant {

	constructor(data) {
		/**
		 * The unique ID of this Combattant.
		 * @name YZCombattant#id
		 * @type {string}
		 * @readonly
		 */
		Object.defineProperty(this, 'author', {
			value: Util.randomID(),
			enumerable: true,
		});

		this.name = data.name || 'Unnamed';
		this.hidden = data.hidden || false;
		this.controller = data.controller;
		this.group = data.group;
		this.speed = +data.speed || 1;
		this.hp = +data.hp || 2;
		this.armor = +data.armor || 0;
		this.status = YZCombattant.STATUSLIST[0];
		this.note = data.note || '';
	}

	set status(value) {
		if (YZCombattant.STATUSLIST.includes(value)) this.status = value;
	}

	/**
	 * @type {string[]}
	 * @readonly
	 */
	static get STATUSLIST() {
		return ['Healhty', 'Broken', 'Dead'];
	}
};