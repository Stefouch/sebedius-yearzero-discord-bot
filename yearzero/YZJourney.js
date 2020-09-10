const YZGenerator3 = require('../generators/YZGenerator3');
const { random } = require('../utils/Util');

/**
 * A Forbidden Lands Journey.
 */
class YZJourney {
	/**
	 * @param {string} filename Filename containing the generator data
	 * @param {Object} [options={}] Options to provide
	 * @param {string} options.season The current season (default is SPRING)
	 * @param {string} options.quarterDay The current Quarter of the Day (default is DAY)
	 */
	constructor(filename, options = {}) {
		this.filename = filename;
		this.data = YZGenerator3.parse(filename);

		/**
		 * The current Season of Year.
		 * @type {string}
		 * @see {YZJourney.SEASONS}
		 */
		this.season = 'spring';

		if (options.season) {
			if (Object.keys(this.constructor.SEASONS).includes(options.season.toUpperCase())) {
				this.season = options.season.toLowerCase();
			}
		}

		/**
		 * The current Quarter of Day.
		 * @param {string}
		 * @see {YZJourney.QUARTER_DAYS}
		 */
		this.quarterDay = 'day';

		if (options.quarterDay) {
			if (Object.keys(this.constructor.QUARTER_DAYS).includes(options.quarterDay.toUpperCase())) {
				this.quarterDay = options.quarterDay.toLowerCase();
			}
		}
	}

	get dayCode() {
		return this.constructor.SEASONS[this.season.toUpperCase()]
			+ this.constructor.QUARTER_DAYS[this.quarterDay.toUpperCase()];
	}

	get inDaylight() {
		return this.constructor.DAYLIGHT[this.dayCode];
	}

	get inDarkness() {
		return !this.inDaylight;
	}

	get dayIcon() {
		return this.inDaylight ? '☀️' : '🌘';
	}

	mishap(activity) {
		const activityFlag = Object.keys(this.constructor.Activities)
			.find(a => this.constructor.Activities[a] === activity);

		if (!activityFlag) throw new TypeError(`YZJourney - Unknown activity "${activity}"`);

		const mishap = this.constructor.Mishaps[activityFlag];

		if (!mishap) return false;

		const mishapTable = this.data[mishap];

		if (!mishapTable) throw new ReferenceError(`YZJourney - Activity mishap table NOT FOUND: "${mishap}"`);

		return mishapTable.random();
	}

	getDescription() {
		return '<description>';
	}

	getReactionsDescription() {
		const str = `${this.constructor.MishapIcons.LEAD_THE_WAY} : Leading the Way`
			+ `\n${this.constructor.MishapIcons.MAKE_CAMP} : Making Camp`
			+ `\n${this.constructor.MishapIcons.FORAGE} : Foraging`
			+ `\n${this.constructor.MishapIcons.HUNT} : Hunting`
			+ `\n${this.constructor.MishapIcons.FISH} : Fishing`
			+ `\n${this.constructor.MishapIcons.SEA_TRAVEL} : Sea Travelling`;

		return str;
	}
}

YZJourney.Activities = {
	HIKE: 'hike',
	LEAD_THE_WAY: 'leadTheWay',
	KEEP_WATCH: 'keepWatch',
	MAKE_CAMP: 'makeCamp',
	FORAGE: 'forage',
	HUNT: 'hunt',
	FISH: 'fish',
	REST: 'rest',
	SLEEP: 'sleep',
	EXPLORE: 'explore',
	SEA_TRAVEL: 'seaTravel',
};

YZJourney.Mishaps = {
	HIKE: null,
	LEAD_THE_WAY: 'leadingTheWayMishap',
	KEEP_WATCH: null,
	MAKE_CAMP: 'makingCampMishap',
	FORAGE: 'foragingMishap',
	HUNT: 'huntingMishap',
	FISH: 'fishingMishap',
	REST: null,
	SLEEP: null,
	EXPLORE: null,
	SEA_TRAVEL: 'seaTravelMishap',
};

YZJourney.MishapIcons = {
	HIKE: null,
	LEAD_THE_WAY: '🗺️',
	KEEP_WATCH: null,
	MAKE_CAMP: '⛺',
	FORAGE: '🍇',
	HUNT: '🏹',
	FISH: '🐟',
	REST: null,
	SLEEP: null,
	EXPLORE: null,
	SEA_TRAVEL: '⛵',
};

YZJourney.QUARTER_DAYS = {
	MORNING: 1,
	DAY: 2,
	EVENING: 3,
	NIGHT: 4,
};

YZJourney.SEASONS = {
	SPRING: 10,
	SUMMER: 20,
	AUTOMN: 30,
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
	AUTOMN: 1,
	WINTER: -2,
};

module.exports = YZJourney;