const { MessageEmbed } = require('discord.js');
const YZJourney = require('../yearzero/YZJourney');
const { capitalize, trimString } = require('../utils/Util');
const { SUPPORTED_LANGS } = require('../utils/constants');

module.exports = {
	name: 'journey',
	aliases: ['jou'],
	category: 'fbl',
	description: 'Performs a Forbidden Lands Journey.',
	moreDescriptions: [
		[],
	],
	guildOnly: false,
	args: false,
	usage: '[arguments...]',
	async run(args, ctx) {
		const argv = require('yargs-parser')(args, {
			string: ['lang', 'quarter', 'season'],
			alias: {
				lang: ['lng', 'language'],
				quarter: ['q', 'qd', 'quarterday'],
				season: ['s'],
			},
			default: {
				lang: 'en',
				quarter: undefined,
				season: undefined,
			},
			configuration: ctx.bot.config.yargs,
		});
		const title = argv._.length ? trimString(argv._.join(' '), 100) : '';
		const lang = Object.keys(SUPPORTED_LANGS).includes(argv.lang) ? argv.lang : 'en';
		const fileName = `./gamedata/fbl/fbl-journeys.${lang}.yml`;

		// Creates the Journey.
		const jou = new YZJourney(fileName, {
			quarterDay: argv.quarter,
			season: argv.season,
		});

		// Creates the Embed Message.
		const embed = new MessageEmbed({
			color: ctx.bot.config.color,
			title: `JOURNEY${title ? ` — ${title}` : ''}`,
			description: jou.getDescription(),
		});

		embed.addField(
			'Mishaps',
			jou.getReactionsDescription(),
			true,
		);

		embed.addField(
			'Characteristics',
			`Quarter Day: **${capitalize(jou.quarterDay)}**`
			+ `\nSeason: **${capitalize(jou.season)}**`
			+ `\n${jou.dayIcon} *${jou.inDaylight ? 'in daylight' : 'in darkness'}*`,
			true,
		);

		// Sends the message.
		return await ctx.send(embed);
	},
};