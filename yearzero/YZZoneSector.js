const YZGenerator3 = require('../generators/YZGenerator3');
const YZRoll = require('./YZRoll');
const { YZMonster } = require('./YZObject');
const { rand, capitalize, clamp, modifOrSet, random } = require('../utils/Util');

/**
 * A Mutant: Year Zero Zone Sector.
 */
class YZZoneSector {
	/**
	 * @param {string} filename Filename containing the generator data
	 * @param {Object} [options={}] Options to provide
	 * @param {number} options.rotLevel Starting Rot Level
	 * @param {boolean} options.threatLevel Starting Threat Level
	 * @param {number} options.threatQty Quantity of threats to draw
	 * @param {boolean} options.atNight +3 Threat Level
	 * @param {boolean} options.withRuins With a ruins
	 */
	constructor(filename, options = {}) {
		this.filename = filename;
		this.data = YZGenerator3.parse(filename);

		/**
		 * Rot Level of the sector.
		 * @type {number} Between 0 and 3
		 * * 0 = Rot Oasis
		 * * 1 = Weak Rot
		 * * 2 = Strong Rot
		 * * 3 = Rot Hotspot
		 */
		this.rotLevel = options.rotLevel != undefined
			? clamp(options.rotLevel, 0, 3)
			: this.data.rotLevel.random();

		/**
		 * Threat Level of the sector.
		 * @type {number} Between 0 and 13
		 */
		this.threatLevel = rand(1, 10);

		if (options.threatLevel != undefined) {
			this.threatLevel = clamp(
				modifOrSet(options.threatLevel, this.threatLevel),
				0, 10,
			);
		}
		if (options.atNight) this.threatLevel += 3;

		/**
		 * The Threat Roll of the sector.
		 * @type {YZRoll}
		 */
		this.threatRoll = new YZRoll('myz').addBaseDice(this.threatLevel);

		/**
		 * List of finds in the sector.
		 * @type {YZZoneSectorFinds}
		 *
		 * @typedef {Object} YZZoneSectorFinds
		 * @property {number} bullets
		 * @property {number} grub
		 * @property {number} water
		 * @property {number} artifacts
		 */
		this.finds = {
			bullets: rand(1, 6),
			grub: rand(1, 6),
			water: rand(1, 6),
			artifacts: 0,
		};

		/**
		 * Environment of the sector.
		 * @type {YZZoneSectorEnvironment}
		 *
		 * @typedef {Object} YZZoneSectorEnvironment
		 * @property {string} id
		 * @property {string} name
		 */
		this.environment = this.data.environment.random();

		/**
		 * Mood element of the sector.
		 * @type {string}
		 */
		this.mood = this.data.mood.random();

		/**
		 * The ruins present in the sector.
		 * @type {YZZoneSectorRuin}
		 *
		 * @typedef {Object} YZZoneSectorRuin
		 * @property {string} type The ruins' type
		 * @property {string} name The ruins' name
		 * @property {string} description The ruins' description
		 * @property {string} icon (readonly)
		 */
		this.ruin = {};

		if (this.hasNormalRuin || this.hasIndustrialRuin || options.withRuins) {
			let ruinTable;
			if (this.hasIndustrialRuin) ruinTable = this.data.industrialRuin;
			else if (options.withRuins) ruinTable = random([this.data.normalRuin, this.data.industrialRuin]);
			else ruinTable = this.data.normalRuin;

			const rn = ruinTable.random();

			this.ruin = {
				type: `${ruinTable.id}`,
				name: rn[0],
				description: rn[1],
				// get icon() { return YZZoneSector.ICONS.RUINS[this.type]; },
			};
		}

		/**
		 * Array of threats in the sector.
		 * @type {Set<YZZoneSectorThreat>}
		 *
		 * @typedef {Object} YZZoneSectorThreat
		 * @property {string|YZMonster} value Monster's name or YZMonster object
		 * @property {string} type (table.id)
		 * @property {string} icon (readonly)
		 */
		this.threats = new Set();

		// Performs the Threat Roll.
		this._patchThreatRoll(options.threatQty);
	}

	/**
	 * Verbose type of the Rot Level.
	 * @type {string}
	 * @readonly
	 */
	get rotType() {
		return Object.keys(this.constructor.ROT_LEVELS)[this.rotLevel]
			.toLowerCase()
			.split('_')
			.map(s => capitalize(s))
			.join(' ');
	}

	/**
	 * Whether there is still something valuable to find in this sector.
	 * @type {boolean}
	 * @readonly
	 */
	get hasFinds() {
		return Object.values(this.finds)
			.map(n => n > 0)
			.reduce((a, b) => a || b, false);
	}

	/**
	 * Whether there is an artifact to find in the sector or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasArtifact() {
		return this.finds.artifacts > 0;
	}

	/**
	 * Wether the sector holds some ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasRuin() {
		return this.ruin.name !== undefined;
	}

	/**
	 * Wether the sector hides some normal ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasNormalRuin() {
		return this.constructor.ENVIRONMENT_TYPES[this.environment.id]
			>= this.constructor.ENVIRONMENT_TYPES.OVERGROWN_RUINS
			&& this.constructor.ENVIRONMENT_TYPES[this.environment.id]
			<= this.constructor.ENVIRONMENT_TYPES.UNSCATHED_RUINS;
	}

	/**
	 * Wether the sector hides some industrial ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasIndustrialRuin() {
		return this.environment.id === 'DERELICT_INDUSTRIES';
	}

	_patchThreatRoll(modifier) {
		// Adds artifacts, if any.
		if (this.hasRuin) this.finds.artifacts = this.threatRoll.successCount;

		// Counts quantity of threats.
		// Max: 6.
		let qty = this.threatRoll.baneCount;
		if (modifier != undefined) qty = clamp(modifOrSet(modifier, qty), 0, 5);

		// Adds threats, if any.
		for (; qty > 0; qty--) {
			const table = this.data.threat.random();
			const threat = {
				type: `${table.id}`,
				value: table.random(),
				get icon() { return YZZoneSector.ICONS.THREAT[this.type]; },
			};

			// Replaces the threat (string) with a YZMonster object
			// if equals a YZMonster ID.
			if (YZGenerator3.VARIABLE_REGEX.test(threat.value)) {
				const monsterID = threat.value.replace(YZGenerator3.VARIABLE_REGEX, (match, $1) => $1);
				threat.value = YZMonster.get('MONSTERS', 'myz', monsterID.trim());
			}
			this.threats.add(threat);
		}
	}

	toString() { return `YZZoneSector [ ${this.environment.name} ]`; }
	valueOf() { return this.threatLevel; }
}

YZZoneSector.ROT_LEVELS = {
	ROT_OASIS: 0,
	WEAK_ROT: 1,
	STRONG_ROT: 2,
	ROT_HOTSPOT: 3,
};

YZZoneSector.ENVIRONMENT_TYPES = {
	THICK_WOOD: 1,
	SCRUBLANDS: 2,
	MARSHLANDS: 3,
	DEAD_WOODS: 4,
	ASH_DESERT: 5,
	HUGE_CRATER: 6,
	GLASIFIED_FIELD: 7,
	OVERGROWN_RUINS: 8,
	CRUMBLING_RUINS: 9,
	DECAYED_RUINS: 10,
	UNSCATHED_RUINS: 11,
	DERELICT_INDUSTRIES: 12,
	SETTLEMENT: 12 + 1,
};

YZZoneSector.ICONS = {
	THREAT: {
		HUMANOID: '👥',
		MONSTER: '👽',
		PHENOMENON: '🌀',
	},
	// RUIN: {
	// 	RUIN_NORMAL: '',
	// 	RUIN_INDUSTRIAL: '🏭',
	// },
	// FINDS: {
	// 	GRUB: '🥫',
	// 	WATER: '💧',
	// 	BULLETS: '',
	// 	ARTIFACTS: '',
	// },
};

module.exports = YZZoneSector;