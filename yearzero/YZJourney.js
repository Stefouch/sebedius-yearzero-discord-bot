const { Collection, BitField } = require('discord.js');
const YZGenerator3 = require('../generators/YZGenerator3');
const YZTerrainTypesFlags = require('./YZTerrainTypesFlags');
const Util = require('../utils/Util');
const { strToKebab, kebabToCamelCase } = require('../utils/Util');

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
	 * @param {boolean} options.fbr Whether to use Bitter Reach Mishaps
	 * @param {string} options.lang The language code to use (default is 'en')
	 */
	constructor(filename, options = {}) {
		this.filename = filename;
		this.data = YZGenerator3.parse(filename);

		this.lang = !options.lang ? 'en' : options.lang;

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
		 * Whether it uses Bitter Reach.
		 * @type {boolean}
		 */
		this.fbr = options.fbr ? true : false;

		/**
		 * The weather of the hex, detailed.
		 * @type {Object}
		 * @property {Object} wind
		 * @property {string} wind.id
		 * @property {string} wind.name
		 * @property {string} wind.effect
		 * @property {Object} snowfall
		 * @property {string} snowfall.id
		 * @property {string} snowfall.name
		 * @property {string} snowfall.effect
		 * @property {Object} cold
		 * @property {string} cold.id
		 * @property {string} cold.name
		 * @property {string} cold.effect
		 */
		this.weatherDetailed = {
			wind: null,
			snowfall: null,
			cold: null,
		};

		/**
		 * The weather of the hex, flags only.
		 * @type {WeatherFlags} BitField
		 */
		this.weather = new WeatherFlags();

		// Populates weather data.
		if (options.fbr) {
			for (const w in this.weatherDetailed) {
				const dataName = kebabToCamelCase(strToKebab(`weather ${w}`));
				let mod = 0;
				if (w === 'cold') {
					if (this.isWindy) mod++;
					else if (this.isStormy) mod += 2;
				}
				this.weatherDetailed[w] = this.data[dataName].random(mod);
				this.weather.add(this.weatherDetailed[w].id);
			}
		}
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
		return 'wind' in this.weather && this.weather.wind != null;
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
	 * Whether the weather's Wind is Strong Wind (Bitter Reach).
	 * @type {boolean}
	 * @readonly
	 */
	get isWindy() {
		return this.weather.has(WeatherFlags.FLAGS.WIND_STRONG_WIND);
	}

	/**
	 * Whether the weather's Wind is Storm (Bitter Reach).
	 * @type {boolean}
	 * @readonly
	 */
	get isStormy() {
		return this.weather.has(WeatherFlags.FLAGS.WIND_STORM);
	}

	/**
	 * Whether the weather's Snowfall is Light Flurry (Bitter Reach).
	 * @type {boolean}
	 * @readonly
	 */
	get isSnowyLight() {
		return this.weather.has(WeatherFlags.FLAGS.SNOWFALL_LIGHT_FLURRY);
	}

	/**
	 * Whether the weather's Snowfall is Heavy Snowfall (Bitter Reach).
	 * @type {boolean}
	 * @readonly
	 */
	get isSnowyHard() {
		return this.weather.has(WeatherFlags.FLAGS.SNOWFALL_HEAVY_SNOWFALL);
	}

	/**
	 * Leading the Way modifier.
	 * @type {number}
	 * @readonly
	 */
	get leadTheWayModifier() {
		let n = 0;
		if (this.inDarkness) n -= 2;
		if (this.isSnowyLight) n--;
		else if (this.isSnowyHard) n -= 2;
		return n;
	}

	/**
	 * Making Camp modifier.
	 * @type {number}
	 * @readonly
	 */
	get makeCampModifier() {
		let n = 0;
		if (this.isWindy) n--;
		else if (this.isStormy) n -= 2;
		return n;
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
	 * @param {string} name Name to translate
	 * @returns {string}
	 */
	_(name) {
		if (name in this.data) return this.data[name].name;
		return name;
	}
}

/**
 * A Journey's Activity.
 * @typedef {Object} Activity
 * @property {string} tag Codename of the activity
 * @property {string|null} mishap Codename of the Mishap table for the activity
 * @property {string} icon Emoji for the activity
 * @property {Object} rules Special rules for the activity // TODO
 * @property {number} rules.limit Maximum number of players for this activity.
 * @property {string[]} rules.restricted Flags of other
 */

/**
 * Collection of Activities and their properties.
 * K: Activity.FLAG, V: Properties
 * @type {Collection<string, Activity>}
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

/**
 * Numeric Quarter Day flags
 * @type {Object<string, number>}
 * @constant
 */
YZJourney.QUARTER_DAYS = {
	MORNING: 1,
	DAY: 2,
	EVENING: 3,
	NIGHT: 4,
};

/**
 * Numeric Seasons flags.
 * @type {Object<string, number>}
 * @constant
 */
YZJourney.SEASONS = {
	SPRING: 10,
	SUMMER: 20,
	AUTUMN: 30,
	WINTER: 40,
};

/**
 * Numeric combinations of Quarter Day and Season flags.
 * Used to determine the sunset.
 * @type {Object<number, boolean>}
 * @constant
 */
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

/**
 * Season's modifiers for foraging.
 * @type {Object<string, number>}
 * @constant
 */
YZJourney.FORAGE_MODIFIER_BY_SEASON = {
	SPRING: -1,
	SUMMER: 0,
	AUTUMN: +1,
	WINTER: -2,
};

module.exports = YZJourney;

/**
 * Data structure for Weather flags.
 * @extends {BitField}
 */
class WeatherFlags extends BitField {}
WeatherFlags.FLAGS = {
	WIND_LIGHT_BREEZE: 1 << 1,
	WIND_STRONG_WIND: 1 << 2,
	WIND_STORM: 1 << 3,
	SNOWFALL_NO_SNOW: 1 << 4,
	SNOWFALL_LIGHT_FLURRY: 1 << 5,
	SNOWFALL_HEAVY_SNOWFALL: 1 << 6,
	COLD_COLD: 1 << 7,
	COLD_BITING: 1 << 8,
	COLD_TO_THE_BONE: 1 << 9,
};