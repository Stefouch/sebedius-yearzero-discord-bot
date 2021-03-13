const YZGenerator2 = require('./YZGenerator2');
const { __ } = require('../lang/locales');
const { KEEP_CAPITALIZATION_LANGS } = require('../utils/constants');
const { RollParser } = require('../utils/RollParser');

const VALID_JOBS = ['cargo', 'mil', 'expe'];

/**
 * An ALIEN Job.
 */
class ALIENJobGenerator extends YZGenerator2 {
	/**
	 * Defines a new Job for ALIEN RPG.
	 */
	constructor(jobType, language = 'en') {
		const JobData = require(`../gamedata/alien/alienjob-generator.${language}.json`);
		super(JobData, language);

		// Exits earlier if wrong jobType.
		if (!VALID_JOBS.includes(jobType)) throw new Error(`${__('galienjobgenerator-invalid-type', this.lang)}: ` + jobType);

		let JobTypeData;
		switch (jobType)
		{
			case 'cargo':
				JobTypeData = require(`../gamedata/alien/alienjob-cargo-generator.${this.lang}.json`);
				break;
			case 'mil':
				JobTypeData = require(`../gamedata/alien/alienjob-mil-generator.${this.lang}.json`);
				break;
			case 'expe':
			default:
				JobTypeData = require(`../gamedata/alien/alienjob-expe-generator.${this.lang}.json`);
				break;
			}

		const data = super.get('job');
		this.difficulty = data.type;
		this.destination = data.destination;
		this.complication = data.complication;
		this.creditReward = RollParser.parseAndRoll(data.reward);
		this.extra = data.extra;

		const p = super.get('plot-twist');
		this.plotTwist = {
			name: p[0],
			description: p[1],
		};

		this.job = new ALIENJobDescriptor(
			jobType,
			JobTypeData,
			this.complication,
			this.extra,
			this.lang
		);
	}

	get title() {
		return `${this.job.jobTitle}: ${this.job.mission.name}`;
	}

	get description() {
		return `${this.difficulty}${KEEP_CAPITALIZATION_LANGS.includes(this.lang) && this.difficulty.endsWith(' ') ? __('alien-job', this.lang) : __('alien-job', this.lang).toLowerCase()}, ${this.destination}`	// Lowercase "job" if all lowercase language or concatenated word
			+	`\n${this.job.contractorTitle}: ${this.job.contractor}`;
	}

	static get jobTypes() { return VALID_JOBS; }
}

module.exports = ALIENJobGenerator;

class ALIENJobDescriptor extends YZGenerator2 {
	constructor(jobType, jobTypeData, complication, extra, language = 'en') {
		super(jobTypeData, language);

		// TYPE
		this.type = jobType;

		// CONTRACTOR
		this.contractor = super.get('contractor');

		// REWARDS
		this.rewards = [];
		if (extra > 0) {
			for (let i = 0; i < extra; i++) {
				this.rewards.push(super.get('reward'));
			}
		}

		// DESTINATION
		const d = super.get('destination');
		this.destination = {
			name: d[0],
			description: d[1],
		};

		// MISSION
		const m = super.get('mission');
		this.mission = {
			name: m[0],
			description: m[1],
		};

		// COMPLICATION
		this.complications = [];
		if (complication > 0) {
			for (let i = 0; i < complication; i++) {
				const c = super.get('complication');
				this.complications.push({
					name: c[0],
					description: c[1],
				});
			}
		}
	}
	get jobTitle() { return __(`alien-job-${this.type}`, this.lang); }
	get contractorTitle() { return __(`alien-job-contractor-${this.type}`, this.lang); }
	get destinationTitle() { return __(`alien-job-destination-${this.type}`, this.lang); }
	get missionTitle() { return __(`alien-job-mission-${this.type}`, this.lang); }
}