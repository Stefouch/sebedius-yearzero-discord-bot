const YZGenerator2 = require('./YZGenerator2');
const JobData = require('../data/alienjob-generator.json');
const CargoJobData = require('../data/alienjob-cargo-generator.json');
const MilJobData = require('../data/alienjob-mil-generator.json');
const ExpeJobData = require('../data/alienjob-expe-generator.json');
const { RollParser } = require('./RollParser');
const Util = require('./Util');

const JOB_TYPES = {
	cargo: CargoJobData,
	mil: MilJobData,
	expe: ExpeJobData,
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
		if (!JOB_TYPES.hasOwnProperty(jobType)) throw new Error('Not a valid job type: ' + jobType);

		const t = this.jobTypes.indexOf(jobType);
		this.title = this.jobNames[t];

		const data = super.get('job');
		this.type = data.type;
		this.destination = data.destination;
		this.complication = data.complication;
		this.reward = RollParser.parseAndRoll(data.reward);
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

		console.log(this);
	}

	get description() {
		return `${this.type} job ${Util.toLowerCase(this.destination)}`
			+	`\n**Reward:** ${this.reward}k credits`;
	}

	static get jobTypes() { return Object.keys(JOB_TYPES); }
	static get jobNames() { return ['Cargo Run', 'Military Mission', 'Expedition']; }
	static get contractorNames() { return ['Employer', 'Patron', 'Sponsor']; }
	static get destinationNames() { return ['Destination', 'Objective', 'Target Area']; }
	static get missionNames() { return ['Goods', 'Mission', 'Mission']; }
}

module.exports = ALIENJobGenerator;

class ALIENJobDescriptor extends YZGenerator2 {
	constructor(jobType, complication, extra) {
		super(JOB_TYPES[jobType]);

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
}