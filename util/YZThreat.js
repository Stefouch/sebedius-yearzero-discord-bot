const YZCharacter = require('./YZCharacter');

class YZThreat extends YZCharacter {
	constructor(data) {
		super(data);

		/**
		 * The initial malus to any "Know the Zone" skill roll.
		 * @type {number} Default is 0
		 */
		this.ktzMalus = data.ktzMalus || 0;
	}
}

module.exports = YZThreat;