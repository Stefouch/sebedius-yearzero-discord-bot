const YZGenerator2 = require('./YZGenerator2');
const AlienWorld = require('./ALIENWorldGenerator');
const Util = require('../utils/Util');

/**
 * A Year Zero Star
 * For Alien RPG.
 */
class ALIENStarGenerator extends YZGenerator2 {
	/**
	 * Defines a star.
	 * @param {string} language Language code of the language to be used
	 */
	constructor(language = 'en') {
		const StarData = require(`../gamedata/alien/star-generator.${language}.json`);
		super(StarData, language);

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

		// CELESTIAL OBJECTS
		const planets = [];

		for (let i = 0; i < gasGiantQty; i++) {
			planets.push(new AlienWorld('gasgiant', false, AlienWorld.AMERICAN_OR_ANGLOJAPANESE_ARM, '', language));
		}
		for (let i = 0; i < rockyPlanetQty; i++) {
			planets.push(new AlienWorld('rocky', true, AlienWorld.AMERICAN_OR_ANGLOJAPANESE_ARM, '', language));
		}
		for (let i = 0; i < icyPlanetQty; i++) {
			planets.push(new AlienWorld('icy', false, AlienWorld.AMERICAN_OR_ANGLOJAPANESE_ARM, '', language));
		}
		for (let i = 0; i < beltQty; i++) {
			planets.push(new AlienWorld('asteroid-belt', false, AlienWorld.AMERICAN_OR_ANGLOJAPANESE_ARM, '', language));
		}

		// SORTING CELESTIAL OBJECTS
		this.orbit = { inner: new Set(), habitable: new Set(), outer: new Set() };

		for (const planet of planets) {
			if (planet.starOrder <= 1) this.orbit.inner.add(planet);
			else if (planet.starOrder === 2) this.orbit.inner.add(planet);
			else if (planet.starOrder === 4) this.orbit.outer.add(planet);
			else if (planet.starOrder >= 5) this.orbit.outer.add(planet);
			else this.orbit.habitable.add(planet);
		}

		this.data = {};
		delete this.data;

		// console.log(this);
	}

	get code() { return this.spectral.code + this.type.code; }
	get name() { return `${this.type.name} (${this.spectral.name})`; }
	get orbitInnerSize() { return this.orbit.inner.size; }
	get orbitOuterSize() { return this.orbit.outer.size; }
	get orbitHabSize() { return this.orbit.habitable.size; }
	get orbitSize() {
		return this.orbitInnerSize + this.orbitHabSize + this.orbitOuterSize;
	}
}

module.exports = ALIENStarGenerator;