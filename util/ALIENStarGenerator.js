const YZGenerator2 = require('./YZGenerator2');
const CelestialObject = require('./ALIENWorldGenerator');
const StarData = require('../data/star-generator.json');
// const { RollParser } = require('./RollParser');
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

		// STAR PARAMETERS
		const type = super.get('type');
		this.type = {
			name: type[0],
			code: type[1],
		};

		const spectral = super.get('spectral');
		this.spectral = {
			name: spectral[0],
			code: spectral[1],
		};

		// CELESTIAL OBJECTS QUANTITY
		let gasGiantQty = Util.rand(1, 6) - 1;
		let rockyPlanetQty = Util.rand(1, 6);
		let icyPlanetQty = Util.rand(1, 6) + 1;
		let beltQty = Util.rand(1, 6) - 3;

		if (this.type.code === 'IV') {
			gasGiantQty--;
			icyPlanetQty--;
			beltQty -= 2;
		}
		else if (this.type.code === 'DA') {
			gasGiantQty -= 4;
			rockyPlanetQty -= 3;
			beltQty -= 2;
		}
		else if (this.type.code === 'MV') { rockyPlanetQty -= 3; }
		else if (this.type.code === 'III') { icyPlanetQty--; }
		else if (this.type.code === 'AOV') { icyPlanetQty--; }
	}

	get code() { return this.spectral.code + this.type.code; }
	get name() { return `${this.spectral.name} ${this.type.name}`; }
}

module.exports = ALIENStarGenerator;