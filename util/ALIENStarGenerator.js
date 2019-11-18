const YZGenerator2 = require('./YZGenerator2');
const StarData = require('../data/star-generator.json');
const { RollParser } = require('./RollParser');
const Util = require('./Util');

/**
 * A Year Zero Star
 * For ALIEN rpg.
 */
class ALIENStarGenerator extends YZGenerator2 {
	/**
	 * Defines a star.
	 * @param {*} data The raw data of the Star.
	 */
	constructor() {
		super(StarData);

		this.name = super.get('type');
	}
}

module.exports = ALIENStarGenerator;