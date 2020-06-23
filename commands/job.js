const YZEmbed = require('../util/YZEmbed');
const Job = require('../util/ALIENJobGenerator');
const Util = require('../util/Util');

module.exports = {
	name: 'job',
	group: 'ALIEN rpg',
	description: 'Generates a random job for the ALIEN rpg.',
	// aliases: ['aquest'],
	guildOnly: false,
	args: true,
	usage: `<${Job.jobTypes.join('|')}>`,
	async execute(args, message, client) {
		if (!args.length) return message.reply('Please specify job type');

		let type = '';

		if (/^(cargo|cargorun|cargo run)$/i.test(args[0])) { type = 'cargo'; }
		else if (/^(mil|mill|military|militarymission|military mission)$/i.test(args[0])) { type = 'mil'; }
		else if (/^(expe|exped|expedition)$/i.test(args[0])) { type = 'expe'; }
		else {
			type = Util.random(Job.jobTypes);
		}
		// else return message.reply('Please specify a correct job type: `cargo`, `mil` or `expe`');

		const j = new Job(type);
		const job = j.job;
		const embed = new YZEmbed(j.title.toUpperCase(), j.description);

		// MISSION & PLOT-TWIST
		const mdesc = job.mission.description
			+ `\n**${j.plotTwist.name}:** ${j.plotTwist.description}`;
		embed.addField(
			`${getMissionIcon(job.type)} ${job.missionTitle}: **${job.mission.name}**`,
			mdesc,
		);

		// DESTINATION
		embed.addField(
			`:rocket: ${job.destinationTitle}: **${job.destination.name}**`,
			job.destination.description,
		);

		// REWARD
		let rdesc = `• $ ${j.creditReward}.000,00 UA dollars`;
		job.rewards.forEach(reward => {
			rdesc += `\n• ${reward}`;
		});

		embed.addField(':moneybag: Reward', rdesc);

		// COMPLICATION(S)
		job.complications.forEach(compl => {
			embed.addField(
				`:warning: Possible Complication: **${compl.name}**`,
				compl.description,
			);
		});

		return message.channel.send(embed);
	},
};

function getMissionIcon(type) {
	const missionIcon = {
		cargo: ':package:',
		mil: ':dart:',
		expe: ':satellite:',
	};

	if (missionIcon.hasOwnProperty(type)) return missionIcon[type];
	else return ':anger:';
}