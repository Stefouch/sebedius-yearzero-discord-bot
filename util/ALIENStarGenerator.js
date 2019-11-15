const YZGenerator = require('./YZGenerator');
const StarData = require('../data/star-generator.json');
const { RollParser } = require('./RollParser');
const Util = require('./Util');

/**
 * A Year Zero Star
 * For ALIEN rpg.
 */
class ALIENStarGenerator extends YZGenerator {
	/**
	 * Defines a star.
	 * @param {*} data The raw data of the Star.
	 */
	constructor() {
		super(StarData);
	}
}

module.exports = ALIENStarGenerator;