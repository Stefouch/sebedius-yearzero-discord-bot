const fs = require('fs');
const YZGenerator2 = require('../generators/YZGenerator2');
const { KEEP_CAPITALIZATION_LANGS } = require('../utils/constants');
const { RollParser } = require('../utils/RollParser');
const Util = require('../utils/Util');
const { __ } = require('../lang/locales');

// Loading the available scrap.
let nameList;
try {
	const listContent = fs.readFileSync('./gamedata/alien/planet-names.list', 'utf8');
	nameList = listContent.split('\n');
	console.log('[+] - Name list loaded: data/alien/planet-names.list');
}
catch(error) {
	console.error('[ERROR] - Unable to load the planet-names list:', error);
}

const ROCKY_PLANET = 'rocky';
const ICY_PLANET = 'icy';
const GASGIANT = 'gasgiant';
const GASGIANT_MOON = 'gasgiant-moon';
const ASTEROID_BELT = 'asteroid-belt';
const INDEPENDENT_CORE_SYSTEM_COLONIES = 0;
const AMERICAN_OR_ANGLOJAPANESE_ARM = 1;
const PREFIXES = ['LV', 'MT', 'RF', 'GE', 'EX', 'NM', 'DT', 'MT', 'MK', 'LK', 'JN'];

class ALIENWorldGenerator extends YZGenerator2 {

	constructor(
		type,
		colonized = false,
		location = AMERICAN_OR_ANGLOJAPANESE_ARM,
		colonyName = '',
		language = 'en'
	) {
		const WorldData = require(`../gamedata/alien/planet-generator.${language}.json`);
		super(WorldData, language);

		this.name = !colonyName ? Util.random(nameList) : colonyName;
		this.name = this.name.replace('\r', '');
		this.code = Util.random(PREFIXES) + '-'
			+ Util.zeroise(Util.rand(1, 999), 3);

		// PLANET SIZE
		let sizeMod = 0;
		if (type === ICY_PLANET) sizeMod = -2;
		else if (type === GASGIANT_MOON) sizeMod = -4;

		const sizeData = super.get('size', sizeMod);
		this.size = +sizeData[0];
		this.gravity = +sizeData[1];

		// ATMOSPHERE
		let atmosMod = 0;
		if (this.size <= 4000) atmosMod = -6;
		else if (this.size <= 7000) atmosMod = -2;

		this.atmosphere = super.get('atmosphere', atmosMod);

		// TEMPERATURE
		let celciusMod = 0;
		if (type === ICY_PLANET) celciusMod = -12;
		else if (this.atmosphere === 'Thin') celciusMod = -4;
		else if (this.atmosphere === 'Dense') celciusMod = +1;
		else if (this.atmosphere === 'Corrosive'
			|| this.atmosphere === 'Infiltrating') celciusMod = +6;

		const celciusData = super.get('temperature', celciusMod);
		this.starOrder = +celciusData[0];
		this.temperature = {
			name: celciusData[1],
			description: celciusData[2],
		};

		// SWITCHING PLANET TYPE
		if (type === ROCKY_PLANET && this.temperature.name === 'Frozen') type = ICY_PLANET;

		// GEOSPHERE
		let geoMod = 0;
		if (!this.atmosphere) geoMod = -12;
		else if (this.atmosphere === 'Thin'
			|| this.atmosphere === 'Dense'
			|| this.atmosphere === 'Corrosive'
			|| this.atmosphere === 'Infiltrating') geoMod = -4;
		if (this.temperature.name === 'Hot') geoMod += -2;
		else if (this.temperature.name === 'Burning') geoMod += -4;
		else if (this.temperature.name === 'Frozen') geoMod += -2;

		const geoData = super.get('geosphere', geoMod);
		this.geosphere = {
			name: geoData[0],
			description: geoData[1],
		};

		// TERRAIN
		this.terrain = null;
		if (type === ROCKY_PLANET) {
			let terrainMod = 0;
			if (this.geosphere.name === 'Desert') terrainMod = -3;
			else if (this.geosphere.name === 'Arid') terrainMod = -2;
			else if (this.geosphere.name === 'Wet') terrainMod = +2;
			else if (this.geosphere.name === 'Water') terrainMod = +3;
			if (this.temperature.name === 'Frozen') terrainMod += -2;

			this.terrain = super.get('terrain-rocky', terrainMod);
		}
		else if (type === ICY_PLANET) {
			this.terrain = super.get('terrain-icy');
		}
		else if (type === GASGIANT) {
			this.terrain = super.get('gasgiant');
			this.moons = Util.rand(1, 6) + 4;
			// const moonsQty = Util.rand(1, 6) + 4;
			// this.moons = [];
			// for (let i = 0; i < moonsQty; i++) {
			// 	this.moons.push(new ALIENWorldGenerator(GASGIANT_MOON));
			// }
		}
		else if (type === ASTEROID_BELT) {
			this.terrain = super.get('asteroid-belt');
		}

		// COLONY
		this.colony = null;
		if (colonized) {
			this.colony = {};

			// COLONY SIZE
			let coloSizeMod = 0;
			if (this.atmosphere.name === 'Breathable') coloSizeMod = +1;
			else if (this.atmosphere.name === 'Corrosive'
				|| this.atmosphere.name === 'Infiltrating') coloSizeMod = -2;
			if (this.size <= 4000) coloSizeMod += -3;

			const coloSizeData = super.get('colony', coloSizeMod);
			this.colony.size = coloSizeData[0];
			this.colony.population = RollParser.parseAndRoll(coloSizeData[1]);
			this.colony.population *= coloSizeData[2];

			// COLONY MISSIONS
			const coloMissionQty = Math.max(1, RollParser.parseAndRoll(coloSizeData[3]));
			let coloMissionMod = 0;
			if (this.atmosphere.name === 'Breathable') coloMissionMod = +1;
			else if (this.atmosphere.name === 'Toxic'
				|| this.atmosphere.name === 'Corrosive'
				|| this.atmosphere.name === 'Infiltrating') coloMissionMod = -6;
			if (this.colony.size === 'Start-Up') coloMissionMod += -1;
			else if (this.colony.size === 'Established') coloMissionMod += +4;

			this.colony.missions = new Set();
			for (let i = 0; i < coloMissionQty; i++) {
				this.colony.missions.add(super.get('colony-mission', coloMissionMod));
			}

			// COLONY ALLEGIANCE
			this.colony.allegiance = super.get('colony-allegiance')[location];

			// ORBIT
			let orbitMod = 0;
			if (this.colony.size === 'Young') orbitMod = +1;
			else if (this.colony.size === 'Established') orbitMod = +2;

			this.orbits = super.getAll('orbit', orbitMod);

			// FACTIONS
			this.colony.factions = {};

			const factionsQtyData = super.get('colony-factions-qty');
			const factionsQty = RollParser.parseAndRoll(factionsQtyData[0]);
			let factionsStr = factionsQtyData[1];
			if (factionsQtyData[0] === 'D6') factionsStr = factionsStr.replace('D6', factionsQty);

			this.colony.factions.qty = factionsQty;
			this.colony.factions.strengths = factionsStr;

			this.colony.factions.types = [];
			for (let i = 0; i < factionsQty; i++) {
				this.colony.factions.types.push(super.get('colony-factions'));
			}

			// SCENARIO HOOKS
			this.colony.hook = super.get('hook');
		}
		// END OF GENERATION
		this.type = type;
		this.data = {};
		delete this.data;
	}

	get hasColony() { return (this.colony !== null); }
	get factionsQty() {
		if (!this.hasColony) return 0;
		return this.colony.factions.qty;
	}
	get title() {
		if (this.type === GASGIANT) {
			return `${this.code} (${__('gasgiant', this.lang)})`;
		}
		else if (this.type === ASTEROID_BELT) {
			return __('asteroid-belt', this.lang);
		}
		else {
			return `${this.code} "${this.name}" (${this.geosphere.name + (this.geosphere.name.endsWith(' ') ? __('world', this.lang) : __('world', this.lang).toLowerCase())})`; // If geosphere name doesn't end with a space it's supposed to be a concatenated word and World has to be lowercase.
		}
	}
	get description() {
		if (this.type === GASGIANT) {
			return `${this.size} Km, ${this.gravity} G, ${this.temperature.name} (${this.temperature.description})`
				+ `\n ${__('galienworldgenerator-moons', this.lang)}`.replace('{will_be_replaced}', this.moons);
		}
		else if (this.type === ASTEROID_BELT) {
			return `${this.terrain}.`;
		}
		else {
			const desc = `${this.size} Km, ${this.gravity} G,  ${this.temperature.name} (${this.temperature.description})`
				+ `\n${this.atmosphere} ${KEEP_CAPITALIZATION_LANGS.includes(this.lang) ? __('atmosphere', this.lang) : __('atmosphere', this.lang).toLowerCase()}. ${this.terrain}.`
				+ `\n${this.geosphere.description}.`;
			return desc;
		}
	}
}

module.exports = ALIENWorldGenerator;