const { Collection, BitField } = require('discord.js');
const YZGenerator3 = require('../generators/YZGenerator3');
const YZTerrainTypesFlags = require('./YZTerrainTypesFlags');

/**
 * A Forbidden Lands Journey.
 */
class YZJourney {
	/**
	 * @param {string} filename Filename containing the generator data
	 * @param {Object} [options={}] Options to provide
	 * @param {string} options.season The current season (default is SPRING), in UPPERCASE!
	 * @param {string} options.quarterDay The current Quarter of the Day (default is DAY), in UPPERCASE!
	 * @param {string|string[]} options.terrains Terrain types, in UPPERCASE!
	 * @param {boolean} options.weather Whether the weather should be rolled
	 */
	constructor(filename, options = {}) {
		this.filename = filename;
		this.data = YZGenerator3.parse(filename);

		/**
		 * The current Season of Year.
		 * @type {string}
		 * @see {YZJourney.SEASONS}
		 */
		this.season = options.season in this.constructor.SEASONS ? options.season : 'SPRING';

		/**
		 * The current Quarter of Day.
		 * @param {string}
		 * @see {YZJourney.QUARTER_DAYS}
		 */
		this.quarterDay = options.quarterDay in this.constructor.QUARTER_DAYS ? options.quarterDay : 'DAY';

		/**
		 * The types of terrain.
		 * @type {YZTerrainTypesFlags}
		 */
		this.terrain = new YZTerrainTypesFlags();

		// Applies Terrain from options, or uses default.
		if (typeof options.terrains === 'string') {
			if (options.terrains in YZTerrainTypesFlags.FLAGS) {
				this.terrain.add(options.terrains);
			}
		}
		else if (Array.isArray(options.terrains) && options.terrains.length) {
			for (const t of options.terrains) {
				if (t in YZTerrainTypesFlags.FLAGS) {
					this.terrain.add(t);
				}
			}
		}
		else {
			this.terrain.add('PLAINS');
		}

		/**
		 * The weather of the hex.
		 * @type {Object}
		 * @param {string[]} wind [ name, details ]
		 * @param {string[]} snowfall [ name, details ]
		 * @param {string[]} cold [ name, details ]
		 */
		this.weather = options.weather
			? { wind: this.data.weatherWind.random(),
				snowfall: this.data.weatherSnowfall.random(),
				cold: this.data.weatherCold.random() }
			: {};
	}

	/**
	 * Code of the day (used for the Daylight/Darkness cycle).
	 * @type {number}
	 * @readonly
	 */
	get dayCode() {
		return this.constructor.SEASONS[this.season]
			+ this.constructor.QUARTER_DAYS[this.quarterDay];
	}

	/**
	 * Whether the Journey is performed during daylight.
	 * @type {boolean}
	 * @readonly
	 */
	get inDaylight() {
		return this.constructor.DAYLIGHT[this.dayCode];
	}

	/**
	 * Whether the Journey is performed during darkness.
	 * @type {boolean}
	 * @readonly
	 */
	get inDarkness() {
		return !this.inDaylight;
	}

	/**
	 * Icon for Daylight or Darkness.
	 * @type {string}
	 * @readonly
	 */
	get dayIcon() {
		return this.inDaylight ? '☀️' : '🌘';
	}

	/**
	 * Whether some Weather is defined for this hex.
	 * @type {boolean}
	 * @readonly
	 */
	get hasWeather() {
		return 'wind' in this.weather;
	}

	/**
	 * Whether the terrain is a River or a Lake.
	 * @type {boolean}
	 * @readonly
	 */
	get isWater() {
		return this.terrain.any([
			YZTerrainTypesFlags.FLAGS.RIVER,
			YZTerrainTypesFlags.FLAGS.LAKE,
			YZTerrainTypesFlags.FLAGS.OCEAN,
			YZTerrainTypesFlags.FLAGS.SEA_ICE,
		]);
	}

	/**
	 * Whether the terrain is Impassable (High Mountains).
	 * @type {boolean}
	 * @readonly
	 */
	get isImpassable() {
		return this.terrain.has(YZTerrainTypesFlags.FLAGS.HIGH_MOUNTAINS);
	}

	/**
	 * Whether the terrain is Icy or Snowy (Bitter Reach).
	 * @type {boolean}
	 * @readonly
	 */
	get isIcy() {
		return this.terrain.any([
			YZTerrainTypesFlags.FLAGS.TUNDRA,
			YZTerrainTypesFlags.FLAGS.ICE_CAP,
			YZTerrainTypesFlags.FLAGS.BENEATH_THE_ICE,
			YZTerrainTypesFlags.FLAGS.ICE_FOREST,
			YZTerrainTypesFlags.FLAGS.SEA_ICE,
		]);
	}

	/**
	 * Foraging modifier.
	 * @type {number}
	 * @readonly
	 */
	get forageModifier() {
		return this.constructor.FORAGE_MODIFIER_BY_SEASON[this.season]
			+ this.terrain.modifiers.forage;
	}

	/**
	 * Hunting modifier.
	 * @type {number}
	 * @readonly
	 */
	get huntModifier() {
		return this.terrain.modifiers.hunt;
	}

	/**
	 * Draws a random mishap from the specified activity.
	 * @param {string} activity Activity flag
	 * @returns {string[2]|undefined} [ title, description ] or `false` if not found
	 */
	mishap(activity) {
		// Finds the correct activity.
		const acti = this.constructor.Activities.find((v, k) => {
			return k === activity.toUpperCase() || k.includes(activity.toUpperCase());
		});

		// Exits early if not found or has no Mishap table.
		if (!acti) return undefined;
		if (!acti.mishap) return undefined;

		// Gets the Mishap table.
		const mishapTable = this.data[acti.mishap];

		// Throws an error if the Mishap table wasn't found (should not happen).
		if (!mishapTable) throw new ReferenceError(`YZJourney - Activity mishap table NOT FOUND: "${acti.mishap}"`);

		// Draws and returns a random Mishap.
		return mishapTable.random();
	}

	/**
	 * Translates the name of an object in this class parsed data.
	 * @param {string} name name to translate
	 * @returns {string}
	 */
	_(name) {
		if (name in this.data) return this.data[name].name;
		return name;
	}
}

/**
 * @typedef {Object} Activity
 * @property {string} tag
 * @property {string|null} mishap
 * @property {string} icon
 * @property {Object} rules
 * @property {number} rules.limit
 * @property {string[]} rules.restricted
 */

/**
 * @type {Collection<string, Activity>}
 * @readonly
 * @constant
 */
YZJourney.Activities = new Collection(Object.entries({
	HIKE: {
		tag: 'hike',
		mishap: null,
		// Hiking boot emoji
		icon: '🥾',
	},
	LEAD_THE_WAY: {
		tag: 'leadTheWay',
		mishap: 'leadingTheWayMishaps',
		icon: '🗺️',
		rules: {
			limit: 1,
			restricted: ['KEEPWATCH'],
		},
	},
	KEEP_WATCH: {
		tag: 'keepWatch',
		mishap: null,
		icon: '👁️',
		rules: {
			limit: 1,
			restricted: ['LEADTHEWAY'],
		},
	},
	MAKE_CAMP: {
		tag: 'makeCamp',
		mishap: 'makingCampMishaps',
		icon: '⛺',
		rules: {
			restricted: ['HIKE'],
		},
	},
	FORAGE: {
		tag: 'forage',
		mishap: 'foragingMishaps',
		icon: '🍒',
		rules: {
			restricted: ['HIKE'],
		},
	},
	HUNT: {
		tag: 'hunt',
		mishap: 'huntingMishaps',
		icon: '🏹',
		rules: {
			restricted: ['HIKE'],
		},
	},
	FISH: {
		tag: 'fish',
		mishap: 'fishingMishaps',
		// icon: '🐟',
		icon: '🎣',
		rules: {
			restricted: ['HIKE'],
		},
	},
	REST: {
		tag: 'rest',
		mishap: null,
		icon: '☕',
		rules: {
			restricted: ['HIKE'],
		},
	},
	SLEEP: {
		tag: 'sleep',
		mishap: null,
		icon: '💤',
		rules: {
			restricted: ['HIKE'],
		},
	},
	EXPLORE: {
		tag: 'explore',
		mishap: null,
		// Compass emoji
		icon: '🧭',
		rules: {
			restricted: ['HIKE'],
		},
	},
	SEA_TRAVEL: {
		tag: 'seaTravel',
		mishap: 'seaTravelMishaps',
		// icon: '⛵',
		icon: '🌊',
	},
}));

YZJourney.QUARTER_DAYS = {
	MORNING: 1,
	DAY: 2,
	EVENING: 3,
	NIGHT: 4,
};

YZJourney.SEASONS = {
	SPRING: 10,
	SUMMER: 20,
	AUTUMN: 30,
	WINTER: 40,
};

YZJourney.DAYLIGHT = {
	11: true,
	12: true,
	13: false,
	14: false,
	21: true,
	22: true,
	23: true,
	24: false,
	31: true,
	32: true,
	33: false,
	34: false,
	41: false,
	42: true,
	43: false,
	44: false,
};

YZJourney.FORAGE_MODIFIER_BY_SEASON = {
	SPRING: -1,
	SUMMER: 0,
	AUTUMN: +1,
	WINTER: -2,
};

module.exports = YZJourney;

class WeatherFlags extends BitField {}
WeatherFlags.FLAGS = {
	WIND_LIGHT_BREEZE: 1 << 1,
	WIND_STRONG_WIND: 1 << 2,
	WIND_STORM: 1 << 3,
	SNOWFALL_NO_SNOW: 1 << 4,
	SNOWFALL_LIGHT_FLURRY: 1 << 5,
	SNOWFALL_HEAVY_SNOWFALL: 1 << 6,
	COLD_COLD: 1 << 7,
	COLD_BITTING: 1 << 8,
	COLD_TO_THE_BONE: 1 << 9,
};