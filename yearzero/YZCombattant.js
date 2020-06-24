const Util = require('../utils/Util');

module.exports = class YZCombattant {

	constructor(data) {
		if(!data.controller) throw new Error('YZCombattant has no controller');
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

		this.name = data.name || 'Unnamed';
		this.controller = data.controller;
		this.hp = +data.hp || 2;
		this.armor = +data.armor || 0;
		this.speed = +data.speed || 1;
		this.hidden = data.hidden || false;
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