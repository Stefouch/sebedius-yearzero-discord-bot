const { YZEmbed } = require('../utils/embeds');
const Job = require('../generators/ALIENJobGenerator');
const { random } = require('../utils/Util');
const { __ } = require('../lang/locales');

module.exports = {
	name: 'job',
	// aliases: ['aquest'],
	category: 'alien',
	description: 'cjob-description',
	guildOnly: false,
	args: true,
	usage: `<${Job.jobTypes.join('|')}> [-lang <language_code>]`,
	async run(args, ctx) {
		// Parses arguments.
		const argv = require('yargs-parser')(args, {
			string: ['lang'],
			alias: {
				lang: ['lng', 'language'],
			},
			default: {
				lang: null,
			},
			configuration: ctx.bot.config.yargs,
		});
		const lang = await ctx.bot.getValidLanguageCode(argv.lang, ctx);

		if (!argv._.length) return ctx.reply(__('cjob-specify-type', lang));

		let type = '';

		if (/^(cargo|cargorun|cargo run)$/i.test(argv._[0])) { type = 'cargo'; }
		else if (/^(mil|mill|military|militarymission|military mission)$/i.test(argv._[0])) { type = 'mil'; }
		else if (/^(expe|exped|expedition)$/i.test(argv._[0])) { type = 'expe'; }
		else {
			type = random(Job.jobTypes);
		}
		// else return ctx.reply('Please specify a correct job type: `cargo`, `mil` or `expe`');

		const j = new Job(type, lang);
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
		let rdesc = `• $ ${j.creditReward}.000,00 ${__('alien-dollars', lang)}`;
		job.rewards.forEach(reward => {
			rdesc += `\n• ${reward}`;
		});

		embed.addField(`:moneybag: ${__('reward', lang)}`, rdesc);

		// COMPLICATION(S)
		job.complications.forEach(compl => {
			embed.addField(
				`⚠️ ${__('cjob-possible-complication', lang)}: **${compl.name}**`,
				compl.description,
			);
		});

		return ctx.send(embed);
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