const YZGenerator3 = require('../generators/YZGenerator3');
const YZRoll = require('./YZRoll');
const { YZMonster } = require('./YZObject');
const { rand, capitalize, clamp } = require('../utils/Util');

/**
 * A Year Zero Zone Sector.
 */
class YZZoneSector {
	/**
	 * @param {string} filename Filename containing the generator data
	 * @param {Object} [options={}] Options to provide
	 * @param {number} options.rotLevel Starting Rot Level
	 * @param {boolean} options.threatLevel Starting Threat Level
	 * @param {number} options.threatQty Quantity of threats to draw
	 * @param {boolean} options.atNight +3 Threat Level
	 * @param {boolean} options.hasNormalRuin With a normal ruin
	 * @param {boolean} options.hasIndustrialRuin With an industrial ruin
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
		this.rotLevel = options.rotLevel || this.data.rotLevel.random();

		/**
		 * Threat Level of the sector.
		 * @type {number} Between 0 and 13
		 */
		this.threatLevel = (options.threatLevel != undefined
			? clamp(options.threatLevel, 0, 10)
			: rand(0, 10))
			+ (options.atNight ? 3 : 0);

		/**
		 * The Threat Roll of the sector.
		 * @type {YZRoll}
		 */
		this.threatRoll = new YZRoll('myz').addBaseDice(this.threatLevel);

		/**
		 * List of finds in the sector.
		 * @type {Object}
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
		 * Code for the environment of the sector.
		 * @type {number}
		 */
		this.environmentType = this.data.environment.random();

		/**
		 * Environment of the sector.
		 * @type {string}
		 */
		this.environment = Object.keys(this.constructor.ENVIRONMENT_TYPES)[this.environmentType]
			.toLowerCase()
			.split('_')
			.map(s => capitalize(s))
			.join(' ');

		/**
		 * Mood element of the sector.
		 * @type {string}
		 */
		this.mood = this.data.mood.random();

		/**
		 * The ruins present in the sector.
		 * @type {string}
		 */
		this.ruins = {};
		if (this.hasRuin) {
			let ruin;
			if (this.hasNormalRuin) ruin = this.data.normalRuin.random();
			if (this.hasIndustrialRuin) ruin = this.data.industrialRuin.random();
			this.ruins = {
				name: ruin[0],
				description: ruin[1],
			};
		}

		/**
		 * Array of threats in the sector.
		 * @type {string[]}
		 */
		this.threats = [];

		this._rollThreatLevel(options.threatQty);
	}

	/**
	 * Type of the Rot Level.
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
	 * Wether the sector hides some normal ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasNormalRuin() {
		return this.environmentType >= this.constructor.ENVIRONMENT_TYPES.OVERGROWN_RUINS
			&& this.environmentType <= this.constructor.ENVIRONMENT_TYPES.UNSCATHED_RUINS;
	}

	/**
	 * Wether the sector hides some industrial ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasIndustrialRuin() {
		return this.environmentType === this.constructor.ENVIRONMENT_TYPES.DERELICT_INDUSTRIES;
	}

	/**
	 * Wether the sector holds some ruins or not.
	 * @type {boolean}
	 * @readonly
	 */
	get hasRuin() {
		return this.hasNormalRuin || this.hasIndustrialRuin;
	}

	_rollThreatLevel(qty = 1) {
		if (this.threatRoll.baneCount > 0) {
			const table = this.data.threat.random();
			let threat = table.random();

			// Replaces the threat (string) with a YZMonster object
			// if equals a YZMonster ID.
			if (YZGenerator3.VARIABLE_REGEX.test(threat)) {
				const monsterID = threat.replace(
					YZGenerator3.VARIABLE_REGEX,
					(match, $1) => $1,
				);
				threat = YZMonster.get('MONSTERS', 'myz', monsterID.trim());
			}
			this.threats.push(threat);
		}
		this.finds.artifacts = this.threatRoll.successCount;
	}

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

module.exports = YZZoneSector;