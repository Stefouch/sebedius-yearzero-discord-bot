const YZGenerator2 = require('./YZGenerator2');
const JobData = require('../gamedata/alien/alienjob-generator.json');
const CargoJobData = require('../gamedata/alien/alienjob-cargo-generator.json');
const MilJobData = require('../gamedata/alien/alienjob-mil-generator.json');
const ExpeJobData = require('../gamedata/alien/alienjob-expe-generator.json');
const { RollParser } = require('../utils/RollParser');

const JOB_TYPES_DATA = {
	cargo: CargoJobData,
	mil: MilJobData,
	expe: ExpeJobData,
};
const jobTitles = {
	cargo: 'Cargo Run',
	mil: 'Military Mission',
	expe: 'Expedition',
};
const contractorTitles = {
	cargo: 'Employer',
	mil: 'Patron',
	expe: 'Sponsor',
};
const destinationTitles = {
	cargo: 'Destination',
	mil: 'Objective',
	expe: 'Target Area',
};
const missionTitles = {
	cargo: 'Goods',
	mil: 'Mission',
	expe: 'Mission',
};

/**
 * An ALIEN Job.
 */
class ALIENJobGenerator extends YZGenerator2 {
	/**
	 * Defines a new Job for ALIEN RPG.
	 */
	constructor(jobType) {
		super(JobData);

		// Exits earlier if wrong jobType.
		if (!JOB_TYPES_DATA.hasOwnProperty(jobType)) throw new Error('Not a valid job type: ' + jobType);

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
			this.complication,
			this.extra,
		);
	}

	get title() {
		return `${this.job.mission.name} ${this.job.jobTitle}`;
	}

	get description() {
		return `${this.difficulty} job, ${this.destination}`
			+	`\n${this.job.contractorTitle}: ${this.job.contractor}`;
	}

	static get jobTypes() { return Object.keys(JOB_TYPES_DATA); }
}

module.exports = ALIENJobGenerator;

class ALIENJobDescriptor extends YZGenerator2 {
	constructor(jobType, complication, extra) {
		super(JOB_TYPES_DATA[jobType]);

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
	get jobTitle() { return jobTitles[this.type]; }
	get contractorTitle() { return contractorTitles[this.type]; }
	get destinationTitle() { return destinationTitles[this.type]; }
	get missionTitle() { return missionTitles[this.type]; }
}